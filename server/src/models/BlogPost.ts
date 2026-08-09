import mongoose, { Schema, Document } from 'mongoose';

export enum BlogPostStatus {
  DRAFT = 'Draft',
  PUBLISHED = 'Published',
  SCHEDULED = 'Scheduled',
  ARCHIVED = 'Archived',
}

export enum BlogPostVisibility {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

export interface IBlogSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  noIndex?: boolean;
}

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  coverImageAlt?: string;
  gallery: string[];
  author: mongoose.Types.ObjectId;
  authorName?: string;
  category: mongoose.Types.ObjectId;
  categoryName?: string;
  tags: string[];
  status: BlogPostStatus;
  visibility: BlogPostVisibility;
  featured: boolean;
  featuredOrder: number;
  readingTime: number;
  views: number;
  likes: number;
  shares: number;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  ogImage?: string;
  metaRobots: string;
  schemaType: string;
  seo?: IBlogSeo;
  social?: {
    facebookTitle?: string;
    facebookDescription?: string;
    facebookImage?: string;
    twitterTitle?: string;
    twitterDescription?: string;
    twitterImage?: string;
  };
  publishedAt?: Date;
  scheduledAt?: Date;
  deletedAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blogPostSchema: Schema<IBlogPost> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    coverImageAlt: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    gallery: {
      type: [String],
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    authorName: { type: String, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    categoryName: { type: String, trim: true },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(BlogPostStatus),
      default: BlogPostStatus.DRAFT,
      index: true,
    },
    visibility: {
      type: String,
      enum: Object.values(BlogPostVisibility),
      default: BlogPostVisibility.PUBLIC,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    shares: {
      type: Number,
      default: 0,
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
    },
    focusKeyword: {
      type: String,
      trim: true,
    },
    canonicalUrl: {
      type: String,
      trim: true,
    },
    ogImage: {
      type: String,
    },
    metaRobots: {
      type: String,
      default: 'index, follow',
    },
    schemaType: {
      type: String,
      default: 'Article',
    },
    seo: {
      title: { type: String, trim: true, maxlength: 70 },
      description: { type: String, trim: true, maxlength: 170 },
      keywords: { type: [String], default: [] },
      canonicalUrl: { type: String, trim: true },
      ogTitle: { type: String, trim: true },
      ogDescription: { type: String, trim: true },
      ogImage: { type: String, trim: true },
      twitterTitle: { type: String, trim: true },
      twitterDescription: { type: String, trim: true },
      twitterImage: { type: String, trim: true },
      noIndex: { type: Boolean, default: false },
    },
    social: {
      facebookTitle: { type: String, trim: true },
      facebookDescription: { type: String, trim: true },
      facebookImage: { type: String, trim: true },
      twitterTitle: { type: String, trim: true },
      twitterDescription: { type: String, trim: true },
      twitterImage: { type: String, trim: true },
    },
    publishedAt: {
      type: Date,
    },
    scheduledAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for popular combinations
blogPostSchema.index({ status: 1, isDeleted: 1, createdAt: -1 });
blogPostSchema.index({ category: 1, status: 1, isDeleted: 1 });
blogPostSchema.index({ tags: 1, status: 1, isDeleted: 1 });
blogPostSchema.index({ publishedAt: -1, status: 1, visibility: 1, isDeleted: 1 });
blogPostSchema.index({ createdAt: -1 });

export default mongoose.model<IBlogPost>('BlogPost', blogPostSchema);
