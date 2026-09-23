import React, { useState } from 'react';
import { 
  ShoppingBag, 
  TrendingUp, 
  TicketPercent, 
  Star, 
  ArrowUpRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet
} from 'lucide-react';
import { formatVND } from '../utils';

interface MetricsOverviewProps {
  totalOrders: number;
  totalRevenue: number;
  totalVouchersDiscount: number;
  averageRating: number;
  totalReviewsCount: number;
  pendingCount?: number;
  confirmedCount?: number;
  packedCount?: number;
  shippingCount?: number;
  selectedStatus?: string;
  onSelectStatusTab?: (status: string) => void;
  onOpenReviews: () => void;
  onOpenRevenueReport: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalOrders,
  totalRevenue,
  totalVouchersDiscount,
  averageRating,
  totalReviewsCount,
  onOpenReviews,
  onOpenRevenueReport,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="space-y-3">
      {/* Header bar with Export & Collapse toggle */}
      <div className="flex items-center justify-between px-1 gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-400"></span>
          <span className="text-xs font-bold text-slate-700 tracking-tight">
            Chỉ Số & Doanh Thu Hôm Nay
          </span>
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Export revenue report button directly on homepage */}
          <button
            id="btn-open-revenue-report"
            onClick={onOpenRevenueReport}
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/90 px-3 py-1 rounded-xl border border-emerald-200/90 transition-all shadow-2xs cursor-pointer active:scale-95"
            title="Xuất báo cáo doanh thu CSV hoặc in PDF"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Xuất Báo Cáo</span>
            <span className="hidden xs:inline-block px-1.5 py-0.2 rounded-md bg-white text-[9px] font-bold text-emerald-700 shadow-2xs">
              CSV · PDF
            </span>
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700 bg-white/80 hover:bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-200/80 transition-colors shadow-2xs cursor-pointer"
          >
            <span>{isCollapsed ? 'Mở rộng chỉ số' : 'Thu gọn'}</span>
            {isCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* 4 Streamlined Metric Cards */}
      {!isCollapsed && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          
          {/* Metric 1: Tổng đơn hàng */}
          <div 
            id="metric-total-orders"
            className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 border border-pink-100 shadow-[0_4px_16px_-4px_rgba(244,114,182,0.08)] hover:border-pink-300/80 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Tổng Đơn
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-50 text-pink-500 border border-pink-200/60 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg sm:text-2xl font-bold text-slate-800 font-['Quicksand',sans-serif]">
                  {totalOrders} <span className="text-xs font-medium text-slate-400">đơn</span>
                </h3>
                <span className="hidden xs:inline-flex items-center text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/70">
                  <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> +12%
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate font-medium">
                Gom từ 4 sàn & FB
              </p>
            </div>
          </div>

          {/* Metric 2: Tổng thu nhập - Click to open Revenue Report */}
          <div 
            id="metric-total-revenue"
            onClick={onOpenRevenueReport}
            className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 border border-rose-100 shadow-[0_4px_16px_-4px_rgba(251,113,133,0.08)] hover:border-rose-300/80 hover:shadow-md hover:shadow-rose-100/50 transition-all flex flex-col justify-between cursor-pointer group"
            title="Nhấn để xem và xuất báo cáo doanh thu chi tiết (CSV / PDF)"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Doanh Thu
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-rose-50 text-rose-500 border border-rose-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <h3 className="text-base sm:text-2xl font-bold text-slate-800 font-['Quicksand',sans-serif] truncate group-hover:text-pink-600 transition-colors">
                  {formatVND(totalRevenue)}
                </h3>
                <span className="hidden sm:inline-flex text-[10px] text-rose-600 font-semibold underline decoration-rose-300">
                  Báo cáo ↗
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate font-medium flex items-center justify-between">
                <span>Thực nhận sau trừ phí</span>
                <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1 rounded">CSV/PDF</span>
              </p>
            </div>
          </div>

          {/* Metric 3: Tổng voucher giảm giá */}
          <div 
            id="metric-total-vouchers"
            className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 border border-purple-100/90 shadow-[0_4px_16px_-4px_rgba(216,180,254,0.08)] hover:border-purple-300/80 transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Voucher Trợ Giá
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-50 text-purple-600 border border-purple-200/60 flex items-center justify-center shrink-0">
                <TicketPercent className="w-3.5 h-3.5" />
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-2xl font-bold text-purple-900 font-['Quicksand',sans-serif] truncate">
                {formatVND(totalVouchersDiscount)}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate font-medium">
                Ưu đãi Shop & Sàn
              </p>
            </div>
          </div>

          {/* Metric 4: Đánh giá của khách hàng */}
          <div 
            id="metric-customer-ratings"
            onClick={onOpenReviews}
            className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white/95 border border-amber-100 shadow-[0_4px_16px_-4px_rgba(252,211,77,0.08)] hover:border-amber-300/80 transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider truncate">
                Đánh Giá
              </span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-500 border border-amber-200/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-800 font-['Quicksand',sans-serif]">
                    {averageRating}
                  </h3>
                  <span className="text-amber-400 text-xs">★</span>
                </div>
                <span className="text-[10px] sm:text-xs text-pink-600 font-semibold underline decoration-pink-300">
                  {totalReviewsCount} review
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 truncate font-medium">
                Khách hài lòng 100%
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
