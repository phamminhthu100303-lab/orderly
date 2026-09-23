import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { formatVND, getInventoryStatus } from '../utils';
import { 
  X, 
  PackageSearch, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  Search,
  Check,
  TrendingDown,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface InventoryModalProps {
  inventory: InventoryItem[];
  onClose: () => void;
  onUpdateActualStock: (id: string, newActual: number, reason?: string) => void;
  onSyncSystemWithActual: (id: string) => void;
  onAddNewItem: (item: Omit<InventoryItem, 'id'>) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  onClose,
  onUpdateActualStock,
  onSyncSystemWithActual,
  onAddNewItem,
}) => {
  const [search, setSearch] = useState('');
  const [filterDiscrepancyOnly, setFilterDiscrepancyOnly] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemVariant, setNewItemVariant] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Váy & Đầm');
  const [newItemPrice, setNewItemPrice] = useState(150000);
  const [newItemStock, setNewItemStock] = useState(20);

  // Reason editing modal or inline
  const [editingReasonId, setEditingReasonId] = useState<string | null>(null);
  const [tempReason, setTempReason] = useState('');

  // Calculations
  const itemsWithStatus = inventory.map(item => ({
    ...item,
    statusInfo: getInventoryStatus(item)
  }));

  const totalDiscrepancies = itemsWithStatus.filter(i => i.statusInfo.diff !== 0);
  const totalLossVnd = itemsWithStatus
    .filter(i => i.statusInfo.diff < 0)
    .reduce((sum, i) => sum + i.statusInfo.diffVnd, 0);

  const filteredItems = itemsWithStatus.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase()) ||
                          item.variant.toLowerCase().includes(search.toLowerCase());
    if (filterDiscrepancyOnly) {
      return matchesSearch && item.statusInfo.diff !== 0;
    }
    return matchesSearch;
  });

  const handleSaveReason = (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (item) {
      onUpdateActualStock(id, item.actualStock, tempReason);
    }
    setEditingReasonId(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemSku) return;

    onAddNewItem({
      name: newItemName,
      sku: newItemSku,
      variant: newItemVariant || 'Mặc định',
      category: newItemCategory,
      price: Number(newItemPrice),
      systemStock: Number(newItemStock),
      actualStock: Number(newItemStock),
      minAlertThreshold: 5,
      lastAuditDate: 'Hôm nay',
      imageUrl: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=300&q=80',
    });

    setNewItemName('');
    setNewItemSku('');
    setNewItemVariant('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-4xl w-full border border-pink-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Quicksand',sans-serif]">
                Kiểm Soát Tồn Kho & Lệch Thực Tế
              </h2>
              <p className="text-xs text-slate-500">
                Đối soát số lượng máy tính vs đếm thực tế để phòng ngừa thất thoát hàng hóa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/60 border-b border-pink-50 text-xs">
          <div className="p-3 bg-white rounded-xl border border-pink-100 shadow-2xs">
            <span className="text-slate-500 font-medium">Tổng mặt hàng trong kho</span>
            <div className="text-xl font-bold text-slate-800 mt-0.5">{inventory.length} SKU</div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs">
            <span className="text-amber-800 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Mặt hàng bị lệch số lượng
            </span>
            <div className="text-xl font-bold text-amber-900 mt-0.5">
              {totalDiscrepancies.length} sản phẩm
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs">
            <span className="text-rose-800 font-semibold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
              Ước tính thất thoát (Thiếu hụt)
            </span>
            <div className="text-xl font-bold text-rose-600 mt-0.5">
              {formatVND(totalLossVnd)}
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Add Product */}
        <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-pink-50">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã SKU, tên sp..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-pink-50/40 border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-300"
              />
            </div>
            
            <button
              onClick={() => setFilterDiscrepancyOnly(!filterDiscrepancyOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer ${
                filterDiscrepancyOnly
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Chỉ xem hàng lệch ({totalDiscrepancies.length})
            </button>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm sản phẩm</span>
          </button>
        </div>

        {/* Add Product inline form */}
        {showAddForm && (
          <form onSubmit={handleCreateProduct} className="p-4 bg-pink-50/50 border-b border-pink-100 text-xs space-y-3">
            <div className="font-bold text-slate-800">Thêm mặt hàng mới vào danh mục kho:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Tên sản phẩm *"
                required
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="p-2 rounded-xl bg-white border border-pink-200 text-xs"
              />
              <input
                type="text"
                placeholder="Mã SKU (VD: VAY-XOE-01) *"
                required
                value={newItemSku}
                onChange={(e) => setNewItemSku(e.target.value)}
                className="p-2 rounded-xl bg-white border border-pink-200 text-xs"
              />
              <input
                type="text"
                placeholder="Phân loại (Màu / Size)"
                value={newItemVariant}
                onChange={(e) => setNewItemVariant(e.target.value)}
                className="p-2 rounded-xl bg-white border border-pink-200 text-xs"
              />
              <input
                type="number"
                placeholder="Giá bán (₫)"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="p-2 rounded-xl bg-white border border-pink-200 text-xs"
              />
              <input
                type="number"
                placeholder="Số lượng nhập kho ban đầu"
                value={newItemStock}
                onChange={(e) => setNewItemStock(Number(e.target.value))}
                className="p-2 rounded-xl bg-white border border-pink-200 text-xs"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
                >
                  Lưu sản phẩm
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 bg-slate-200 text-slate-600 rounded-xl"
                >
                  Hủy
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Inventory Table */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Không tìm thấy sản phẩm nào phù hợp.
              </div>
            ) : (
              filteredItems.map((item) => {
                const isDiscrepant = item.statusInfo.diff !== 0;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isDiscrepant
                        ? 'bg-amber-50/30 border-amber-200'
                        : 'bg-white border-pink-100'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      
                      {/* Product identity */}
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover border border-pink-100 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-xs text-slate-900">{item.name}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                              {item.sku}
                            </span>
                            <span>{item.variant}</span>
                            <span>· {formatVND(item.price)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Stock Comparison: System vs Actual */}
                      <div className="flex items-center flex-wrap gap-4 text-xs">
                        
                        {/* System Stock */}
                        <div className="text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Tồn Máy Tính
                          </span>
                          <span className="font-bold text-sm text-slate-700">
                            {item.systemStock}
                          </span>
                        </div>

                        {/* Actual Physical Count with quick adjuster */}
                        <div className="text-center bg-white px-2 py-1 rounded-xl border border-pink-200 shadow-2xs">
                          <span className="text-[10px] text-pink-600 uppercase font-bold block">
                            Đếm Thực Tế
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <button
                              onClick={() => onUpdateActualStock(item.id, Math.max(0, item.actualStock - 1))}
                              className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={item.actualStock}
                              onChange={(e) => onUpdateActualStock(item.id, Math.max(0, Number(e.target.value)))}
                              className="w-10 text-center font-bold text-sm text-slate-900 focus:outline-none"
                            />
                            <button
                              onClick={() => onUpdateActualStock(item.id, item.actualStock + 1)}
                              className="w-5 h-5 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Discrepancy Difference Tag */}
                        <div className="text-center min-w-[90px]">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">
                            Độ Chênh Lệch
                          </span>
                          {item.statusInfo.diff === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1">
                              <Check className="w-3 h-3" /> Khớp 100%
                            </span>
                          ) : item.statusInfo.diff < 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 mt-1">
                              Lệch {item.statusInfo.diff} ({formatVND(item.statusInfo.diffVnd)})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 mt-1">
                              Thừa +{item.statusInfo.diff}
                            </span>
                          )}
                        </div>

                        {/* Balance button if discrepancy exists */}
                        {isDiscrepant && (
                          <button
                            onClick={() => onSyncSystemWithActual(item.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-[11px] font-semibold transition-all active:scale-95 cursor-pointer shadow-xs"
                            title="Đặt tồn máy bằng tồn thực tế sau khi đã truy thu/xác nhận"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Cân bằng</span>
                          </button>
                        )}

                      </div>

                    </div>

                    {/* Discrepancy Reason explanation line */}
                    {isDiscrepant && (
                      <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-900">
                        <div className="flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {editingReasonId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={tempReason}
                                onChange={(e) => setTempReason(e.target.value)}
                                placeholder="Ghi chú nguyên nhân lệch: hàng mẫu, sót đơn..."
                                className="px-2 py-1 text-xs rounded-lg border border-amber-300 bg-white"
                              />
                              <button
                                onClick={() => handleSaveReason(item.id)}
                                className="px-2 py-1 bg-amber-600 text-white rounded-lg text-[11px] font-bold"
                              >
                                Lưu
                              </button>
                            </div>
                          ) : (
                            <span>
                              <strong>Nguyên nhân:</strong> {item.discrepancyReason || 'Chưa ghi chú nguyên nhân'}
                            </span>
                          )}
                        </div>

                        {editingReasonId !== item.id && (
                          <button
                            onClick={() => {
                              setEditingReasonId(item.id);
                              setTempReason(item.discrepancyReason || '');
                            }}
                            className="text-[11px] text-amber-700 underline font-semibold hover:text-amber-800"
                          >
                            Sửa lý do
                          </button>
                        )}
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Mẹo: Kiểm kê định kỳ giúp shop giảm 95% sai sót khi giao hàng cho khách.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 cursor-pointer"
          >
            Xong & Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
