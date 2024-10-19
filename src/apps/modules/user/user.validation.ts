import { z } from 'zod';

// create a User zod validation
const createUserZodSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Full name is required',
      })
      .min(3, { message: 'Name must be at least 3 characters long' })
      .max(60, { message: 'Name cannot be longer than 60 characters' }),

    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({ message: 'Invalid email address' })
      .max(99, { message: 'Email cannot be longer than 99 characters' }),

    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, { message: 'Password must be at least 6 characters long' })
      .max(20, { message: 'Password cannot be longer than 20 characters' }),

    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .length(11, {
        message: 'Phone number must be exactly 11 characters long',
      }),

    ruler: z.string().optional(),
    gender: z
      .string({
        required_error: 'Gender is required',
      })
      .min(1, { message: 'Gender cannot be empty' })
      .max(15, { message: 'Gender cannot be longer than 15 characters' }),

    address: z
      .string({
        required_error: 'Address is required',
      })
      .min(3, { message: 'Address must be at least 3 characters long' })
      .max(99, { message: 'Address cannot be longer than 99 characters' }),

    joinginDate: z
      .string({
        required_error: 'Joining date is required',
      })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'Joining date must be in YYYY-MM-DD format',
      }),
  }),
});
// Login a user zod validation
const loginUserZodSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'email is required',
      })
      .email(),
    password: z.string({
      required_error: 'password is required',
    }),
  }),
});

// Refresh token
const refreshTokenZodSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required',
    }),
  }),
});

// Update ruler
const updateRoll = z.object({
  body: z.object({
    ruler: z
      .string({
        required_error: 'user Id is required',
      })
      .min(1)
      .max(15),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  loginUserZodSchema,
  updateRoll,
  refreshTokenZodSchema,
};
