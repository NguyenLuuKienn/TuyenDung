import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { 
  Edit2, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Heart, 
  ChevronLeft, 
  X, 
  Loader, 
  LayoutDashboard, 
  Share2, 
  Image as ImageIcon,
  Calendar,
  MoreVertical,
  Type
} from "lucide-react";
import { postService, companyService } from "@/services";
import type { Post, PostCreateRequest } from "@/services";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export function ManagePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostCreateRequest>({ content: "", imageUrl: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initPage = async () => {
      try {
        setLoading(true);
        // Step 1: Get current company ID
        const companyRes = await companyService.getMyCompany();
        const myCompanyId = companyRes.data?.id || companyRes.data?.companyId;
        
        if (myCompanyId) {
          setCompanyId(myCompanyId);
          // Step 2: Fetch posts for this company
          await fetchPosts(myCompanyId);
        } else {
          setError("Không tìm thấy thông tin công ty. Vui lòng cập nhật hồ sơ công ty trước.");
          setLoading(false);
        }
      } catch (err) {
        console.error("Error initializing page:", err);
        setError("Có lỗi xảy ra khi tải dữ liệu.");
        setLoading(false);
      }
    };

    initPage();
  }, []);

  const fetchPosts = async (id: string) => {
    try {
      setLoading(true);
      const postsResponse = await postService.getByCompany(id);
      const allPosts = Array.isArray(postsResponse.data) ? postsResponse.data : (postsResponse as any)?.data || [];
      setPosts(allPosts);
      setError(null);
    } catch (err) {
      setError("Không thể tải bài viết. Vui lòng thử lại sau.");
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({ content: "", imageUrl: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    setEditingPost(post);
    setFormData({
      content: post.content || "",
      imageUrl: post.imageUrl || "",
      jobId: post.jobId || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({ content: "", imageUrl: "" });
  };

  const handleSubmit = async () => {
    if (!formData.content.trim() || formData.content === "<p><br></p>") {
      alert("Vui lòng nhập nội dung bài viết");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPost) {
        // Update existing post
        await postService.update(editingPost.postId, formData);
        setPosts(posts.map(p => p.postId === editingPost.postId ? { ...p, content: formData.content, imageUrl: formData.imageUrl } : p));
      } else {
        // Create new post
        const response = await postService.create(formData);
        const newPost = (response.data as any)?.data || response.data;
        if (newPost) {
          setPosts([newPost, ...posts]);
        } else if (companyId) {
          // If creation succeeded but didn't return data, refresh list
          await fetchPosts(companyId);
        }
      }
      closeModal();
    } catch (err) {
      console.error("Error saving post:", err);
      alert("Không thể lưu bài viết. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await postService.delete(postId);
        setPosts(posts.filter(p => p.postId !== postId));
      } catch (err) {
        console.error("Error deleting post:", err);
        alert("Không thể xóa bài viết. Vui lòng thử lại.");
      }
    }
  };

  // Quill modules configuration
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'clean']
    ],
  };

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
  ];

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header - Modern Gradient Style */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/employer/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600">
                <ChevronLeft className="h-6 w-6" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-brand uppercase tracking-wider">
                  <LayoutDashboard className="h-3 w-3" />
                  Employer Pro
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">Quản Lý Bài Viết</h1>
              </div>
            </div>
            <Button 
              className="rounded-xl shadow-md hover:shadow-lg transition-all bg-brand hover:bg-brand/90 px-6" 
              onClick={openCreateModal}
            >
              <Plus className="h-4 w-4 mr-2" /> Tạo Bài Viết
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 gap-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-sm border border-slate-100">
              <Loader className="h-10 w-10 animate-spin text-brand mb-4" />
              <p className="text-slate-500 font-medium">Đang tải các bài đăng...</p>
            </div>
          ) : error ? (
            <Card className="border-red-100 bg-red-50/50 shadow-sm rounded-2xl overflow-hidden">
              <CardContent className="p-10 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="h-8 w-8 text-red-600" />
                </div>
                <p className="text-red-700 font-semibold text-lg mb-2">Đã xảy ra lỗi</p>
                <p className="text-red-600/80 mb-6">{error}</p>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-100" onClick={() => window.location.reload()}>
                  Thử lại
                </Button>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border-none shadow-xl rounded-3xl text-center py-20 bg-white">
              <CardContent>
                <div className="w-24 h-24 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-12 w-12 text-brand" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Thông tin trống</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8 text-lg">
                  Bạn chưa đăng bài viết nào. Hãy chia sẻ thông tin về công ty để thu hút ứng viên tiềm năng!
                </p>
                <Button className="rounded-xl bg-brand py-6 px-8 text-lg shadow-lg hover:shadow-brand/20 transition-all cursor-pointer" onClick={openCreateModal}>
                  <Plus className="h-5 w-5 mr-3" /> Đăng bài ngay
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-2 h-8 bg-brand rounded-full"></span>
                  Tất cả bài đăng ({posts.length})
                </h2>
              </div>
              
              <div className="grid gap-6">
                {posts.map((post) => (
                  <Card key={post.postId} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden bg-white">
                    <CardContent className="p-0">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <Avatar 
                                src={post.companyLogo || post.author?.avatar || "https://ui-avatars.com/api/?name=" + (post.companyName || "C")} 
                                alt={post.companyName || "Company"} 
                                className="h-14 w-14 rounded-2xl shadow-sm border border-slate-100" 
                              />
                              <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg leading-tight">{post.companyName || post.author?.name || "Công ty của bạn"}</h3>
                              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-brand hover:bg-brand/5 transition-all"
                              onClick={() => openEditModal(post)}
                            >
                              <Edit2 className="h-5 w-5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                              onClick={() => handleDelete(post.postId)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>

                        {/* Safe HTML Content for Rich Text Preview */}
                        <div 
                          className="prose prose-slate max-w-none text-slate-700 mb-6 post-content-preview"
                          dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {post.imageUrl && (
                          <div className="mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-[1.01] duration-300">
                            <img 
                              src={post.imageUrl} 
                              alt="Post attachment" 
                              className="w-full h-auto object-cover max-h-[500px]" 
                              referrerPolicy="no-referrer"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 group">
                              <div className="p-2 rounded-full bg-red-50 group-hover:bg-red-100 transition-colors">
                                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                              </div>
                              <span className="font-bold text-slate-700">{post.likes || 0}</span>
                            </div>
                            <div className="flex items-center gap-2 group">
                              <div className="p-2 rounded-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
                                <MessageSquare className="h-5 w-5 text-blue-500" />
                              </div>
                              <span className="font-bold text-slate-700">{post.comments || 0}</span>
                            </div>
                          </div>
                          <Button variant="ghost" className="text-slate-400 hover:text-brand text-sm gap-2 rounded-xl">
                            <Share2 className="h-4 w-4" /> Chia sẻ
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Post Modal - Redesigned */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <Card className="border-none shadow-2xl max-w-3xl w-full bg-white rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-slate-100 p-8 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand/10 rounded-2xl">
                  <Type className="h-6 w-6 text-brand" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    {editingPost ? "Chỉnh sửa bài viết" : "Tạo bài đăng mới"}
                  </CardTitle>
                  <p className="text-sm text-slate-500 font-medium">Chia sẻ tin tức của doanh nghiệp bạn</p>
                </div>
              </div>
              <button 
                onClick={closeModal} 
                className="p-2 hover:bg-white shadow-sm hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </CardHeader>

            <CardContent className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <MessageSquare className="h-4 w-4 text-brand" />
                  Nội dung bài viết
                </label>
                <div className="rich-text-editor-container rounded-2xl border border-slate-200 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/5 transition-all overflow-hidden bg-white">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="Viết nội dung bài đăng chuyên nghiệp tại đây..."
                    className="min-h-[250px] border-none"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <ImageIcon className="h-4 w-4 text-brand" />
                  Hình ảnh đính kèm (URL)
                </label>
                <div className="relative group">
                  <Input
                    value={formData.imageUrl || ""}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="Dán link ảnh tại đây (Ví dụ: https://images.unsplash.com/...)"
                    className="h-14 pl-12 rounded-2xl border-slate-200 focus:border-brand focus:ring-brand/5 shadow-sm transition-all"
                  />
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-brand transition-colors" />
                </div>
                {formData.imageUrl && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50 p-2">
                    <img src={formData.imageUrl} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  </div>
                )}
              </div>
            </CardContent>

            <div className="flex gap-4 justify-end p-8 border-t border-slate-100 bg-slate-50/50">
              <Button 
                variant="ghost" 
                className="rounded-xl px-8 font-semibold text-slate-600 hover:bg-white hover:shadow-sm" 
                onClick={closeModal}
              >
                Hủy bỏ
              </Button>
              <Button 
                className="rounded-xl px-10 font-bold bg-brand hover:bg-brand/90 shadow-lg shadow-brand/20 hover:shadow-brand/30 transition-all flex items-center gap-2" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" /> Đang xử lý...
                  </>
                ) : editingPost ? (
                  <>
                    <Edit2 className="h-5 w-5" /> Lưu thay đổi
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" /> Đăng ngay
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Global CSS for Quill & Prose */}
      <style>{`
        .ql-container.ql-snow {
          border: none !important;
          font-family: inherit;
          font-size: 1rem;
        }
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px !important;
          background: #f8fafc;
        }
        .ql-editor {
          min-height: 250px;
          padding: 20px !important;
        }
        .ql-editor.ql-blank::before {
          left: 20px !important;
          font-style: normal;
          color: #94a3b8;
        }
        .post-content-preview {
          line-height: 1.6;
        }
        .post-content-preview p {
          margin-bottom: 1rem;
        }
        .post-content-preview ul, .post-content-preview ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .post-content-preview li {
          margin-bottom: 0.25rem;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
