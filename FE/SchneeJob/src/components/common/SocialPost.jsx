import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiMessageCircle, FiShare2, FiMoreHorizontal, FiBriefcase, FiMapPin, FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import Swal from 'sweetalert2';
import postService from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';

const SocialPost = ({ post }) => {
    const { user, isAuthenticated } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    const [commentCount, setCommentCount] = useState(post.comments || 0);
    const [shareCount, setShareCount] = useState(post.shares || 0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLoadingComments, setIsLoadingComments] = useState(false);

    // Check if user has liked this post
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (isAuthenticated) {
                try {
                    const response = await postService.checkLikeStatus(post.postId);
                    setIsLiked(response.data.isLiked);
                } catch (err) {
                    console.error('Check like status error:', err);
                }
            }
        };
        checkLikeStatus();
    }, [post.postId, isAuthenticated]);

    const formatJobSalary = (job) => {
        if (!job) return 'Thương lượng';

        // Check for normalized salary object first
        if (job.salary) {
            const { min, max, negotiable } = job.salary;
            if (negotiable || (!min && !max)) return 'Thương lượng';

            const formatNumber = (num) => {
                if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
                if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
                return num;
            };

            if (min && max) return `${formatNumber(min)} - ${formatNumber(max)}`;
            if (min) return `Từ ${formatNumber(min)}`;
            if (max) return `Đến ${formatNumber(max)}`;
            return 'Thương lượng';
        }

        // Check for raw fields (camelCase or PascalCase)
        const min = Number(job.salaryMin || job.SalaryMin);
        const max = Number(job.salaryMax || job.SalaryMax);

        if (!min && !max) return 'Thương lượng';

        const formatNumber = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(0)} triệu`;
            if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
            return num;
        };

        if (min > 0 && max > 0) return `${formatNumber(min)} - ${formatNumber(max)}`;
        if (min > 0) return `Từ ${formatNumber(min)}`;
        if (max > 0) return `Đến ${formatNumber(max)}`;
        return 'Thương lượng';
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để thích bài viết'
            });
            return;
        }

        try {
            const response = await postService.toggleLike(post.postId);
            setIsLiked(response.data.isLiked);
            setLikeCount(response.data.likes);
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const loadComments = async () => {
        try {
            setIsLoadingComments(true);
            const response = await postService.getComments(post.postId);
            setComments(response.data || []);
        } catch (err) {
            console.error('Load comments error:', err);
        } finally {
            setIsLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!showComments) {
            loadComments();
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để bình luận'
            });
            return;
        }

        if (!newComment.trim()) return;

        try {
            const response = await postService.addComment(post.postId, newComment);
            setComments([response.data, ...comments]);
            setCommentCount(commentCount + 1);
            setNewComment('');
        } catch (err) {
            console.error('Comment error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Không thể thêm bình luận'
            });
        }
    };

    const handleShare = async () => {
        if (!isAuthenticated) {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa đăng nhập',
                text: 'Vui lòng đăng nhập để chia sẻ'
            });
            return;
        }

        try {
            const response = await postService.share(post.postId);
            setShareCount(response.data.shares);
            Swal.fire({
                icon: 'success',
                title: 'Đã chia sẻ',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Share error:', err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to={`/companies/${post.companyId}`}>
                        <img
                            src={post.companyLogo}
                            alt={post.companyName}
                            className="w-10 h-10 rounded-full object-cover border border-gray-100 dark:border-gray-600"
                        />
                    </Link>
                    <div>
                        <Link
                            to={`/companies/${post.companyId}`}
                            className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 block leading-tight"
                        >
                            {post.companyName}
                        </Link>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                        </span>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <FiMoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line mb-3">
                    {post.content}
                </p>
            </div>

            {/* Embedded Job Card (if applicable) */}
            {post.job && (
                <div className="px-4 pb-4">
                    <Link
                        to={`/jobs/${post.jobId}`}
                        className="block bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden hover:border-primary-200 dark:hover:border-primary-500 transition-colors"
                    >
                        {post.imageUrl && (
                            <div className="h-48 overflow-hidden">
                                <img src={post.imageUrl} alt="Post content" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-4">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{post.job.title}</h4>
                            <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                    <FiBriefcase className="w-4 h-4" /> {formatJobSalary(post.job)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <FiMapPin className="w-4 h-4" /> {post.job.location}
                                </span>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Image only if no job */}
            {!post.job && post.imageUrl && (
                <div className="mb-4">
                    <img src={post.imageUrl} alt="Post content" className="w-full h-auto object-cover max-h-[500px]" />
                </div>
            )}

            {/* Footer Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-1">
                    <div className="bg-primary-500 text-white p-1 rounded-full w-4 h-4 flex items-center justify-center">
                        <FiHeart className="w-2 h-2 fill-current" />
                    </div>
                    <span>{likeCount}</span>
                </div>
                <div className="flex gap-3">
                    <span>{commentCount} bình luận</span>
                    <span>{shareCount} chia sẻ</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 border-t border-gray-100 dark:border-gray-700 grid grid-cols-3">
                <button
                    onClick={handleLike}
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-colors ${isLiked
                        ? 'text-pink-600 bg-pink-50 dark:bg-pink-900/20'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                >
                    <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span className="font-medium">Thích</span>
                </button>
                <button
                    onClick={handleToggleComments}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <FiMessageCircle className="w-5 h-5" />
                    <span className="font-medium">Bình luận</span>
                </button>
                <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-2 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    <FiShare2 className="w-5 h-5" />
                    <span className="font-medium">Chia sẻ</span>
                </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 dark:border-gray-700"
                    >
                        <div className="p-4 space-y-4">
                            {/* Comment Input */}
                            {isAuthenticated && (
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <img
                                        src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || 'User'}`}
                                        alt="You"
                                        className="w-8 h-8 rounded-full"
                                    />
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Viết bình luận..."
                                            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-none focus:ring-2 focus:ring-primary-500 text-sm"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <FiSend className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Comments List */}
                            {isLoadingComments ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                                </div>
                            ) : comments.length === 0 ? (
                                <p className="text-center text-gray-500 text-sm py-4">Chưa có bình luận nào</p>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="flex gap-2">
                                        <img
                                            src={comment.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${comment.userName}`}
                                            alt={comment.userName}
                                            className="w-8 h-8 rounded-full"
                                        />
                                        <div className="flex-1">
                                            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                                                <p className="font-semibold text-sm text-gray-900 dark:text-white">{comment.userName}</p>
                                                <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 px-4">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: vi })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SocialPost;
