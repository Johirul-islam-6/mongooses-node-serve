import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';
import { CreateUserController } from './user.controller';

const router = express.Router();

//01. create a user
router.post(
  '/create-user',
  validateRequest(UserValidation.createUserZodSchema),
  CreateUserController.userCreated
);

// get all users
router.get('/', CreateUserController.getAllUsers);

// 02. login a user email , password
router.post(
  '/login',
  validateRequest(UserValidation.loginUserZodSchema),
  CreateUserController.loginAuth
);
// Refresh token genated
router.post(
  '/refresh-token',
  validateRequest(UserValidation.refreshTokenZodSchema),
  CreateUserController.refreshToken
);

// 03. forgot password
router.post('/forgotPass', CreateUserController.forgotPasswordController);

// 03. Reset password
router.post('/resetpassword', CreateUserController.resetPasswordSetController);

// 03. costom roll
router.patch(
  '/:id',
  validateRequest(UserValidation.updateRoll),
  CreateUserController.updateRuler
);

router.delete('/:id', CreateUserController.Delete);

// 03. student roll
router.patch('/roll/:id', CreateUserController.updateRoll);

router.get('/:id', CreateUserController.singelUser);

export const UserRoutes = router;
