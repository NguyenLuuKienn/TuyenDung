import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { educationLevelService } from '../../services/masterDataService';

const EducationLevelsManagement = () => {
  const [levels, setLevels] = useState([]);
  const [filteredLevels, setFilteredLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLevelName, setNewLevelName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load levels from API
  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      setIsLoading(true);
      const response = await educationLevelService.getAllEducationLevels();
      setLevels(response.data);
      setFilteredLevels(response.data);
    } catch (error) {
      console.error('Error loading education levels:', error);
      toast.error('Lỗi khi tải bằng cấp từ server');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter levels based on search
  useEffect(() => {
    const filtered = levels.filter(level =>
      level.levelName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLevels(filtered);
  }, [searchQuery, levels]);

  const handleAddLevel = async () => {
    if (!newLevelName.trim()) {
      toast.warning('Tên bằng cấp không được trống');
      return;
    }

    // Check for duplicates
    if (levels.some(l => l.levelName.toLowerCase() === newLevelName.toLowerCase())) {
      toast.warning('Bằng cấp này đã tồn tại');
      return;
    }

    try {
      const response = await educationLevelService.createEducationLevel({
        levelName: newLevelName,
      });
      setLevels([...levels, response.data]);
      setNewLevelName('');
      setIsAddingNew(false);
      toast.success('Thêm bằng cấp thành công');
    } catch (error) {
      console.error('Error adding level:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi thêm bằng cấp');
    }
  };

  const handleUpdateLevel = async (levelId) => {
    if (!editingName.trim()) {
      toast.warning('Tên bằng cấp không được trống');
      return;
    }

    // Check for duplicates (excluding current item)
    if (levels.some(l => l.educationLevelId !== levelId && l.levelName.toLowerCase() === editingName.toLowerCase())) {
      toast.warning('Tên bằng cấp này đã tồn tại');
      return;
    }

    try {
      const response = await educationLevelService.updateEducationLevel(levelId, {
        educationLevelId: levelId,
        levelName: editingName,
      });
      setLevels(levels.map(l => (l.educationLevelId === levelId ? response.data : l)));
      setEditingId(null);
      setEditingName('');
      toast.success('Cập nhật bằng cấp thành công');
    } catch (error) {
      console.error('Error updating level:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật bằng cấp');
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa bằng cấp này?')) {
      return;
    }

    try {
      await educationLevelService.deleteEducationLevel(levelId);
      setLevels(levels.filter(l => l.educationLevelId !== levelId));
      toast.success('Xóa bằng cấp thành công');
    } catch (error) {
      console.error('Error deleting level:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi xóa bằng cấp');
    }
  };

  const handleEditStart = (level) => {
    setEditingId(level.educationLevelId);
    setEditingName(level.levelName);
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Quản lý <span className="text-primary-500">Bằng cấp</span></h1>
        <p className="text-gray-400 mt-1 font-medium">Quản lý danh sách các trình độ học vấn trong hệ thống</p>
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
                <p className="text-2xl font-black text-white">{levels.length}</p>
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
                <p className="text-2xl font-black text-white">{filteredLevels.length}</p>
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
              placeholder="Tìm kiếm bằng cấp..."
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
              placeholder="Nhập tên bằng cấp mới..."
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLevel()}
              className="flex-1 bg-gray-800/80 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 transition-all"
              autoFocus
            />
            <button
              onClick={handleAddLevel}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
            >
              <FiCheck className="w-5 h-5" />
              <span>Xác nhận</span>
            </button>
            <button
              onClick={() => {
                setIsAddingNew(false);
                setNewLevelName('');
              }}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-2.5 rounded-xl transition-all"
            >
              <FiX className="w-5 h-5" />
              <span>Hủy</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Levels List */}
      <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="animate-spin text-primary-500 text-4xl mb-4" />
            <p className="text-gray-400 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : filteredLevels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiBookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-500 font-medium">
              {searchQuery ? 'Không tìm thấy bằng cấp nào phù hợp' : 'Chưa có bằng cấp nào trong hệ thống'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredLevels.map((level) => (
              <div
                key={level.educationLevelId}
                className="p-4 flex items-center justify-between hover:bg-white/5 transition-all group"
              >
                {editingId === level.educationLevelId ? (
                  <div className="flex gap-3 flex-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateLevel(level.educationLevelId)}
                      className="flex-1 bg-gray-800 border border-primary-500/50 rounded-xl px-4 py-2 text-white focus:outline-none shadow-lg shadow-primary-500/10"
                      autoFocus
                    />
                    <button
                      onClick={() => handleUpdateLevel(level.educationLevelId)}
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
                        {level.levelName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-200 font-semibold text-lg">{level.levelName}</span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditStart(level)}
                        className="p-2.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-white rounded-xl transition-all"
                        title="Chỉnh sửa"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level.educationLevelId)}
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

export default EducationLevelsManagement;
