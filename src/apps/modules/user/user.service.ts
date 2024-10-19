import { IGenaricRespons } from '../../../interfaces/common';
import httpStatus from 'http-status';
import { ApiError } from '../../../errors/ApiError';
import { ISearchUser, IUser, IUserLogin } from './user.interface';
import { User } from './user.model';
import bcrypt from 'bcrypt';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { IPaginationOpton } from '../../../interfaces/pagination';
import { HelperPagination } from '../../../helpers/paginationHelper';
import { SortOrder } from 'mongoose';
import { userSearchableFields } from './user.constant';
import { Types } from 'mongoose';
import { sendEmail } from './sendResetPass';
import jwt from 'jsonwebtoken';
import { handleMongoError } from '../../../helpers/HendelMongosError';

// ==============> all user business logic applies  this services page ================>

// -----> created a user business logic------>

const createdUser = async (user: IUser): Promise<IUserLogin | null> => {
  const { name, email, phone, ruler, gender, address, joinginDate, password } =
    user;

  // Hash the password
  const hashedPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round)
  );

  // Create user object with hashed password
  const userToCreate = {
    name,
    email,
    phone,
    ruler,
    gender,
    address,
    joinginDate,
    password: hashedPassword,
  };

  let createdUser = null;

  try {
    // Create the user in the database
    createdUser = await User.create(userToCreate);
  } catch (error) {
    // Handle database errors
    handleMongoError(error, 'already exists.', 'Please use a different');
    throw new ApiError(500, 'User creation failed', '');
  }

  if (!createdUser) {
    throw new Error('User creation failed');
  }

  const { id } = createdUser;

  // Create access token
  const accessToken = jwtHelpers.createToken(
    { id, name, email, phone, ruler, gender, address, joinginDate },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { id, name, email, phone, ruler, gender, address, joinginDate },
    config.jwt.secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

// -----> Login User business logic ------->
const loginUser = async (payload: IUser): Promise<IUserLogin | null> => {
  const MAX_LOGIN_ATTEMPTS = 10;
  const LOCK_TIME = 30 * 60 * 1000;

  const { email, password } = payload;

  // Check if the user exists
  const isUserExist = await User.findOne(
    { email },
    { email: 1, password: 1, failedLoginAttempts: 1, lockUntil: 1 }
  ).lean();

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist', '');
  }

  // Check if the account is locked
  if (isUserExist.lockUntil && isUserExist.lockUntil > Date.now()) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Account is locked until ${new Date(
        isUserExist.lockUntil
      ).toLocaleTimeString()}`,
      ''
    );
  }

  // Verify the password
  const isPasswordMatch = await bcrypt.compare(password, isUserExist.password);
  if (!isPasswordMatch) {
    const failedAttempts = (isUserExist.failedLoginAttempts || 0) + 1;

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      // Lock the account for 2 minutes
      await User.updateOne(
        { email },
        {
          failedLoginAttempts: failedAttempts,
          lockUntil: Date.now() + LOCK_TIME,
        }
      );
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        'Account locked. Too many failed attempts. Try again in 30 minite.',
        ''
      );
    } else {
      // Increment the failed attempts count
      await User.updateOne({ email }, { failedLoginAttempts: failedAttempts });
    }
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      'Incorrect password & maximum of 10 attempts',
      ''
    );
  }

  // If login is successful, reset failed login attempts and unlock the account
  await User.updateOne({ email }, { failedLoginAttempts: 0, lockUntil: null });

  // Get full user information
  const studentInfo = await User.findOne({ email });
  if (!studentInfo) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User information not found', '');
  }
  const { name, id, phone, ruler, gender, address, joinginDate } = studentInfo;

  // Create access token
  const accessToken = jwtHelpers.createToken(
    { id, name, email, phone, ruler, gender, address, joinginDate },
    config.jwt.secret as string,
    config.jwt.expires_in as string
  );

  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { id, name, email, phone, ruler, gender, address, joinginDate },
    config.jwt.secret as string,
    config.jwt.refresh_expires_in as string
  );

  // Return the tokens
  return {
    accessToken: accessToken ?? '',
    refreshToken: refreshToken ?? '',
  };
};

// -----> Refresh token business logic ------->
const refreshToken = async (token: string) => {
  let verifiedToken: string | JwtPayload | null = null;

  try {
    // Decode the token
    verifiedToken = jwt.decode(token);
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token', '');
  }

  // Ensure that verifiedToken is of type JwtPayload
  if (!verifiedToken || typeof verifiedToken === 'string') {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Invalid refresh token format',
      ''
    );
  }

  // Check if the user exists in the database
  const isUserExist = await User.findOne({
    email: (verifiedToken as JwtPayload)?.email, // Cast to JwtPayload
  });

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist', '');
  }

  const { id, name, email, phone, ruler, gender, address, joinginDate } =
    isUserExist || {};

  // Generate a new access token
  const newAccessToken = jwtHelpers.createToken(
    { id, name, email, phone, ruler, gender, address, joinginDate },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  // Generate a new refresh token
  const newRefreshToken = jwtHelpers.createToken(
    { id, name, email, phone, ruler, gender, address, joinginDate },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  // Return the new tokens
  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

// get filtering and searching user.
const getSearchingUser = async (
  filtering: Record<string, any>,
  paginationOption: IPaginationOpton
): Promise<IGenaricRespons<ISearchUser[]> | null> => {
  const { searchTerm, ...filtersData } = filtering;

  // Build the query conditions for the database
  const andConditions: Record<string, any>[] = [];

  // Add search condition
  if (searchTerm) {
    andConditions.push({
      $or: userSearchableFields?.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  // Add filtering conditions
  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  // Destructure pagination options
  const { page, limit, skip, sortBy, sortOrder } =
    HelperPagination.calculationPagination(paginationOption);

  // Define sort conditions
  const sortConditions: Record<string, SortOrder> = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }

  // Combine all conditions
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // Fetch the data from MongoDB
  const result = await User.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  // Count the total number of documents
  const total = await User.countDocuments();

  // Return the response with metadata and data
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// Update a User Ruler
const updateRuler = async (id: string, data: string): Promise<IUser | null> => {
  const objectId = new Types.ObjectId(id);

  // Check if the user exists
  const isExist = await User.findOne({ _id: objectId });

  if (!isExist) {
    throw new Error("User doesn't match Id");
  }

  // Update the ruler field
  const result = await User.findOneAndUpdate(
    { _id: objectId },
    { ruler: data },
    { new: true }
  );

  return result;
};
// Update a User Ruler
const singelUser = async (id: string): Promise<IUser | null> => {
  const objectId = Types.ObjectId.createFromHexString(id);

  // Check if the user exists
  const isExist = await User.findOne({ _id: objectId });

  if (!isExist) {
    throw new Error("User doesn't match Id");
  }

  return isExist;
};

//forgot password
const forgotPass = async (payload: any) => {
  // Check if the user exists

  const isExist = await User.findOne(
    { email: payload?.email },
    { id: 1, email: 1, name: 1 }
  );

  if (!isExist) {
    throw new Error("User doesn't registration Account!");
  }

  const createPasswordToken = await jwtHelpers.createForgotPasswordToken(
    {
      _id: isExist?._id,
    },
    config.jwt.secret as string,
    '15m'
  );

  const resetClientLink: string =
    config.resetPassLink + `${createPasswordToken}`;

  await sendEmail(
    isExist?.email,
    `
  <div>
   <h1>Hi! ${isExist?.name}</h1>
   <h5 style="font-size: 14px;">Your Reset Password Link Is : <a href="${resetClientLink}" style="color: blue; text-decoration: underline; font-size: 14px;">${resetClientLink?.slice(
      0,
      100
    )}...</a></h5>
   <p>Thank You ${isExist?.name}</p>
</div>


  `
  );
  return 'Check your Email!';
};

// Reset Password set
const resetPasswordSet = async (payload: {
  id: string;
  password: string;
  token: string;
}) => {
  const { id, password, token } = payload;

  // Check if the user exists
  const isUser = await User.findOne({ _id: id }, { _id: 1, email: 1, name: 1 });

  if (!isUser) {
    throw new Error("User doesn't match Id");
  }

  const result = await jwtHelpers.verifiedToken(
    token,
    config.jwt.secret as string
  );

  if (!result) {
    throw new Error("jwt token doesn't match!");
  }

  // ---- set new password ----

  const newPassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_round)
  );

  await User.updateOne({ _id: isUser?._id }, { password: newPassword });

  return '';
};

const updateRoll = async (id: string, data: string): Promise<IUser | null> => {
  const objectId = new Types.ObjectId(id);

  // Check if the user exists
  const isExist = await User.findOne({ _id: objectId });

  if (!isExist) {
    throw new Error("Book doesn't match Id");
  }
  // Check if the user exists
  const isExistRoll = await User.findOne({ studentRoll: data });

  if (isExistRoll) {
    throw new Error('This roll already Exists!');
  }

  // Update the ruler field
  const result = await User.findOneAndUpdate(
    { _id: objectId },
    { studentRoll: data },
    { new: true }
  );

  return result;
};

export const UserServices = {
  createdUser,
  loginUser,
  refreshToken,
  getSearchingUser,
  updateRuler,
  singelUser,
  resetPasswordSet,
  forgotPass,
  updateRoll,
};
