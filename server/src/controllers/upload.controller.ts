import { Request, Response, NextFunction } from 'express';
import cloudinary from '../utils/cloudinary';
import AuditLog from '../models/AuditLog';

// Upload image (cover/gallery)
export const uploadImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(fileStr, {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'yazhi/blog',
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
    });

    // Audit
    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogMedia', action: 'Uploaded', oldValue: null, newValue: result });
    }

    res.status(201).json({ status: 'success', data: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height } });
  } catch (error) {
    next(error);
  }
};

export const replaceImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.body;
    if (!publicId) return res.status(400).json({ status: 'error', message: 'publicId is required to replace' });
    if (!req.file) return res.status(400).json({ status: 'error', message: 'No file uploaded' });

    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    // Upload new
    const result = await cloudinary.uploader.upload(fileStr, {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'yazhi/blog',
      use_filename: true,
      unique_filename: false,
      overwrite: false,
      transformation: [{ quality: 'auto' }, { fetch_format: 'auto' }],
    });

    // Optionally delete old
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (e) {
      // ignore
    }

    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogMedia', action: 'Replaced', oldValue: publicId, newValue: result });
    }

    res.status(200).json({ status: 'success', data: { url: result.secure_url, publicId: result.public_id } });
  } catch (error) {
    next(error);
  }
};

export const deleteImage = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { publicId } = req.params;
    if (!publicId) return res.status(400).json({ status: 'error', message: 'publicId required' });

    const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogMedia', action: 'Deleted', oldValue: publicId, newValue: result });
    }

    res.status(200).json({ status: 'success', data: result });
  } catch (error) {
    next(error);
  }
};
