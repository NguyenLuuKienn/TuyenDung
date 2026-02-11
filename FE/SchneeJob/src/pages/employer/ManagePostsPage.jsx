import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiMessageCircle, FiHeart, FiEye, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import postService from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';

const ManagePostsPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPost, setExpandedPost] = useState(null);
    const [comments, setComments] = useState({});
    const [loadingComments, setLoadingComments] = useState({});

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setIsLoading(true);
            const response = await postService.getByCompany(user?.companyId);
            setPosts(response.data || []);
        } catch (err) {
            console.error('Failed to load posts:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể tải danh sách bài viết'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const loadComments = async (postId) => {
        try {
            setLoadingComments(prev => ({ ...prev, [postId]: true }));
            const response = await postService.getComments(postId);
            setComments(prev => ({ ...prev, [postId]: response.data || [] }));
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoadingComments(prev => ({ ...prev, [postId]: false }));
        }
    };

    const toggleComments = (postId) => {
        if (expandedPost === postId) {
            setExpandedPost(null);
        } else {
            setExpandedPost(postId);
            if (!comments[postId]) {
                loadComments(postId);
            }
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Xác nhận xóa',
            text: 'Bạn có chắc chắn muốn xóa bài viết này không?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await postService.delete(id);
                setPosts(posts.filter(p => p.postId !== id));
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa',
                    text: 'Bài viết đã được xóa thành công',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error('Delete error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể xóa bài viết'
                });
            }
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        const result = await Swal.fire({
            title: 'Xóa bình luận?',
            text: 'Bạn có chắc chắn muốn xóa bình luận này?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await postService.deleteComment(commentId);
                setComments(prev => ({
                    ...prev,
                    [postId]: prev[postId].filter(c => c.id !== commentId)
                }));
                setPosts(posts.map(p =>
                    p.postId === postId ? { ...p, comments: Math.max(0, p.comments - 1) } : p
                ));
                Swal.fire({
                    icon: 'success',
                    title: 'Đã xóa',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (err) {
                console.error('Delete comment error:', err);
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi',
                    text: 'Không thể xóa bình luận'
                });
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quản lý bài viết</h1>
                    <p className="text-gray-600 dark:text-gray-400">Xây dựng thương hiệu tuyển dụng qua các bài đăng</p>
                </div>
                <Link
                    to="/employer/posts/create"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2 w-fit"
                >
                    <FiPlus className="w-5 h-5" /> Viết bài mới
                </Link>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {posts.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-dashed border-gray-200 dark:border-gray-700">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiMessageCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Chưa có bài viết nào</h3>
                            <p className="text-gray-500 mb-6">Hãy bắt đầu chia sẻ về công ty của bạn để thu hút ứng viên</p>
                            <Link to="/employer/posts/create" className="text-primary-600 font-semibold hover:underline">Tạo bài viết đầu tiên</Link>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.postId} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {post.imageUrl && (
                                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shrink-0">
                                                <img src={post.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-2">
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Đăng {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/employer/posts/${post.postId}/edit`)}
                                                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(post.postId)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Xóa"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <h3 className="text-gray-900 dark:text-white font-medium line-clamp-2 mb-4">
                                                {post.content}
                                            </h3>

                                            <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                                                <div className="flex items-center gap-1.5" title="Lượt xem">
                                                    <FiEye className="w-4 h-4" /> {post.views}
                                                </div>
                                                <div className="flex items-center gap-1.5" title="Lượt thích">
                                                    <FiHeart className="w-4 h-4" /> {post.likes}
                                                </div>
                                                <button
                                                    onClick={() => toggleComments(post.postId)}
                                                    className="flex items-center gap-1.5 hover:text-primary-600 transition-colors"
                                                    title="Bình luận"
                                                >
                                                    <FiMessageCircle className="w-4 h-4" /> {post.comments}
                                                    {expandedPost === post.postId ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    {expandedPost === post.postId && (
                                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Bình luận ({post.comments})</h4>
                                            {loadingComments[post.postId] ? (
                                                <div className="text-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                                                </div>
                                            ) : comments[post.postId]?.length === 0 ? (
                                                <p className="text-center text-gray-500 text-sm py-4">Chưa có bình luận nào</p>
                                            ) : (
                                                <div className="space-y-4">
                                                    {comments[post.postId]?.map((comment) => (
                                                        <div key={comment.id} className="flex gap-3 group">
                                                            <img
                                                                src={comment.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.userName}`}
                                                                alt={comment.userName}
                                                                className="w-10 h-10 rounded-full"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <p className="font-semibold text-sm text-gray-900 dark:text-white">{comment.userName}</p>
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{comment.content}</p>
                                                                        </div>
                                                                        <button
                                                                            onClick={() => handleDeleteComment(post.postId, comment.id)}
                                                                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-all"
                                                                            title="Xóa bình luận"
                                                                        >
                                                                            <FiX className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <p className="text-xs text-gray-500 mt-1 px-4">
                                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ManagePostsPage;
