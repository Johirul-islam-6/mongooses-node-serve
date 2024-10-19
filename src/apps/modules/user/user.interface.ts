// import { Schema, model } from 'mongoose';

import { Model } from 'mongoose';

// Created User Modal-Schema property inferface
export type IUser = {
  name: string;
  email: string;
  password: string;
  phone: string;
  ruler: string;
  gender: string;
  address: string;
  joinginDate: string;
  failedLoginAttempts?: number; // Track the number of failed attempts
  lockUntil?: number; // Track the time until which the account is locked
};
// user Longin Token Interface
export type IUserLogin = {
  accessToken?: string;
  refreshToken?: string;
};

//get searching all user
export type ISearchUser = {
  name?: string;
  phone?: string;
  id?: string;
};
// update a user ruler
export type IupdateRuler = {
  ruler: string;
};

// Create a new Model type that knows about IUserMethods...
export type UserModel = Model<IUser, Record<string, unknown>>;
