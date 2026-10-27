import React, { useState, useMemo } from 'react';
import { Order, Platform } from '../types';
import { formatVND, getPlatformMeta, getStatusMeta, extractMonthYearFromDate, exportOrdersToCSV } from '../utils';
import { 
  X, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  TrendingUp, 
  ShoppingBag, 
  TicketPercent, 
  CreditCard, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { motion } from 'motion/react';

interface RevenueReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export const RevenueReportModal: React.FC<RevenueReportModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  // Extract distinct months from orders
  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    orders.forEach((o) => {
      const my = extractMonthYearFromDate(o.createdAt);
      if (my) monthsSet.add(my);
    });
    // Add default months if empty
    if (monthsSet.size === 0) {
      monthsSet.add('09/2026');
    }
    return Array.from(monthsSet).sort().reverse();
  }, [orders]);

  const [selectedMonth, setSelectedMonth] = useState<string>('09/2026');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  // Filter orders by month and platform
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderMonth = extractMonthYearFromDate(order.createdAt);
      const matchesMonth = selectedMonth === 'all' || orderMonth === selectedMonth;
      const matchesPlatform = selectedPlatform === 'all' || order.platform === selectedPlatform;
      return matchesMonth && matchesPlatform;
    });
  }, [orders, selectedMonth, selectedPlatform]);

  // Calculations for report
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalSubtotal = filteredOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalShopVoucher = filteredOrders.reduce((sum, o) => sum + o.shopVoucher, 0);
    const totalPlatformVoucher = filteredOrders.reduce((sum, o) => sum + o.platformVoucher, 0);
    const totalVouchers = totalShopVoucher + totalPlatformVoucher;
    const totalShipping = filteredOrders.reduce((sum, o) => sum + o.shippingFee, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    // Status breakdown
    const deliveredCount = filteredOrders.filter((o) => o.status === 'delivered').length;
    const shippingCount = filteredOrders.filter((o) => o.status === 'shipping').length;
    const packedCount = filteredOrders.filter((o) => o.status === 'packed').length;
    const confirmedCount = filteredOrders.filter((o) => o.status === 'confirmed').length;
    const pendingCount = filteredOrders.filter((o) => o.status === 'pending').length;
    const cancelledCount = filteredOrders.filter((o) => o.status === 'cancelled').length;

    const completionRate = totalOrders > 0 
      ? Math.round(((deliveredCount + shippingCount + packedCount) / totalOrders) * 100) 
      : 0;

    // Platform breakdown
    const platformBreakdown: Record<Platform, { count: number; revenue: number; percentage: number }> = {
      shopee: { count: 0, revenue: 0, percentage: 0 },
      tiktok: { count: 0, revenue: 0, percentage: 0 },
      lazada: { count: 0, revenue: 0, percentage: 0 },
      facebook: { count: 0, revenue: 0, percentage: 0 },
      instagram: { count: 0, revenue: 0, percentage: 0 },
      zalo: { count: 0, revenue: 0, percentage: 0 },
      website: { count: 0, revenue: 0, percentage: 0 },
      pos: { count: 0, revenue: 0, percentage: 0 },
    };

    filteredOrders.forEach((o) => {
      if (platformBreakdown[o.platform]) {
        platformBreakdown[o.platform].count += 1;
        platformBreakdown[o.platform].revenue += o.totalAmount;
      }
    });

    Object.keys(platformBreakdown).forEach((k) => {
      const p = k as Platform;
      platformBreakdown[p].percentage = totalRevenue > 0 
        ? Math.round((platformBreakdown[p].revenue / totalRevenue) * 100) 
        : 0;
    });

    // Top selling items
    const itemMap = new Map<string, { name: string; sku: string; quantity: number; revenue: number; category?: string }>();
    filteredOrders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.sku || item.name;
        const existing = itemMap.get(key) || {
          name: item.name,
          sku: item.sku,
          quantity: 0,
          revenue: 0,
        };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemMap.set(key, existing);
      });
    });

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalOrders,
      totalRevenue,
      totalSubtotal,
      totalShopVoucher,
      totalPlatformVoucher,
      totalVouchers,
      totalShipping,
      avgOrderValue,
      completionRate,
      deliveredCount,
      shippingCount,
      packedCount,
      confirmedCount,
      pendingCount,
      cancelledCount,
      platformBreakdown,
      topItems,
    };
  }, [filteredOrders]);

  if (!isOpen) return null;

  // Handle export CSV
  const handleExportCSV = () => {
    const periodLabel = selectedMonth === 'all' ? 'Tat_Ca' : selectedMonth.replace('/', '_');
    exportOrdersToCSV(filteredOrders, `Bao_Cao_Doanh_Thu_Orderly_${periodLabel}.csv`);
  };

  // Handle Print PDF
  const handlePrintPDF = () => {
    window.print();
  };

  const periodTitle = selectedMonth === 'all' ? 'Toàn bộ thời gian' : `Tháng ${selectedMonth}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      
      {/* Print-specific style overrides */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-revenue-report, #printable-revenue-report * {
            visibility: visible;
          }
          #printable-revenue-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 16px;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <motion.div
        id="printable-revenue-report"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl max-w-5xl w-full border border-pink-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:rounded-none"
      >
        {/* Header - Not printed controls, but print displays clean branded header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 flex items-center justify-between no-print">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-400 text-white flex items-center justify-center shadow-md shadow-pink-200">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-800 font-['Quicksand',sans-serif]">
                  Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-bold bg-pink-100/70 text-pink-700 rounded-full">
                  CSV · PDF Export
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Theo dõi doanh số, voucher trợ giá, tỷ lệ đơn và phân bổ đa sàn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-pink-100/50 transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters Bar (Hidden on print) */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-pink-100/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 no-print">
          
          {/* Selectors */}
          <div className="flex items-center flex-wrap gap-2">
            {/* Month Filter */}
            <div className="flex items-center gap-1.5 bg-pink-50/60 border border-pink-200/80 rounded-2xl px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="font-semibold text-slate-500 text-[11px]">Kỳ báo cáo:</span>
              <select
                id="select-report-month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-pink-700 focus:outline-none cursor-pointer pr-1"
              >
                <option value="all">Tất cả thời gian</option>
                {availableMonths.map((m) => (
                  <option key={m} value={m}>
                    Tháng {m} {m === '09/2026' ? '(Hiện tại)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-pink-200/80 rounded-2xl px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-semibold text-slate-500 text-[11px]">Kênh bán:</span>
              <select
                id="select-report-platform"
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="all">Tất cả kênh bán</option>
                <option value="shopee">Shopee</option>
                <option value="tiktok">TikTok Shop</option>
                <option value="lazada">Lazada</option>
                <option value="facebook">Facebook Direct</option>
                <option value="instagram">Instagram</option>
                <option value="website">Website POS</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Export CSV button */}
            <button
              id="btn-export-csv"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Tải về file Excel / CSV đầy đủ dữ liệu"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Xuất File CSV</span>
            </button>

            {/* Export / Print PDF button */}
            <button
              id="btn-export-pdf"
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 hover:from-pink-600 hover:to-rose-500 text-white shadow-xs shadow-pink-200 transition-all active:scale-95 cursor-pointer"
              title="In hoặc tải bản PDF báo cáo tiêu chuẩn"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In / Lưu PDF</span>
            </button>
          </div>

        </div>

        {/* Scrollable Report Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 print:overflow-visible print:p-0">
          
          {/* Printable Official Document Header (Visible in print and screen) */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-pink-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent font-['Quicksand',sans-serif]">
                  Orderly Boutique
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-pink-50 text-pink-700 border border-pink-200 rounded-full">
                  Báo Cáo Doanh Thu
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kỳ thống kê: <strong className="text-slate-800">{periodTitle}</strong> · Kênh: {selectedPlatform === 'all' ? 'Tất cả các sàn' : selectedPlatform.toUpperCase()}
              </p>
            </div>

            <div className="text-left sm:text-right text-[11px] text-slate-400">
              <div>Ngày xuất: <span className="text-slate-700 font-medium">{new Date().toLocaleDateString('vi-VN')}</span></div>
              <div>Tổng số đơn trong kỳ: <span className="text-pink-600 font-bold">{stats.totalOrders} đơn</span></div>
            </div>
          </div>

          {/* 4 Key Summary Performance Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card 1: Doanh thu thực nhận */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-pink-50/70 via-white to-pink-50/40 border border-pink-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Doanh Thu Thực Nhận</span>
                <TrendingUp className="w-4 h-4 text-pink-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-pink-600 font-['Quicksand',sans-serif]">
                {formatVND(stats.totalRevenue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Doanh số tiền về tài khoản shop
              </div>
            </div>

            {/* Card 2: Tổng đơn & Tỷ lệ hoàn thành */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Đơn Hàng & Tiến Độ</span>
                <ShoppingBag className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg sm:text-2xl font-bold text-slate-800 font-['Quicksand',sans-serif]">
                  {stats.totalOrders} <span className="text-xs font-normal text-slate-400">đơn</span>
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Tỷ lệ đóng gói & đang giao
              </div>
            </div>

            {/* Card 3: Tổng trợ giá voucher */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-purple-100 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Voucher Trợ Giá</span>
                <TicketPercent className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-purple-900 font-['Quicksand',sans-serif]">
                {formatVND(stats.totalVouchers)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Shop: {formatVND(stats.totalShopVoucher)} · Sàn: {formatVND(stats.totalPlatformVoucher)}
              </div>
            </div>

            {/* Card 4: Giá trị trung bình mỗi đơn (AOV) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-xs mb-1.5">
                <span className="font-semibold uppercase tracking-wider text-[10px]">Giá Trị TB / Đơn (AOV)</span>
                <CreditCard className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-lg sm:text-2xl font-bold text-slate-800 font-['Quicksand',sans-serif]">
                {formatVND(stats.avgOrderValue)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Mức chi tiêu trung bình của khách
              </div>
            </div>

          </div>

          {/* Section 2: Platform Distribution & Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Phân bổ doanh số theo sàn */}
            <div className="p-4 rounded-2xl bg-white border border-pink-100/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 font-['Quicksand',sans-serif]">
                  <Layers className="w-4 h-4 text-pink-500" />
                  <span>Doanh Số Theo Kênh Bán Hàng</span>
                </h3>
                <span className="text-[11px] text-slate-400">Tỷ trọng</span>
              </div>

              <div className="space-y-2.5 pt-1">
                {(['shopee', 'tiktok', 'lazada', 'facebook', 'instagram', 'website'] as Platform[]).map((plt) => {
                  const info = getPlatformMeta(plt);
                  const data = stats.platformBreakdown[plt];
                  if (data.count === 0 && selectedPlatform !== 'all') return null;

                  return (
                    <div key={plt} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${info.bg} border ${info.border}`}></span>
                          {info.label} ({data.count} đơn)
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{formatVND(data.revenue)}</span>
                          <span className="text-[10px] font-bold text-slate-400 w-8 text-right">{data.percentage}%</span>
                        </div>
                      </div>
                      {/* Bar */}
                      <div className="w-full h-1.5 bg-pink-50 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-pink-400 to-rose-400 rounded-full transition-all duration-500"
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top sản phẩm bán chạy */}
            <div className="p-4 rounded-2xl bg-white border border-pink-100/90 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5 font-['Quicksand',sans-serif]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Top 5 Sản Phẩm Bán Chạy Nhất</span>
                </h3>
                <span className="text-[11px] text-slate-400">Số lượng & Doanh số</span>
              </div>

              <div className="space-y-2 pt-1">
                {stats.topItems.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">
                    Không có sản phẩm nào trong kỳ báo cáo này
                  </div>
                ) : (
                  stats.topItems.map((item, idx) => (
                    <div key={item.sku || idx} className="flex items-center justify-between p-2 rounded-xl bg-pink-50/30 text-xs border border-pink-100/60">
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                          #{idx + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-semibold text-slate-800 block truncate text-[11px] sm:text-xs">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400">SKU: {item.sku}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-bold text-pink-600 text-xs">{formatVND(item.revenue)}</div>
                        <div className="text-[10px] text-slate-400">Đã bán: {item.quantity} cái</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Section 3: Detailed Order Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800 font-['Quicksand',sans-serif]">
                Chi Tiết Danh Sách Đơn Hàng ({filteredOrders.length} đơn)
              </h3>
              <span className="text-[11px] text-slate-400">
                Hiển thị {filteredOrders.length} / {orders.length} đơn
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-pink-100 shadow-2xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-pink-50/60 text-slate-600 border-b border-pink-100 font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Mã Đơn</th>
                    <th className="py-2.5 px-3">Thời Gian</th>
                    <th className="py-2.5 px-3">Kênh Bán</th>
                    <th className="py-2.5 px-3">Khách Hàng</th>
                    <th className="py-2.5 px-3">Sản Phẩm</th>
                    <th className="py-2.5 px-3 text-right">Giảm Voucher</th>
                    <th className="py-2.5 px-3 text-right">Thực Nhận</th>
                    <th className="py-2.5 px-3 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                        Không tìm thấy đơn hàng nào trong khoảng thời gian đã chọn.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const plat = getPlatformMeta(ord.platform);
                      const status = getStatusMeta(ord.status);
                      const totalVoucher = ord.shopVoucher + ord.platformVoucher;

                      return (
                        <tr key={ord.id} className="hover:bg-pink-50/30 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-slate-800 font-['Quicksand',sans-serif]">
                            {ord.orderNumber}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 text-[11px] whitespace-nowrap">
                            {ord.createdAt}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${plat.bg} ${plat.color} border ${plat.border}`}>
                              {plat.label}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800 text-[11px]">{ord.customer.name}</div>
                            <div className="text-[10px] text-slate-400">{ord.customer.phone}</div>
                          </td>
                          <td className="py-2.5 px-3 max-w-[200px]">
                            <div className="truncate text-slate-700 text-[11px]">
                              {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-right text-purple-700 font-medium text-[11px]">
                            {totalVoucher > 0 ? `-${formatVND(totalVoucher)}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-pink-600 text-xs">
                            {formatVND(ord.totalAmount)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color} border ${status.border}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {filteredOrders.length > 0 && (
                  <tfoot>
                    <tr className="bg-pink-50/80 font-bold text-slate-800 border-t border-pink-200 text-xs">
                      <td colSpan={5} className="py-3 px-3 text-right">
                        TỔNG CỘNG DOANH THU THỰC NHẬN:
                      </td>
                      <td className="py-3 px-3 text-right text-purple-800">
                        -{formatVND(stats.totalVouchers)}
                      </td>
                      <td className="py-3 px-3 text-right text-pink-600 text-sm">
                        {formatVND(stats.totalRevenue)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Signature / Verification stamp for printed reports */}
          <div className="hidden print:flex items-center justify-between pt-10 text-xs text-slate-700">
            <div className="text-center">
              <p className="font-semibold">Người lập báo cáo</p>
              <p className="text-[10px] text-slate-400 mt-0.5">(Ký và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-medium text-slate-500">Orderly System</p>
            </div>

            <div className="text-center">
              <p className="font-semibold">Chủ Cửa Hàng / Kế Toán</p>
              <p className="text-[10px] text-slate-400 mt-0.5">(Ký và đóng dấu)</p>
              <div className="h-16"></div>
              <p className="font-medium text-slate-500">Orderly Boutique Manager</p>
            </div>
          </div>

        </div>

        {/* Modal Footer with quick export actions */}
        <div className="p-3 sm:p-4 bg-pink-50/50 border-t border-pink-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 no-print">
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>File CSV xuất ra có gắn mã UTF-8 BOM, mở bằng Excel tiếng Việt hoàn toàn không bị lỗi font chữ.</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải file .CSV</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-xs font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
