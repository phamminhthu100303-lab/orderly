import React, { useState, useMemo } from 'react';
import { Order, Platform } from '../types';
import { formatVND, getPlatformMeta } from '../utils';
import { 
  X, 
  Layers, 
  ShoppingBag, 
  Video, 
  Store, 
  MessageCircle, 
  Camera, 
  Globe, 
  Check, 
  CheckCheck, 
  Search, 
  Tag, 
  Sparkles, 
  MessageSquare, 
  MapPin, 
  Clock, 
  Filter,
  ArrowRight,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ManualAppClassificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onUpdateOrderPlatform: (orderId: string, newPlatform: Platform, channelNote?: string) => void;
  onBatchUpdatePlatform: (orderIds: string[], newPlatform: Platform) => void;
}

export const AVAILABLE_PLATFORMS: { id: Platform; label: string; shortLabel: string; icon: any; color: string; bg: string; borderColor: string }[] = [
  { id: 'shopee', label: 'Shopee', shortLabel: 'Shopee', icon: ShoppingBag, color: 'text-[#EE4D2D]', bg: 'bg-[#FFF3F0]', borderColor: 'border-[#FFD2C9]' },
  { id: 'tiktok', label: 'TikTok Shop', shortLabel: 'TikTok', icon: Video, color: 'text-[#000000]', bg: 'bg-[#F4F4F5]', borderColor: 'border-[#E4E4E7]' },
  { id: 'lazada', label: 'Lazada', shortLabel: 'Lazada', icon: Store, color: 'text-[#0F146D]', bg: 'bg-[#EEF1FF]', borderColor: 'border-[#CDD6FF]' },
  { id: 'facebook', label: 'Facebook Inbox', shortLabel: 'Facebook', icon: MessageCircle, color: 'text-[#1877F2]', bg: 'bg-[#EFF6FF]', borderColor: 'border-[#BFDBFE]' },
  { id: 'instagram', label: 'Instagram Direct', shortLabel: 'Instagram', icon: Camera, color: 'text-[#E1306C]', bg: 'bg-[#FDF2F8]', borderColor: 'border-[#FBCFE8]' },
  { id: 'zalo', label: 'Zalo Chat', shortLabel: 'Zalo', icon: MessageSquare, color: 'text-[#0068FF]', bg: 'bg-[#EFF6FF]', borderColor: 'border-[#BFDBFE]' },
  { id: 'website', label: 'Website Tiệm', shortLabel: 'Website', icon: Globe, color: 'text-[#EC4899]', bg: 'bg-[#FDF2F8]', borderColor: 'border-[#FBCFE8]' },
  { id: 'pos', label: 'Tại Quầy (POS)', shortLabel: 'Tại Quầy', icon: MapPin, color: 'text-[#7C3AED]', bg: 'bg-[#F5F3FF]', borderColor: 'border-[#DDD6FE]' },
];

export const ManualAppClassificationModal: React.FC<ManualAppClassificationModalProps> = ({
  isOpen,
  onClose,
  orders,
  onUpdateOrderPlatform,
  onBatchUpdatePlatform,
}) => {
  const [selectedFilterApp, setSelectedFilterApp] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [editingNoteOrderId, setEditingNoteOrderId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Channel summary calculation
  const platformStats = useMemo(() => {
    const stats: Record<string, { count: number; totalRevenue: number }> = {
      all: { count: orders.length, totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0) }
    };

    AVAILABLE_PLATFORMS.forEach(p => {
      const match = orders.filter(o => o.platform === p.id);
      stats[p.id] = {
        count: match.length,
        totalRevenue: match.reduce((s, o) => s + o.totalAmount, 0)
      };
    });

    return stats;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (selectedFilterApp !== 'all' && o.platform !== selectedFilterApp) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = o.orderNumber.toLowerCase().includes(q);
        const matchCustomer = o.customer.name.toLowerCase().includes(q);
        const matchPhone = o.customer.phone.includes(q);
        const matchNote = (o.channelSourceNote || '').toLowerCase().includes(q);
        if (!matchNumber && !matchCustomer && !matchPhone && !matchNote) return false;
      }
      return true;
    });
  }, [orders, selectedFilterApp, searchQuery]);

  // Select all visible orders
  const handleToggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const handleToggleOrderSelect = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // Batch reassign
  const handleBatchAssign = (platform: Platform) => {
    if (selectedOrderIds.length === 0) return;
    onBatchUpdatePlatform(selectedOrderIds, platform);
    const targetMeta = AVAILABLE_PLATFORMS.find(p => p.id === platform);
    showToast(`Đã chuyển ${selectedOrderIds.length} đơn hàng sang kênh "${targetMeta?.label}" thành công!`);
    setSelectedOrderIds([]);
  };

  // Single reassign
  const handleSingleAssign = (orderId: string, platform: Platform) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if (currentOrder?.platform === platform) return;
    onUpdateOrderPlatform(orderId, platform);
    const targetMeta = AVAILABLE_PLATFORMS.find(p => p.id === platform);
    showToast(`Đã gán đơn ${currentOrder?.orderNumber} sang "${targetMeta?.label}"!`);
  };

  const handleSaveNote = (orderId: string) => {
    const currentOrder = orders.find(o => o.id === orderId);
    if (!currentOrder) return;
    onUpdateOrderPlatform(orderId, currentOrder.platform, tempNote);
    setEditingNoteOrderId(null);
    showToast('Đã lưu ghi chú nguồn kênh bán!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-5xl w-full border border-pink-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-rose-50/50 to-pink-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Quicksand',sans-serif]">
                  Phân Loại Thủ Công Đơn Hàng Từ Các App
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">
                  {orders.length} đơn
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Gán sàn, phân nhóm nguồn đơn từ Shopee, TikTok, Lazada, Facebook, Zalo, POS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels Overview Row - Filter by App */}
        <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-pink-100/60 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            {/* All */}
            <button
              onClick={() => setSelectedFilterApp('all')}
              className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                selectedFilterApp === 'all'
                  ? 'bg-white border-pink-400 ring-2 ring-pink-200/80 shadow-xs'
                  : 'bg-white/80 border-slate-200/80 hover:bg-white text-slate-700'
              }`}
            >
              <div className="w-7 h-7 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Tất cả kênh</div>
                <div className="text-[10px] text-slate-500">
                  <strong className="text-pink-600">{platformStats.all.count}</strong> đơn · {formatVND(platformStats.all.totalRevenue)}
                </div>
              </div>
            </button>

            {/* Individual Platforms */}
            {AVAILABLE_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedFilterApp === platform.id;
              const stats = platformStats[platform.id] || { count: 0, totalRevenue: 0 };

              return (
                <button
                  key={platform.id}
                  onClick={() => setSelectedFilterApp(platform.id)}
                  className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                    isSelected
                      ? `bg-white ${platform.borderColor} ring-2 ring-pink-200/80 shadow-xs`
                      : 'bg-white/80 border-slate-200/80 hover:bg-white text-slate-700'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-xl ${platform.bg} ${platform.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>{platform.shortLabel}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      <strong className={stats.count > 0 ? platform.color : 'text-slate-400'}>
                        {stats.count}
                      </strong> đơn
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Search & Batch Action Bar */}
        <div className="p-3 sm:p-4 bg-white border-b border-pink-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã đơn, khách, SĐT hoặc ghi chú nguồn..."
              className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-pink-50/30 border border-pink-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-800"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selection controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleSelectAll}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-pink-200/80 bg-pink-50/50 hover:bg-pink-100/60 text-xs font-semibold text-slate-700 transition-all cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5 text-pink-600" />
              <span>
                {selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0
                  ? 'Bỏ chọn tất cả'
                  : `Chọn tất cả (${filteredOrders.length})`}
              </span>
            </button>

            {selectedOrderIds.length > 0 && (
              <span className="text-xs font-bold text-pink-700 bg-pink-100 px-2.5 py-1 rounded-xl">
                Đã chọn {selectedOrderIds.length} đơn
              </span>
            )}
          </div>

        </div>

        {/* Batch action banner when items are selected */}
        {selectedOrderIds.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b border-pink-200 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-600 shrink-0" />
              <span className="text-xs font-bold text-slate-800">
                Phân loại nhanh {selectedOrderIds.length} đơn hàng đã chọn sang App:
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_PLATFORMS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleBatchAssign(p.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-white border border-pink-200 hover:border-pink-400 hover:shadow-xs text-slate-800 transition-all cursor-pointer active:scale-95"
                  >
                    <Icon className={`w-3.5 h-3.5 ${p.color}`} />
                    <span>{p.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders List for Classification */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/30">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Không tìm thấy đơn hàng nào phù hợp với bộ lọc</p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const currentMeta = getPlatformMeta(order.platform);
              const isSelected = selectedOrderIds.includes(order.id);
              const isEditingNote = editingNoteOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`p-3.5 sm:p-4 rounded-2xl bg-white border transition-all ${
                    isSelected
                      ? 'border-pink-400 ring-2 ring-pink-200/70 shadow-sm'
                      : 'border-pink-100 hover:border-pink-200 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    
                    {/* Left: Checkbox + Order Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleOrderSelect(order.id)}
                        className="w-4 h-4 mt-1 text-pink-500 rounded focus:ring-pink-300 accent-pink-500 cursor-pointer shrink-0"
                      />

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs sm:text-sm text-slate-900 font-['Quicksand',sans-serif]">
                            {order.orderNumber}
                          </span>
                          
                          {/* Current platform badge */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${currentMeta.bg} ${currentMeta.color} border ${currentMeta.border}`}>
                            <span>{currentMeta.label}</span>
                          </span>

                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {order.createdAt}
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-slate-800">{order.customer.name}</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-mono text-slate-500">{order.customer.phone}</span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-500">{order.items.length} món</span>
                          <span className="text-slate-400">·</span>
                          <span className="font-bold text-pink-600">{formatVND(order.totalAmount)}</span>
                        </div>

                        {/* Channel Source Note */}
                        <div className="pt-1">
                          {isEditingNote ? (
                            <div className="flex items-center gap-2 max-w-md">
                              <input
                                type="text"
                                value={tempNote}
                                onChange={(e) => setTempNote(e.target.value)}
                                placeholder="Ghi chú nguồn (VD: Livestream TikTok 20h, Khách inbox Zalo...)"
                                className="w-full px-2.5 py-1 text-xs rounded-lg border border-pink-300 focus:outline-none focus:ring-1 focus:ring-pink-400 text-slate-800"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveNote(order.id)}
                                className="px-2.5 py-1 text-xs font-bold bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors cursor-pointer shrink-0"
                              >
                                Lưu
                              </button>
                              <button
                                onClick={() => setEditingNoteOrderId(null)}
                                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                Hủy
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="text-slate-400">Nguồn chi tiết:</span>
                              {order.channelSourceNote ? (
                                <span className="font-medium text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 inline-flex items-center gap-1">
                                  <Tag className="w-2.5 h-2.5" />
                                  {order.channelSourceNote}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Chưa có ghi chú nguồn cụ thể</span>
                              )}
                              <button
                                onClick={() => {
                                  setEditingNoteOrderId(order.id);
                                  setTempNote(order.channelSourceNote || '');
                                }}
                                className="text-slate-400 hover:text-pink-600 p-0.5 transition-colors cursor-pointer"
                                title="Sửa ghi chú nguồn"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>

                    {/* Right: Quick Assign Buttons for this Order */}
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1 shrink-0">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1 hidden sm:inline">
                        Gán sang:
                      </span>
                      {AVAILABLE_PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        const isCurrent = order.platform === platform.id;

                        return (
                          <button
                            key={platform.id}
                            type="button"
                            onClick={() => handleSingleAssign(order.id, platform.id)}
                            className={`px-2 py-1 rounded-xl text-[11px] font-semibold border flex items-center gap-1 transition-all cursor-pointer ${
                              isCurrent
                                ? `${platform.bg} ${platform.color} ${platform.borderColor} ring-1 ring-current shadow-2xs font-bold cursor-default`
                                : 'bg-white border-slate-200/90 text-slate-600 hover:border-pink-300 hover:bg-pink-50/40'
                            }`}
                            title={`Chuyển sang ${platform.label}`}
                          >
                            <Icon className="w-3 h-3 shrink-0" />
                            <span>{platform.shortLabel}</span>
                            {isCurrent && <Check className="w-3 h-3 stroke-[3]" />}
                          </button>
                        );
                      })}
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="text-xs text-slate-500">
            💡 Mẹo: Bấm trực tiếp vào các nút kênh (Shopee, TikTok, Zalo...) để chuyển sàn ngay lập tức.
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Đóng bảng phân loại
          </button>
        </div>

        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="fixed bottom-6 right-6 z-60 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold"
            >
              <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
