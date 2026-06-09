import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { AppError } from '../../middlewares/error.middleware';
import { asyncHandler } from '../../utils/asyncHandler';
import { uploadImageBuffer } from './upload.service';

export const uploadImage = asyncHandler(async (
  req: AuthRequest,
  res: Response,
  _next: NextFunction,
) => {
  if (!req.file) {
    throw new AppError('Image file is required', 400);
  }

  const upload = await uploadImageBuffer(req.file.buffer);

  res.status(201).json({
    success: true,
    data: upload,
  });
});
