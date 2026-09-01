import { BLOG_ARTICLES as coreArticles } from './blogArticlesCore';

export interface BlogArticleData {
  slug: string;
  title: string;
  description: string;
  publishedDate: string;
  author: string;
  category: string;
  readingTime: string;
  content: string;
}

export const BLOG_ARTICLES: Record<string, BlogArticleData> = coreArticles;
