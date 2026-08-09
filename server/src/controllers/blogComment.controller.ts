import { Request, Response, NextFunction } from 'express';
import BlogComment, { BlogCommentStatus } from '../models/BlogComment';
import BlogPost from '../models/BlogPost';
import AuditLog from '../models/AuditLog';
import { blogCommentSchema } from '../validators/blog.validator';

export const createComment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = blogCommentSchema.parse(req.body);

    // Ensure blog exists and is not deleted
    const post = await BlogPost.findById(parsed.blogId);
    if (!post || post.isDeleted) return res.status(404).json({ status: 'error', message: 'Article not found' });

    const comment = await BlogComment.create({
      blogId: parsed.blogId,
      name: parsed.name,
      email: parsed.email || '',
      message: parsed.message,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || ''
    } as any);

    res.status(201).json({ status: 'success', data: comment });
  } catch (error) {
    next(error);
  }
};

export const getComments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { blogId, status } = req.query;
    const page = parseInt((req.query.page as string) || '1');
    const limit = parseInt((req.query.limit as string) || '20');
    const skip = (page - 1) * limit;

    const query: any = {};
    if (blogId) query.blogId = blogId;
    if (status) query.status = status;

    const total = await BlogComment.countDocuments(query);
    const comments = await BlogComment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.status(200).json({ status: 'success', data: comments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const updateCommentStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existing = await BlogComment.findById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Comment not found' });

    const old = existing.toObject();
    existing.status = status || existing.status;
    await existing.save();

    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogComment', action: 'StatusUpdated', oldValue: old as unknown as Record<string, unknown>, newValue: existing.toObject() as unknown as Record<string, unknown> });
    }

    res.status(200).json({ status: 'success', data: existing });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const existing = await BlogComment.findById(id);
    if (!existing) return res.status(404).json({ status: 'error', message: 'Comment not found' });

    await BlogComment.findByIdAndDelete(id);
    if (req.user) {
      await AuditLog.create({ userId: req.user._id, userName: req.user.email || req.user.name || '', module: 'BlogComment', action: 'Deleted', oldValue: existing.toObject() as unknown as Record<string, unknown>, newValue: null });
    }

    res.status(200).json({ status: 'success', message: 'Comment deleted' });
  } catch (error) {
    next(error);
  }
};
