import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";
import { Edit2, Trash2, Plus, MessageSquare, Heart, ChevronLeft, X, Loader } from "lucide-react";
import { postService } from "@/services";
import type { Post, PostCreateRequest } from "@/services";

export function ManagePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState<PostCreateRequest>({ content: "", imageUrl: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const postsResponse = await postService.getAll();
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
    if (!formData.content.trim()) {
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

  return (
    <div className="bg-gray-50/50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 mb-8">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Link to="/employer/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-brand mb-4 transition-colors">
            <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại Bảng điều khiển
          </Link>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-display text-gray-900">Quản Lý Bài Viết</h1>
              <p className="text-gray-500 mt-1">Tạo và quản lý các bài đăng của công ty trên bảng tin.</p>
            </div>
            <Button className="rounded-xl cursor-pointer" onClick={openCreateModal}>
              <Plus className="h-4 w-4 mr-2" /> Tạo Bài Viết Mới
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : error ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          ) : posts.length === 0 ? (
            <Card className="border-none shadow-sm text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Chưa có bài viết nào</h3>
                <p className="text-gray-500 mb-6">Bạn chưa đăng bài viết nào. Hãy tạo bài viết đầu tiên để thu hút ứng viên!</p>
                <Button className="rounded-xl cursor-pointer" onClick={openCreateModal}>
                  <Plus className="h-4 w-4 mr-2" /> Tạo Bài Viết Mới
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <Card key={post.postId} className="border-none shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar src={post.companyLogo || post.author?.avatar || "https://picsum.photos/seed/user1/100/100"} alt={post.companyName || post.author?.name || "Company"} className="h-12 w-12 rounded-xl" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900">{post.companyName || post.author?.name || "Công ty"}</h3>
                          <span className="text-sm text-gray-500">• {new Date(post.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                        {post.imageUrl && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-gray-100 max-w-2xl">
                            <img src={post.imageUrl} alt="Post attachment" className="w-full h-auto object-cover max-h-96" referrerPolicy="no-referrer" />
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {post.likes || 0} Lượt thích</span>
                          <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4" /> {post.comments || 0} Bình luận</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 shrink-0">
                      <Button variant="outline" size="sm" className="rounded-xl cursor-pointer" onClick={() => openEditModal(post)}>
                        <Edit2 className="h-4 w-4 mr-2" /> Sửa
                      </Button>
                      <Button variant="outline" size="sm" className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer" onClick={() => handleDelete(post.postId)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Post Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="border-none shadow-xl max-w-2xl w-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
              <CardTitle className="text-xl font-bold font-display">
                {editingPost ? "Chỉnh Sửa Bài Viết" : "Tạo Bài Viết Mới"}
              </CardTitle>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label htmlFor="post-content" className="block text-sm font-medium text-gray-900 mb-2">Nội dung bài viết</label>
                <textarea
                  id="post-content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Chia sẻ thông tin về công ty, văn hóa làm việc, cơ hội việc làm..."
                  className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none transition-all resize-none"
                />
              </div>
              
              <div>
                <label htmlFor="post-image" className="block text-sm font-medium text-gray-900 mb-2">Hình ảnh (URL)</label>
                <Input
                  id="post-image"
                  value={formData.imageUrl || ""}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="rounded-xl"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button variant="outline" className="rounded-xl cursor-pointer" onClick={closeModal}>
                  Hủy
                </Button>
                <Button 
                  className="rounded-xl cursor-pointer" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" /> Đang lưu...
                    </>
                  ) : editingPost ? (
                    "Cập Nhật"
                  ) : (
                    "Đăng Bài"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
