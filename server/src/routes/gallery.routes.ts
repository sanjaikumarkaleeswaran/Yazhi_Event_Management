import { Router } from 'express';
import { getGalleryItems } from '../controllers/gallery.controller';

const router = Router();

router.get('/', getGalleryItems);

export default router;
