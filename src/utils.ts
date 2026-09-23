import { Platform, OrderStatus, InventoryItem, Order } from './types';
import { PLATFORM_INFO, STATUS_CONFIG } from './mockData';

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}

export function getPlatformMeta(platform: Platform) {
  return PLATFORM_INFO[platform] || {
    label: platform,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    iconName: 'ShoppingBag'
  };
}

export function getStatusMeta(status: OrderStatus) {
  return STATUS_CONFIG[status] || {
    label: status,
    color: 'text-slate-700',
    bg: 'bg-slate-100',
    border: 'border-slate-200',
    stepIndex: 0
  };
}

export interface InventoryDiscrepancyStatus {
  diff: number; // actual - system (âm nghĩa là thất thoát/thiếu, dương là dư)
  diffVnd: number;
  status: 'match' | 'deficit' | 'surplus';
  isLowStock: boolean;
  alertMessage: string;
}

export function getInventoryStatus(item: InventoryItem): InventoryDiscrepancyStatus {
  const diff = item.actualStock - item.systemStock;
  const diffVnd = Math.abs(diff) * item.price;
  const isLowStock = item.actualStock <= item.minAlertThreshold;

  let status: 'match' | 'deficit' | 'surplus' = 'match';
  let alertMessage = 'Khớp tồn kho';

  if (diff < 0) {
    status = 'deficit';
    alertMessage = `Thất thoát ${Math.abs(diff)} sản phẩm`;
  } else if (diff > 0) {
    status = 'surplus';
    alertMessage = `Thừa ${diff} sản phẩm so với máy`;
  }

  return {
    diff,
    diffVnd,
    status,
    isLowStock,
    alertMessage,
  };
}

/**
 * Trích xuất tháng/năm từ chuỗi ngày tháng của đơn hàng (VD: "15/09/2026 18:15" -> "09/2026")
 */
export function extractMonthYearFromDate(dateStr: string): string {
  if (!dateStr) return '09/2026';
  const firstPart = dateStr.trim().split(' ')[0]; // "15/09/2026"
  const tokens = firstPart.split('/');
  if (tokens.length >= 3) {
    return `${tokens[1]}/${tokens[2]}`; // "09/2026"
  }
  return '09/2026';
}

/**
 * Xuất dữ liệu đơn hàng ra file CSV chuẩn UTF-8 (tương thích 100% Microsoft Excel, Google Sheets có dấu)
 */
export function exportOrdersToCSV(orders: Order[], filename?: string): void {
  const BOM = '\uFEFF';
  const headers = [
    'Mã đơn hàng',
    'Thời gian tạo',
    'Kênh bán hàng',
    'Tên khách hàng',
    'Số điện thoại',
    'Địa chỉ giao hàng',
    'Chi tiết sản phẩm & số lượng',
    'Tổng tiền hàng (VNĐ)',
    'Phí vận chuyển (VNĐ)',
    'Voucher Shop (VNĐ)',
    'Voucher Sàn (VNĐ)',
    'Tổng thanh toán / Thực nhận (VNĐ)',
    'Phương thức thanh toán',
    'Tình trạng thanh toán',
    'Đơn vị vận chuyển',
    'Mã vận đơn',
    'Trạng thái đơn hàng',
    'Kiểm tra đóng gói',
    'Ghi chú đơn'
  ];

  const escapeCSV = (value: string | number | boolean | null | undefined): string => {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = orders.map((ord) => {
    const itemsStr = ord.items
      .map((i) => `${i.name}${i.variant ? ` (${i.variant})` : ''} x${i.quantity}`)
      .join('; ');
    const platformLabel = getPlatformMeta(ord.platform).label;
    const statusLabel = getStatusMeta(ord.status).label;

    return [
      escapeCSV(ord.orderNumber),
      escapeCSV(ord.createdAt),
      escapeCSV(platformLabel),
      escapeCSV(ord.customer.name),
      escapeCSV(ord.customer.phone),
      escapeCSV(ord.customer.address),
      escapeCSV(itemsStr),
      escapeCSV(ord.subtotal),
      escapeCSV(ord.shippingFee),
      escapeCSV(ord.shopVoucher),
      escapeCSV(ord.platformVoucher),
      escapeCSV(ord.totalAmount),
      escapeCSV(ord.paymentMethod),
      escapeCSV(ord.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'),
      escapeCSV(ord.shippingPartner),
      escapeCSV(ord.trackingCode),
      escapeCSV(statusLabel),
      escapeCSV(ord.packingVerified ? 'Đã kiểm tra' : 'Chưa kiểm tra'),
      escapeCSV(ord.notes || '')
    ].join(',');
  });

  // Calculate summary metrics
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalSubtotal = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalVouchers = orders.reduce((sum, o) => sum + o.shopVoucher + o.platformVoucher, 0);

  const summaryRows = [
    '',
    [escapeCSV('=== TỔNG KẾT BÁO CÁO DOANH THU ===')].join(','),
    [escapeCSV('Tổng số đơn hàng:'), escapeCSV(totalOrders)].join(','),
    [escapeCSV('Tổng giá trị hàng (chưa trừ voucher):'), escapeCSV(totalSubtotal)].join(','),
    [escapeCSV('Tổng trợ giá voucher:'), escapeCSV(totalVouchers)].join(','),
    [escapeCSV('Tổng doanh thu thực nhận:'), escapeCSV(totalRevenue)].join(','),
    [escapeCSV('Thời điểm xuất báo cáo:'), escapeCSV(new Date().toLocaleString('vi-VN'))].join(','),
    [escapeCSV('Hệ thống:'), escapeCSV('Orderly Boutique Management')].join(',')
  ];

  const csvContent = BOM + [headers.join(','), ...rows, ...summaryRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    filename || `Bao_Cao_Doanh_Thu_Orderly_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
