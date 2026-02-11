import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiImage, FiBriefcase, FiX, FiSave, FiEye, FiArrowLeft } from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useJobs } from '../../contexts/JobContext';
import { useAuth } from '../../contexts/AuthContext';
import SocialPost from '../../components/common/SocialPost';
import postService from '../../services/postService';
import api from '../../services/api';

const CreatePostPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { user } = useAuth();
    const { getEmployerJobs } = useJobs();

    const [content, setContent] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const employerJobs = getEmployerJobs(user?.companyId);

    useEffect(() => {
        if (id) {
            const loadPost = async () => {
                try {
                    setIsLoading(true);
                    const response = await postService.getById(id);
                    const post = response.data;
                    setContent(post.content);
                    setImagePreview(post.imageUrl);
                    setSelectedJobId(post.jobId || '');
                } catch (err) {
                    console.error('Failed to load post:', err);
                    Swal.fire({
                        icon: 'error',
                        title: 'Lỗi',
                        text: 'Không thể tải bài viết'
                    });
                    navigate('/employer/posts');
                } finally {
                    setIsLoading(false);
                }
            };
            loadPost();
        }
    }, [id, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Ảnh quá lớn',
                    text: 'Kích thước ảnh không được quá 5MB'
                });
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu nội dung',
                text: 'Vui lòng nhập nội dung bài viết'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            let imageUrl = imagePreview;
            if (selectedImage) {
                const fd = new FormData();
                fd.append('file', selectedImage);
                const uploadResp = await api.post('/api/files/upload-image', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = uploadResp.data?.url;
            }

            const postData = {
                content: content,
                imageUrl: imageUrl,
                jobId: selectedJobId || null
            };

            if (id) {
                await postService.update(id, postData);
            } else {
                await postService.create(postData);
            }

            await Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: id ? 'Cập nhật bài viết thành công' : 'Đăng bài viết thành công',
                timer: 1500,
                showConfirmButton: false
            });

            navigate('/employer/posts');
        } catch (err) {
            console.error('Post creation error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: err.response?.data?.message || 'Có lỗi xảy ra khi đăng bài'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedJob = employerJobs.find(j => j.id === selectedJobId) || null;
    const previewPost = {
        id: 'preview',
        companyId: user?.companyId,
        companyName: user?.companyName || 'Công ty của bạn',
        companyLogo: user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.companyName || 'Company'}`,
        content: content || 'Nội dung bài viết sẽ hiển thị ở đây...',
        image: imagePreview,
        job: selectedJob ? {
            ...selectedJob,
            salary: selectedJob.salary || { min: 10000000, max: 20000000 }
        } : null,
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date().toISOString()
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate('/employer/posts')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {id ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nội dung bài viết
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Bạn đang nghĩ gì? Chia sẻ về văn hóa công ty, hoạt động team..."
                                rows={6}
                                className="w-full p-4 rounded-xl resize-none bg-gray-50 dark:bg-gray-700 border-none focus:ring-2 focus:ring-primary-500 transition-shadow text-gray-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Hình ảnh đính kèm
                            </label>
                            {!imagePreview ? (
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <FiImage className="w-6 h-6 text-gray-500" />
                                    </div>
                                    <p className="text-sm text-gray-500">Kéo thả ảnh hoặc click để tải lên</p>
                                </div>
                            ) : (
                                <div className="relative rounded-xl overflow-hidden group">
                                    <img src={imagePreview} alt="Preview" className="w-full h-64 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <FiX className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Gắn thẻ việc làm (Tùy chọn)
                            </label>
                            <div className="relative">
                                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 w-5 h-5" />
                                <select
                                    value={selectedJobId}
                                    onChange={(e) => setSelectedJobId(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-primary-500 appearance-none cursor-pointer"
                                >
                                    <option value="">-- Chọn việc làm liên quan --</option>
                                    {employerJobs.map(job => (
                                        <option key={job.id} value={job.id}>{job.title}</option>
                                    ))}
                                </select>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Giúp ứng viên dễ dàng ứng tuyển ngay trên bài viết</p>
                        </div>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/employer/posts')}
                                className="px-6 py-2.5 rounded-xl text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl text-white bg-primary-600 hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-600/30 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Đang xử lý...' : (
                                    <>
                                        <FiSave className="w-4 h-4" /> {id ? 'Cập nhật' : 'Đăng bài'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <FiEye className="w-5 h-5" />
                        <span className="font-medium">Xem trước hiển thị</span>
                    </div>
                    <div className="opacity-90 hover:opacity-100 transition-opacity pointer-events-none select-none">
                        <SocialPost post={previewPost} />
                    </div>
                    <p className="text-sm text-center text-gray-400">
                        Đây là giao diện hiển thị trên Bảng tin tuyển dụng
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreatePostPage;
