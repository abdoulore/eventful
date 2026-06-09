import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { AppError } from '../../middlewares/error.middleware';
import { uploadImage } from './upload.controller';

const router = Router();

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!allowedImageTypes.includes(file.mimetype)) {
      cb(new AppError('Only JPG, PNG, and WebP images are allowed', 400));
      return;
    }

    cb(null, true);
  },
});

const uploadSingleImage = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        next(new AppError('Image must be 5MB or smaller', 400));
        return;
      }

      next(new AppError(err.message, 400));
      return;
    }

    if (err) {
      next(err);
      return;
    }

    next();
  });
};

router.post('/image', authenticate, authorize('CREATOR'), uploadSingleImage, uploadImage);

export default router;
