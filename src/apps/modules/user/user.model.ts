import { Schema, model } from 'mongoose';
import { IUser, UserModel } from './user.interface';
// import bcrypt from 'bcrypt';
// import config from '../../../config';

// ## This is User Schema Model document interface.

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    ruler: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    joinginDate: {
      type: String,
      required: true,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

//##  save before bcrypt the password
// userSchema.pre('save', async function (next) {
//   // eslint-disable-next-line @typescript-eslint/no-this-alias
//   const user = this;
//   this.password = await bcrypt.hash(
//     user.password,
//     Number(config.bcrypt_salt_round)
//   );

//   next();
// });

// ## this MongoDb collection file name therer create save user data
export const User = model<IUser, UserModel>('all_Users', userSchema);
