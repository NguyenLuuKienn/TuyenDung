import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { industriesService } from '../../services/masterDataService';

const IndustriesManagement = () => {
  const [industries, setIndustries] = useState([]);
  const [filteredIndustries, setFilteredIndustries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newIndustryName, setNewIndustryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load industries from API
  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      setIsLoading(true);
      const response = await industriesService.getAllIndustries();
      setIndustries(response.data);
      setFilteredIndustries(response.data);
    } catch (error) {
      console.error('Error loading industries:', error);
      toast.error('Lỗi khi tải ngành nghề từ server');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter industries based on search
  useEffect(() => {
    const filtered = industries.filter(ind =>
      ind.industryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredIndustries(filtered);
  }, [searchQuery, industries]);

  const handleAddIndustry = async () => {
    if (!newIndustryName.trim()) {
      toast.warning('Tên ngành nghề không được trống');
      return;
    }

    // Check for duplicates
    if (industries.some(i => i.industryName.toLowerCase() === newIndustryName.toLowerCase())) {
      toast.warning('Ngành nghề này đã tồn tại');
      return;
    }

    try {
      const response = await industriesService.createIndustry({
        industryName: newIndustryName,
      });
      setIndustries([...industries, response.data]);
      setNewIndustryName('');
      setIsAddingNew(false);
      toast.success('Thêm ngành nghề thành công');
    } catch (error) {
      console.error('Error adding industry:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi thêm ngành nghề');
    }
  };

  const handleUpdateIndustry = async (industryId) => {
    if (!editingName.trim()) {
      toast.warning('Tên ngành nghề không được trống');
      return;
    }

    // Check for duplicates (excluding current item)
    if (industries.some(i => i.industryId !== industryId && i.industryName.toLowerCase() === editingName.toLowerCase())) {
      toast.warning('Tên ngành nghề này đã tồn tại');
      return;
    }

    try {
      const response = await industriesService.updateIndustry(industryId, {
        industryId,
        industryName: editingName,
      });
      setIndustries(industries.map(i => (i.industryId === industryId ? response.data : i)));
      setEditingId(null);
      setEditingName('');
      toast.success('Cập nhật ngành nghề thành công');
    } catch (error) {
      console.error('Error updating industry:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật ngành nghề');
    }
  };

  const handleDeleteIndustry = async (industryId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa ngành nghề này?')) {
      return;
    }

    try {
      await industriesService.deleteIndustry(industryId);
      setIndustries(industries.filter(i => i.industryId !== industryId));
      toast.success('Xóa ngành nghề thành công');
    } catch (error) {
      console.error('Error deleting industry:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa ngành nghề');
    }
  };

  const handleEditStart = (industry) => {
    setEditingId(industry.industryId);
    setEditingName(industry.industryName);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản lý <span className="text-primary-500">Ngành nghề</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Quản lý danh mục các lĩnh vực hoạt động trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-primary-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-primary-500/10 transition-colors">
                <FiPlus className="w-6 h-6 text-gray-400 group-hover:text-primary-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tổng số</p>
                <p className="text-2xl font-black text-white">{industries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-green-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <FiCheck className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đang hiển thị</p>
                <p className="text-2xl font-black text-white">{filteredIndustries.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-5 border border-gray-800/50 hover:border-yellow-500/30 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                <FiEdit2 className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Đang sửa</p>
                <p className="text-2xl font-black text-white">{editingId ? 1 : 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Add Bar */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 border border-gray-800/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm ngành nghề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-all shadow-inner"
            />
          </div>
          {!isAddingNew && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-primary-600/20"
            >
              <FiPlus className="w-5 h-5" />
              <span>Thêm mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Form */}
      {isAddingNew && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary-500/5 border border-primary-500/20 rounded-2xl p-4"
        >
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nhập tên ngành nghề mới..."
              value={newIndustryName}
              onChange={(e) => setNewIndustryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddIndustry()}
              className="flex-1 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all"
              autoFocus
            />
            <button
              onClick={handleAddIndustry}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
            >
              <FiCheck className="w-5 h-5" />
              <span>Xác nhận</span>
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewIndustryName('');
              }}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
            >
              <FiX className="w-5 h-5" />
              <span>Hủy</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Industries List */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="animate-spin text-primary-500 text-4xl mb-4" />
            <p className="text-gray-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredIndustries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiBookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Không tìm thấy ngành nghề nào phù hợp' : 'Chưa có ngành nghề nào trong hệ thống'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredIndustries.map((industry) => (
              <div
                key={industry.industryId}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
              >
                {editingId === industry.industryId ? (
                  <div className="flex gap-3 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateIndustry(industry.industryId)}
                      className="flex-1 bg-gray-800 border border-primary-500/50 rounded-xl px-4 py-2 text-white focus:outline-none shadow-lg shadow-primary-500/10"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateIndustry(industry.industryId)}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      <FiCheck className="w-4 h-4" />
                      <span>Lưu</span>
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold px-4 py-2 rounded-xl transition-all"
                    >
                      <FiX className="w-4 h-4" />
                      <span>Hủy</span>
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-primary-500 font-bold">
                        {industry.industryName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-200 font-semibold text-lg">{industry.industryName}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditStart(industry)}
                        className="p-2.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-xl transition-all"
                        title="Chỉnh sửa"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteIndustry(industry.industryId)}
                        className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                        title="Xóa"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IndustriesManagement;
