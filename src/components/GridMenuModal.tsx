import React from 'react';
import { 
  X, 
  Plus, 
  PackageSearch, 
  RefreshCw, 
  Star, 
  AlertTriangle, 
  PackageCheck, 
  Clock, 
  Truck, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  Printer,
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';

interface GridMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateOrder: () => void;
  onOpenInventory: () => void;
  onOpenReviews: () => void;
  onSyncPlatforms: () => void;
  onSelectStatus: (status: string) => void;
  onFilterUnpacked: () => void;
  onOpenRevenueReport: () => void;
  inventoryDiscrepancyCount: number;
  statusCounts: Record<string, number>;
  averageRating: number;
}

export const GridMenuModal: React.FC<GridMenuModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateOrder,
  onOpenInventory,
  onOpenReviews,
  onSyncPlatforms,
  onSelectStatus,
  onFilterUnpacked,
  onOpenRevenueReport,
  inventoryDiscrepancyCount,
  statusCounts,
  averageRating,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'create-order',
      title: 'Tạo đơn mới',
      subtitle: 'Tạo đơn COD / Chuyển khoản',
      icon: Plus,
      iconBg: 'bg-gradient-to-tr from-pink-500 to-rose-400 text-white',
      badge: '+ Mới',
      badgeColor: 'bg-pink-100 text-pink-700',
      action: () => {
        onClose();
        onOpenCreateOrder();
      },
    },
    {
      id: 'revenue-report',
      title: 'Báo cáo doanh thu',
      subtitle: 'Xuất file CSV hoặc in PDF',
      icon: FileSpreadsheet,
      iconBg: 'bg-emerald-100 text-emerald-700',
      badge: 'CSV · PDF',
      badgeColor: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
      action: () => {
        onClose();
        onOpenRevenueReport();
      },
    },
    {
      id: 'inventory',
      title: 'Kho & Lệch tồn',
      subtitle: 'Kiểm kê thực tế vs hệ thống',
      icon: PackageSearch,
      iconBg: 'bg-rose-100 text-rose-600',
      badge: inventoryDiscrepancyCount > 0 ? `Lệch ${inventoryDiscrepancyCount}` : 'Khớp 100%',
      badgeColor: inventoryDiscrepancyCount > 0 ? 'bg-rose-500 text-white' : 'bg-emerald-100 text-emerald-700',
      action: () => {
        onClose();
        onOpenInventory();
      },
    },
    {
      id: 'sync',
      title: 'Đồng bộ đa sàn',
      subtitle: 'Shopee, TikTok, Lazada, FB',
      icon: RefreshCw,
      iconBg: 'bg-purple-100 text-purple-600',
      badge: '4 Sàn',
      badgeColor: 'bg-purple-50 text-purple-700 border border-purple-200',
      action: () => {
        onClose();
        onSyncPlatforms();
      },
    },
    {
      id: 'reviews',
      title: 'Đánh giá khách',
      subtitle: 'Xem phản hồi & sao dịch vụ',
      icon: Star,
      iconBg: 'bg-amber-100 text-amber-600',
      badge: `${averageRating}★`,
      badgeColor: 'bg-amber-100 text-amber-800',
      action: () => {
        onClose();
        onOpenReviews();
      },
    },
    {
      id: 'pending-orders',
      title: 'Chờ xác nhận',
      subtitle: 'Đơn mới khách vừa đặt',
      icon: Clock,
      iconBg: 'bg-blue-100 text-blue-600',
      badge: `${statusCounts.pending || 0} đơn`,
      badgeColor: 'bg-blue-100 text-blue-800',
      action: () => {
        onSelectStatus('pending');
        onClose();
      },
    },
    {
      id: 'confirmed-orders',
      title: 'Cần đóng gói',
      subtitle: 'Đã duyệt, chuẩn bị hàng',
      icon: PackageCheck,
      iconBg: 'bg-purple-100 text-purple-600',
      badge: `${statusCounts.confirmed || 0} đơn`,
      badgeColor: 'bg-purple-100 text-purple-800',
      action: () => {
        onSelectStatus('confirmed');
        onClose();
      },
    },
    {
      id: 'shipping-orders',
      title: 'Đang vận chuyển',
      subtitle: 'Đã bàn giao shipper đi giao',
      icon: Truck,
      iconBg: 'bg-pink-100 text-pink-600',
      badge: `${statusCounts.shipping || 0} đơn`,
      badgeColor: 'bg-pink-100 text-pink-800',
      action: () => {
        onSelectStatus('shipping');
        onClose();
      },
    },
    {
      id: 'unpacked-filter',
      title: 'Chưa kiểm gói',
      subtitle: 'Phòng ngừa thất thoát nhầm lẫn',
      icon: AlertTriangle,
      iconBg: 'bg-amber-100 text-amber-600',
      badge: 'Cần quét',
      badgeColor: 'bg-amber-50 text-amber-700 border border-amber-200',
      action: () => {
        onFilterUnpacked();
        onClose();
      },
    },
    {
      id: 'all-orders',
      title: 'Tất cả đơn hàng',
      subtitle: 'Bỏ lọc & xem toàn bộ',
      icon: RotateCcw,
      iconBg: 'bg-slate-100 text-slate-600',
      badge: `${statusCounts.all || 0} đơn`,
      badgeColor: 'bg-slate-100 text-slate-700',
      action: () => {
        onSelectStatus('all');
        onClose();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl max-w-xl w-full border border-pink-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-400 to-rose-400 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800 font-['Quicksand',sans-serif]">
                Menu Tiện Ích Lưới
              </h3>
              <p className="text-xs text-slate-400">
                Truy cập thao tác nhanh cho chủ shop
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-pink-100/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3x3 Grid List */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl bg-white border border-pink-100/90 hover:border-pink-300 hover:shadow-md hover:shadow-pink-100/60 active:scale-95 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${item.iconBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <span className="text-xs sm:text-sm font-bold text-slate-800 font-['Quicksand',sans-serif] group-hover:text-pink-600 transition-colors line-clamp-1">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {item.subtitle}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-pink-50/50 border-t border-pink-100 text-center text-[11px] text-slate-500 font-medium">
          🎀 Chạm vào bất kỳ tiện ích nào để chuyển nhanh tác vụ
        </div>
      </motion.div>
    </div>
  );
};
