import { Request, Response } from 'express';
import { catchAsync } from '../../../shared/catchAsync';
import { sendResponse } from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { UserServices } from './user.service';
import { ISearchUser, IUser, IUserLogin } from './user.interface';
import config from '../../../config';
import { queryPick } from '../../../shared/quaryPick';
import { User } from './user.model';
import { nodeCacsh } from '../../../app';

//01. created an user functionality =========>
const userCreated = catchAsync(async (req: Request, res: Response) => {
  const user = req.body;

  const result = await UserServices.createdUser(user);
  // Formating result returen value
  if (result !== null) {
    const { refreshToken, ...others } = result;

    // Set refresh token in cookies
    const cookiesOption = {
      secure: config.evn === 'production',
      httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookiesOption);

    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: others,
      message: 'Registration Completed',
    });
  } else {
    // Handle the case where login is unsuccessful
    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'Registration failed. Invalid credentials.',
    });
  }
});

//02. login a user email, password ==========>
const loginAuth = catchAsync(async (req: Request, res: Response) => {
  const loginData = req.body;

  const result = await UserServices.loginUser(loginData);

  if (result !== null) {
    const { refreshToken, ...others } = result;

    // Set refresh token in cookies
    const cookiesOption = {
      secure: config.evn === 'production',
      httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookiesOption);

    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: others,
      message: 'User Login successfully ',
    });
  } else {
    // Handle the case where login is unsuccessful
    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'Login failed. Invalid credentials.',
    });
  }
});
//03.refresh token genarate ==========>
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;
  const result = await UserServices.refreshToken(refreshToken);

  if (result !== null) {
    // Set refresh token in cookies
    const { refreshToken, ...others } = result;

    const cookiesOption = {
      secure: config.evn === 'production',
      httpOnly: true,
    };

    res.cookie('refreshToken', refreshToken, cookiesOption);

    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: others,
      message: 'User Login successfully ',
    });
  } else {
    // Handle the case where login is unsuccessful
    sendResponse<IUserLogin>(res, {
      statusCode: httpStatus.UNAUTHORIZED,
      success: false,
      message: 'token Create failed',
    });
  }
});

// 04. get all users functionality an business  logic ========>
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filtering = queryPick(req.query, [
    'searchTerm',
    'studentRoll',
    'phone',
    'email',
  ]);

  // pagination option property field
  const pagintionField = ['page', 'limit', 'sortBy', 'sortOrder'];

  // querypick is costom funtcion
  const paginationOption = queryPick(req.query, pagintionField);

  const result = await UserServices.getSearchingUser(
    filtering,
    paginationOption
  );

  sendResponse<ISearchUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result?.data,
    message: 'searching users successfully',
  });
});

// 05. forgot Password functaionality ===========>
const forgotPasswordController = async (req: Request, res: Response) => {
  const result = await UserServices.forgotPass(req.body);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result,
  });
};
// 06. reset Password set functaionality ===========>
const resetPasswordSetController = async (req: Request, res: Response) => {
  await UserServices.resetPasswordSet(req.body);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset Successfully',
  });
};
// 07. =======> get singel user functaionality ===========>
const singelUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await UserServices.singelUser(id);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: 'updated A user ruler ',
  });
};
// 08. =======> Update Ruler a user functaionality ===========>
const updateRuler = async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;
  const result = await UserServices.updateRuler(id, data.ruler);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: 'updated A user ruler ',
  });
};

// update student roll
const updateRoll = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const data = req.body;
  const result = await UserServices.updateRoll(id, data.studentRoll);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    data: result,
    message: 'Roll set up successfully',
  });
});

//10.  Delete a user
const Delete = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.id;

  const result = await User.deleteOne({ _id: studentId });
  nodeCacsh.del('profile');
  if (result.deletedCount === 1) {
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'User deleted successfully',
    });
  } else {
    sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      success: false,
      message: 'Book not found',
    });
  }
});

// exported there CreateUserController | Or imported there user.routes.ts file |
export const CreateUserController = {
  userCreated,
  getAllUsers,
  loginAuth,
  refreshToken,
  updateRuler,
  singelUser,
  forgotPasswordController,
  resetPasswordSetController,
  updateRoll,
  Delete,
};
