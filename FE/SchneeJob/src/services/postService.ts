/**
 * Post Service
 * Handles social posts and company posts
 */

import api from './api';

export interface Post {
  id?: string;
  postId: string;
  userId?: string;
  companyId?: string;
  companyName?: string;
  companyLogo?: string;
  content: string;
  imageUrl?: string | null;
  imageURL?: string;
  jobId?: string;
  createdAt?: string;
  updatedAt?: string;
  likes?: number;
  comments?: number;
  views?: number;
  shares?: number;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    companyId?: string;
  };
  [key: string]: any;
}

export interface PostCreateRequest {
  content: string;
  imageUrl?: string | null;
  jobId?: string;
}

export interface PostUpdateRequest extends PostCreateRequest {
  postId?: string;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

const postService = {
  /**
   * Get all posts
   */
  getAll: async () => {
    try {
      const res = await api.get<Post[]>('/posts');
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw error;
    }
  },

  /**
   * Get posts by company
   */
  getByCompany: async (companyId: string) => {
    try {
      const res = await api.get<Post[]>(`/posts/company/${companyId}`);
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error(`Failed to fetch posts for company ${companyId}:`, error);
      throw error;
    }
  },

  /**
   * Get posts by user
   */
  getByUser: async (userId: string) => {
    try {
      const res = await api.get<Post[]>(`/posts/user/${userId}`);
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error(`Failed to fetch posts for user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Get single post
   */
  getById: async (id: string) => {
    try {
      const res = await api.get<Post>(`/posts/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to fetch post ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create new post
   */
  create: async (postData: PostCreateRequest) => {
    try {
      const res = await api.post<Post>('/posts', postData);
      return res;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  },

  /**
   * Update post
   */
  update: async (id: string, postData: PostUpdateRequest) => {
    try {
      const res = await api.put<Post>(`/posts/${id}`, postData);
      return res;
    } catch (error) {
      console.error(`Failed to update post ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete post
   */
  delete: async (id: string) => {
    try {
      const res = await api.delete(`/posts/${id}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete post ${id}:`, error);
      throw error;
    }
  },

  /**
   * Like a post
   */
  like: async (postId: string) => {
    try {
      const res = await api.post(`/posts/${postId}/like`);
      return res;
    } catch (error) {
      console.error(`Failed to like post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Unlike a post
   */
  unlike: async (postId: string) => {
    try {
      const res = await api.delete(`/posts/${postId}/like`);
      return res;
    } catch (error) {
      console.error(`Failed to unlike post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Check if user liked a post
   */
  checkLike: async (postId: string) => {
    try {
      const res = await api.get<boolean>(`/posts/${postId}/like`);
      return res;
    } catch (error) {
      return { data: false };
    }
  },

  /**
   * Increment view count
   */
  incrementView: async (id: string) => {
    try {
      const res = await api.post(`/posts/${id}/view`);
      return res;
    } catch (error) {
      console.error(`Failed to increment view for post ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get post comments
   */
  getComments: async (postId: string) => {
    try {
      const res = await api.get<PostComment[]>(`/posts/${postId}/comments`);
      const data = res.data?.data || res.data || [];
      return { ...res, data };
    } catch (error) {
      console.error(`Failed to fetch comments for post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Add comment to post
   */
  addComment: async (postId: string, content: string) => {
    try {
      const res = await api.post<PostComment>(`/posts/${postId}/comments`, { content });
      return res;
    } catch (error) {
      console.error(`Failed to add comment to post ${postId}:`, error);
      throw error;
    }
  },

  /**
   * Delete comment
   */
  deleteComment: async (postId: string, commentId: string) => {
    try {
      const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
      return res;
    } catch (error) {
      console.error(`Failed to delete comment:`, error);
      throw error;
    }
  },
};

export default postService;
