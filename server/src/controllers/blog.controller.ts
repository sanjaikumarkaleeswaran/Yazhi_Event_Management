import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import BlogPost, { BlogPostStatus } from '../models/BlogPost';
import Category from '../models/Category';
import Tag from '../models/Tag';
import {
  dispatchArticlePublished,
  dispatchArticleScheduled,
  dispatchArticleUpdated,
  dispatchArticleDeleted
} from '../utils/notificationDispatcher';

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateReadingTime = (content: string): number => {
  if (!content) return 0;
  const cleanContent = content.replace(/<[^>]*>/g, ''); // strip HTML tags
  const words = cleanContent.trim().split(/\s+/).filter(w => w.length > 0);
  return Math.ceil(words.length / 200) || 1; // 200 wpm
};

// 1. Create Post
export const createPost = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const postData = { ...req.body };
    
    // Generate unique slug
    let baseSlug = postData.slug ? slugify(postData.slug) : slugify(postData.title);
    let slug = baseSlug;
    let counter = 1;
    while (await BlogPost.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    postData.slug = slug;
    
    // Assign author from token user
    postData.author = req.user._id;
    
    // Calculate reading time
    postData.readingTime = calculateReadingTime(postData.content);
    
    // Handle status changes
    if (postData.status === BlogPostStatus.PUBLISHED) {
      postData.publishedAt = new Date();
    } else if (postData.status === BlogPostStatus.SCHEDULED) {
      if (!postData.scheduledAt) {
        res.status(400).json({ status: 'error', message: 'Scheduling date is required for Scheduled status' });
        return;
      }
    }

    const newPost = await BlogPost.create(postData);
    
    // Dispatch Notifications
    if (newPost.status === BlogPostStatus.PUBLISHED) {
      await dispatchArticlePublished(newPost);
    } else if (newPost.status === BlogPostStatus.SCHEDULED) {
      await dispatchArticleScheduled(newPost);
    }

    // Capture in user timeline
    if (req.user && typeof req.user.activityTimeline !== 'undefined') {
      req.user.activityTimeline.push({
        action: 'Blog Created',
        description: `Created article "${newPost.title}"`,
        date: new Date()
      });
      await req.user.save();
    }

    res.status(201).json({ status: 'success', data: newPost });
  } catch (error) {
    next(error);
  }
};

// 2. Update Post
export const updatePost = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const postData = { ...req.body };

    const existing = await BlogPost.findById(id);
    if (!existing || existing.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }

    // Slug update if passed and changed
    if (postData.slug) {
      const baseSlug = slugify(postData.slug);
      if (baseSlug !== existing.slug) {
        let slug = baseSlug;
        let counter = 1;
        while (await BlogPost.findOne({ slug, _id: { $ne: id } })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        postData.slug = slug;
      }
    }

    if (postData.content) {
      postData.readingTime = calculateReadingTime(postData.content);
    }

    // Handle status transitions
    const originalStatus = existing.status;
    if (postData.status && postData.status !== originalStatus) {
      if (postData.status === BlogPostStatus.PUBLISHED) {
        postData.publishedAt = new Date();
      } else if (postData.status === BlogPostStatus.SCHEDULED) {
        if (!postData.scheduledAt) {
          res.status(400).json({ status: 'error', message: 'Scheduling date is required for Scheduled status' });
          return;
        }
      }
    }

    const updatedPost = await BlogPost.findByIdAndUpdate(id, postData, { new: true, runValidators: true });

    // Send notifications on state changes
    if (updatedPost) {
      if (updatedPost.status !== originalStatus) {
        if (updatedPost.status === BlogPostStatus.PUBLISHED) {
          await dispatchArticlePublished(updatedPost);
        } else if (updatedPost.status === BlogPostStatus.SCHEDULED) {
          await dispatchArticleScheduled(updatedPost);
        }
      } else {
        await dispatchArticleUpdated(updatedPost);
      }
    }

    res.status(200).json({ status: 'success', data: updatedPost });
  } catch (error) {
    next(error);
  }
};

// 3. Get All Posts (Public Listing - Published Only)
export const getAllPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 9;
    const skip = (page - 1) * limit;

    const { search, category, tag, author, featured } = req.query;

    const query: any = {
      status: BlogPostStatus.PUBLISHED,
      isDeleted: false
    };

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ];
    }

    if (category) {
      // Find category by slug/id
      const cat = await Category.findOne({ $or: [{ slug: category as string }, { name: category as string }] });
      if (cat) {
        query.category = cat._id;
      } else if (mongoose.Types.ObjectId.isValid(category as string)) {
        query.category = category;
      }
    }

    if (tag) {
      query.tags = tag;
    }

    if (author && mongoose.Types.ObjectId.isValid(author as string)) {
      query.author = author;
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .populate('author', 'firstName lastName name photo role')
      .populate('category', 'name slug color icon')
      .sort({ featured: -1, featuredOrder: 1, publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 4. Get Single Post (Public - Increment Views)
export const getPostBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const slugStr = slug as string;
    
    // Support querying by Mongo ID or Slug
    const query = mongoose.Types.ObjectId.isValid(slugStr)
      ? { $or: [{ _id: slugStr }, { slug: slugStr }], isDeleted: false }
      : { slug: slugStr, isDeleted: false };

    const post = await BlogPost.findOne(query)
      .populate('author', 'firstName lastName name photo role')
      .populate('category', 'name slug color icon');

    if (!post) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }

    // Increment views only on published articles or ignore for admins if wanted
    // For simplicity, always increment
    post.views += 1;
    await post.save();

    res.status(200).json({ status: 'success', data: post });
  } catch (error) {
    next(error);
  }
};

// 5. Duplicate Post
export const duplicatePost = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const existing = await BlogPost.findById(id);
    if (!existing || existing.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Article to duplicate not found' });
      return;
    }

    const baseTitle = `[Duplicate] ${existing.title}`;
    const baseSlug = slugify(existing.slug + '-dup');
    let slug = baseSlug;
    let counter = 1;
    while (await BlogPost.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Clone payload
    const cloneData = {
      title: baseTitle,
      slug,
      excerpt: existing.excerpt,
      content: existing.content,
      coverImage: existing.coverImage,
      gallery: existing.gallery,
      author: req.user._id,
      category: existing.category,
      tags: existing.tags,
      status: BlogPostStatus.DRAFT, // Always duplicate as draft
      featured: false,
      featuredOrder: 0,
      readingTime: existing.readingTime,
      views: 0,
      likes: 0,
      shares: 0,
      seoTitle: existing.seoTitle,
      seoDescription: existing.seoDescription,
      focusKeyword: existing.focusKeyword,
      canonicalUrl: existing.canonicalUrl,
      ogImage: existing.ogImage,
      metaRobots: existing.metaRobots,
      schemaType: existing.schemaType
    };

    const duplicate = await BlogPost.create(cloneData);
    res.status(201).json({ status: 'success', data: duplicate });
  } catch (error) {
    next(error);
  }
};

// 6. Like Post
export const likePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post || post.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }
    post.likes += 1;
    await post.save();
    res.status(200).json({ status: 'success', likes: post.likes });
  } catch (error) {
    next(error);
  }
};

// 7. Share Post
export const sharePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post || post.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }
    post.shares += 1;
    await post.save();
    res.status(200).json({ status: 'success', shares: post.shares });
  } catch (error) {
    next(error);
  }
};

// 8. Soft Delete
export const softDeletePost = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post || post.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    await dispatchArticleDeleted(post);

    res.status(200).json({ status: 'success', message: 'Article moved to trash successfully' });
  } catch (error) {
    next(error);
  }
};

// 9. Restore Soft Deleted
export const restorePost = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post || !post.isDeleted) {
      res.status(404).json({ status: 'error', message: 'Article not found in trash' });
      return;
    }

    post.isDeleted = false;
    post.deletedAt = undefined;
    await post.save();

    res.status(200).json({ status: 'success', message: 'Article restored successfully', data: post });
  } catch (error) {
    next(error);
  }
};

// 10. Permanent Delete
export const permanentDeletePost = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findById(id);
    if (!post) {
      res.status(404).json({ status: 'error', message: 'Article not found' });
      return;
    }

    await BlogPost.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', message: 'Article permanently deleted' });
  } catch (error) {
    next(error);
  }
};

// 11. Admin Get All (Including Deleted / Drafts)
export const getAdminPosts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const { search, status, category, isDeleted } = req.query;

    const query: any = {};

    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      query.$or = [
        { title: searchRegex },
        { excerpt: searchRegex }
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (isDeleted === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }

    const total = await BlogPost.countDocuments(query);
    const posts = await BlogPost.find(query)
      .populate('author', 'firstName lastName name role')
      .populate('category', 'name slug color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      status: 'success',
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// 12. CMS Stats Dashboard Widgets
export const getBlogStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalArticles = await BlogPost.countDocuments({ isDeleted: false });
    const drafts = await BlogPost.countDocuments({ status: BlogPostStatus.DRAFT, isDeleted: false });
    const published = await BlogPost.countDocuments({ status: BlogPostStatus.PUBLISHED, isDeleted: false });
    const scheduled = await BlogPost.countDocuments({ status: BlogPostStatus.SCHEDULED, isDeleted: false });
    const archived = await BlogPost.countDocuments({ status: BlogPostStatus.ARCHIVED, isDeleted: false });

    const totalViewsData = await BlogPost.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const views = totalViewsData[0]?.total || 0;

    const mostRead = await BlogPost.find({ isDeleted: false, status: BlogPostStatus.PUBLISHED })
      .select('title views likes slug publishedAt')
      .sort({ views: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        totalArticles,
        drafts,
        published,
        scheduled,
        archived,
        views,
        mostRead
      }
    });
  } catch (error) {
    next(error);
  }
};

// 13. CSV Report compiles
export const getBlogReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const posts = await BlogPost.find({ isDeleted: false })
      .populate('author', 'firstName lastName')
      .populate('category', 'name')
      .sort({ views: -1 });

    const reportData = posts.map(p => {
      // Calculate a mock/simple SEO score based on completion of fields
      let seoScore = 0;
      if (p.title) seoScore += 20;
      if (p.seoDescription) seoScore += 20;
      if (p.focusKeyword) seoScore += 20;
      if (p.canonicalUrl) seoScore += 20;
      if (p.ogImage) seoScore += 20;

      return {
        Title: p.title,
        Status: p.status,
        Author: p.author ? `${(p.author as any).firstName} ${(p.author as any).lastName}` : 'N/A',
        Category: p.category ? (p.category as any).name : 'N/A',
        ReadingTime: `${p.readingTime} min`,
        Views: p.views,
        Likes: p.likes,
        Shares: p.shares,
        SeoScore: `${seoScore}%`,
        PublishedAt: p.publishedAt ? p.publishedAt.toISOString().split('T')[0] : 'N/A'
      };
    });

    res.status(200).json({
      status: 'success',
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};

// 14. Background/Request scheduled publisher runner
export const publishScheduledPosts = async (): Promise<number> => {
  try {
    const now = new Date();
    const scheduled = await BlogPost.find({
      status: BlogPostStatus.SCHEDULED,
      scheduledAt: { $lte: now },
      isDeleted: false
    });

    if (scheduled.length === 0) return 0;

    let count = 0;
    for (const post of scheduled) {
      post.status = BlogPostStatus.PUBLISHED;
      post.publishedAt = now;
      await post.save();
      await dispatchArticlePublished(post);
      count++;
    }
    return count;
  } catch (error) {
    console.error('❌ Background scheduled publishing failed:', error);
    return 0;
  }
};
