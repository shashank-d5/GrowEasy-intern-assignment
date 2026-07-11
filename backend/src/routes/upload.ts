import { Router } from 'express';
import multer from 'multer';
import { handleUpload } from '../controllers/uploadController';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.match(/\.csv$/i) && file.mimetype !== 'text/csv') {
      cb(new Error('Only CSV files are allowed'));
      return;
    }
    cb(null, true);
  },
});

router.post('/', uploadLimiter, upload.single('file'), handleUpload);

export default router;
