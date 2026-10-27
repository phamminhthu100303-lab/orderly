import React from 'react';
import { 
  ShoppingBag, 
  Video, 
  Store, 
  MessageCircle, 
  Camera, 
  Globe, 
  AlertTriangle, 
  ArrowUpDown, 
  Layers,
  MessageSquare,
  MapPin,
  X 
} from 'lucide-react';

interface OrderFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  filterUnpackedOnly: boolean;
  onToggleUnpackedOnly: () => void;
  statusCounts: Record<string, number>;
}

export const OrderFilterBar: React.FC<OrderFilterBarProps> = ({
  selectedStatus,
  onSelectStatus,
  selectedPlatform,
  onSelectPlatform,
  sortBy,
  onSortByChange,
  filterUnpackedOnly,
  onToggleUnpackedOnly,
  statusCounts,
}) => {
  const statusTabs = [
    { key: 'all', label: 'Tất cả', count: statusCounts.all || 0 },
    { key: 'pending', label: 'Chờ duyệt', count: statusCounts.pending || 0 },
    { key: 'confirmed', label: 'Cần gói', count: statusCounts.confirmed || 0 },
    { key: 'packed', label: 'Chờ ship', count: statusCounts.packed || 0 },
    { key: 'shipping', label: 'Đang ship', count: statusCounts.shipping || 0 },
    { key: 'delivered', label: 'Thành công', count: statusCounts.delivered || 0 },
    { key: 'cancelled', label: 'Đã hủy', count: statusCounts.cancelled || 0 },
  ];

  const platforms = [
    { key: 'all', label: 'Tất cả App / Kênh' },
    { key: 'shopee', label: 'Shopee' },
    { key: 'tiktok', label: 'TikTok Shop' },
    { key: 'lazada', label: 'Lazada' },
    { key: 'facebook', label: 'Facebook Inbox' },
    { key: 'instagram', label: 'Instagram Direct' },
    { key: 'zalo', label: 'Zalo Chat' },
    { key: 'website', label: 'Website Tiệm' },
    { key: 'pos', label: 'Tại Quầy (POS)' },
  ];

  const renderPlatformIcon = () => {
    switch (selectedPlatform) {
      case 'shopee': return <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />;
      case 'tiktok': return <Video className="w-3.5 h-3.5 text-slate-900" />;
      case 'lazada': return <Store className="w-3.5 h-3.5 text-[#0F146D]" />;
      case 'facebook': return <MessageCircle className="w-3.5 h-3.5 text-[#1877F2]" />;
      case 'instagram': return <Camera className="w-3.5 h-3.5 text-[#E1306C]" />;
      case 'zalo': return <MessageSquare className="w-3.5 h-3.5 text-[#0068FF]" />;
      case 'website': return <Globe className="w-3.5 h-3.5 text-pink-600" />;
      case 'pos': return <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const hasFilterActive = selectedPlatform !== 'all' || filterUnpackedOnly || selectedStatus !== 'all';

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-pink-100/70 shadow-2xs p-2 sm:p-2.5 flex flex-col md:flex-row md:items-center justify-between gap-2">
      
      {/* 1. Dải Tab Trạng Thái Tối Giản (Cuộn ngang êm ái, tối ưu điện thoại & máy tính) */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 min-w-0 flex-1">
        {statusTabs.map((tab) => {
          const isActive = selectedStatus === tab.key;
          return (
            <button
              key={tab.key}
              id={`tab-status-${tab.key}`}
              onClick={() => onSelectStatus(tab.key)}
              className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-pink-50/60 font-medium'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold transition-colors ${
                  isActive
                    ? 'bg-white/25 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Công cụ lọc phụ tối giản (Sàn, Chưa gói, Sắp xếp) */}
      <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0 pt-1 md:pt-0 border-t md:border-t-0 border-pink-50/80">
        
        {/* Chọn sàn */}
        <div className="flex items-center gap-1 bg-pink-50/40 hover:bg-pink-50/80 border border-pink-100 rounded-xl px-2.5 py-1 text-xs text-slate-700 transition-colors">
          {renderPlatformIcon()}
          <select
            id="select-filter-platform"
            value={selectedPlatform}
            onChange={(e) => onSelectPlatform(e.target.value)}
            className="bg-transparent border-none text-[11px] sm:text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
          >
            {platforms.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chưa gói */}
        <button
          id="btn-filter-unpacked"
          onClick={onToggleUnpackedOnly}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold border transition-all cursor-pointer active:scale-95 ${
            filterUnpackedOnly
              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs font-bold'
              : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50/50'
          }`}
          title="Chỉ hiển thị đơn chưa kiểm gói"
        >
          <AlertTriangle className={`w-3 h-3 ${filterUnpackedOnly ? 'text-amber-700' : 'text-slate-400'}`} />
          <span className="hidden xs:inline">Chưa gói</span>
          {filterUnpackedOnly && <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>}
        </button>

        {/* Sắp xếp */}
        <div className="flex items-center gap-1 bg-white border border-pink-100 rounded-xl px-2 py-1 text-xs text-slate-700 shadow-2xs">
          <ArrowUpDown className="w-3 h-3 text-slate-400 shrink-0" />
          <select
            id="order-sort-select"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="bg-transparent border-none text-[11px] sm:text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="amount-desc">Giá cao</option>
            <option value="amount-asc">Giá thấp</option>
          </select>
        </div>

        {/* Xóa lọc */}
        {hasFilterActive && (
          <button
            onClick={() => {
              onSelectStatus('all');
              onSelectPlatform('all');
              if (filterUnpackedOnly) onToggleUnpackedOnly();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
            title="Đặt lại toàn bộ bộ lọc"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

      </div>

    </div>
  );
};
