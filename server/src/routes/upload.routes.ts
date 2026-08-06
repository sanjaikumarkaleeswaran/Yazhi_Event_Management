import { Router } from 'express';
import multer from 'multer';
import { uploadImage, replaceImage, deleteImage } from '../controllers/upload.controller';
import { protect, hasPermission } from '../middleware/authMiddleware';

const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/', protect, hasPermission('Blog', 'create'), upload.single('file'), uploadImage);
router.post('/replace', protect, hasPermission('Blog', 'edit'), upload.single('file'), replaceImage);
router.delete('/:publicId', protect, hasPermission('Blog', 'edit'), deleteImage);

export default router;
