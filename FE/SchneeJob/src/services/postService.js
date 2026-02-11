import api from './api';

const postService = {
    // Get all posts
    getAll: async () => {
        return await api.get('/api/posts');
    },

    // Get posts by company
    getByCompany: async (companyId) => {
        return await api.get(`/api/posts/company/${companyId}`);
    },

    // Get single post
    getById: async (id) => {
        return await api.get(`/api/posts/${id}`);
    },

    // Create new post
    create: async (postData) => {
        return await api.post('/api/posts', postData);
    },

    // Update post
    update: async (id, postData) => {
        return await api.put(`/api/posts/${id}`, postData);
    },

    // Delete post
    delete: async (id) => {
        return await api.delete(`/api/posts/${id}`);
    },

    // Increment view count
    incrementView: async (id) => {
        return await api.post(`/api/posts/${id}/view`);
    },

    // Check if user liked a post
    checkLikeStatus: async (id) => {
        return await api.get(`/api/posts/${id}/isliked`);
    },

    // Like/Unlike post
    toggleLike: async (id) => {
        return await api.post(`/api/posts/${id}/like`);
    },

    // Get comments
    getComments: async (id) => {
        return await api.get(`/api/posts/${id}/comments`);
    },

    // Add comment
    addComment: async (id, content) => {
        return await api.post(`/api/posts/${id}/comment`, { content });
    },

    // Share post
    share: async (id) => {
        return await api.post(`/api/posts/${id}/share`);
    },

    // Delete comment (for post owners)
    deleteComment: async (commentId) => {
        return await api.delete(`/api/posts/comments/${commentId}`);
    }
};

export default postService;
