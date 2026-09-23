import React from 'react';
import { Order, OrderStatus } from '../types';
import { formatVND, getPlatformMeta, getStatusMeta } from '../utils';
import { 
  ShoppingBag, 
  Video, 
  Store, 
  MessageCircle, 
  Camera, 
  Globe, 
  Eye, 
  Printer, 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  Clock,
  MapPin,
  Phone,
  AlertCircle
} from 'lucide-react';

interface OrderRowProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onOpenPackingCheck: (order: Order) => void;
  onQuickUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onPrintLabel: (order: Order) => void;
}

export const OrderRow: React.FC<OrderRowProps> = ({
  order,
  onViewDetails,
  onOpenPackingCheck,
  onQuickUpdateStatus,
  onPrintLabel,
}) => {
  const platformMeta = getPlatformMeta(order.platform);
  const statusMeta = getStatusMeta(order.status);

  // Platform icon helper
  const renderPlatformIcon = () => {
    switch (order.platform) {
      case 'shopee': return <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />;
      case 'tiktok': return <Video className="w-3.5 h-3.5 text-slate-900" />;
      case 'lazada': return <Store className="w-3.5 h-3.5 text-[#0F146D]" />;
      case 'facebook': return <MessageCircle className="w-3.5 h-3.5 text-[#1877F2]" />;
      case 'instagram': return <Camera className="w-3.5 h-3.5 text-[#E1306C]" />;
      case 'website': return <Globe className="w-3.5 h-3.5 text-pink-600" />;
      default: return <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const firstItem = order.items[0];

  return (
    <div className="bg-white rounded-2xl border border-pink-100 hover:border-pink-300/80 hover:shadow-md hover:shadow-pink-100/50 transition-all p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
      
      {/* Col 1: Mã đơn, Sàn & Thời gian */}
      <div className="flex items-center gap-2.5 min-w-[170px] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-pink-50/80 border border-pink-100 flex items-center justify-center shrink-0">
          {renderPlatformIcon()}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs sm:text-sm text-slate-900 font-['Quicksand',sans-serif]">
              {order.orderNumber}
            </span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-semibold ${platformMeta.bg} ${platformMeta.color}`}>
              {platformMeta.label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <Clock className="w-3 h-3" />
            <span>{order.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Col 2: Khách hàng & Địa chỉ */}
      <div className="min-w-[160px] max-w-[200px] truncate">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-800 truncate text-[12px]">
            {order.customer.name}
          </span>
          {order.customer.isVip && (
            <span className="px-1 py-0.2 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">
              VIP
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5 truncate">
          <Phone className="w-2.5 h-2.5 text-slate-400 shrink-0" />
          <span>{order.customer.phone}</span>
        </div>
      </div>

      {/* Col 3: Sản phẩm tóm tắt */}
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        {firstItem && (
          <img
            src={firstItem.imageUrl}
            alt={firstItem.name}
            className="w-8 h-8 rounded-lg object-cover border border-pink-100 shrink-0"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="truncate">
          <div className="font-medium text-slate-700 truncate text-[11px] sm:text-xs">
            {firstItem ? firstItem.name : 'Sản phẩm'}
            {firstItem?.variant ? ` (${firstItem.variant})` : ''}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Tổng: <strong className="text-slate-600 font-semibold">{totalQuantity} món</strong>
            {order.items.length > 1 && ` (${order.items.length} phân loại)`}
          </div>
        </div>
      </div>

      {/* Col 4: Tổng tiền & Thanh toán */}
      <div className="min-w-[120px] text-left md:text-right shrink-0">
        <div className="font-bold text-sm sm:text-base text-pink-600 font-['Quicksand',sans-serif]">
          {formatVND(order.totalAmount)}
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {order.isPaid ? (
            <span className="text-emerald-600 font-semibold">Đã thanh toán</span>
          ) : (
            <span className="text-slate-500 font-medium">{order.paymentMethod}</span>
          )}
        </div>
      </div>

      {/* Col 5: Trạng thái & Kiểm gói */}
      <div className="min-w-[110px] flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1 shrink-0">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold ${statusMeta.bg} ${statusMeta.color} border ${statusMeta.border}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span>{statusMeta.label}</span>
        </span>
        {order.packingVerified ? (
          <span className="text-[10px] text-emerald-600 font-medium inline-flex items-center gap-0.5">
            <CheckCircle2 className="w-2.5 h-2.5" /> Đã kiểm gói
          </span>
        ) : (
          <span className="text-[10px] text-amber-600 font-medium inline-flex items-center gap-0.5">
            <AlertCircle className="w-2.5 h-2.5" /> Chưa kiểm gói
          </span>
        )}
      </div>

      {/* Col 6: Hành động */}
      <div className="flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-pink-50 shrink-0">
        {/* In phiếu */}
        <button
          onClick={() => onPrintLabel(order)}
          className="p-1.5 rounded-xl border border-pink-200/80 text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
          title="In phiếu gửi hàng"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>

        {/* Xem chi tiết */}
        <button
          onClick={() => onViewDetails(order)}
          className="p-1.5 rounded-xl border border-pink-200/80 text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
          title="Xem chi tiết đơn"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>

        {/* Nút hành động trạng thái */}
        {order.status === 'pending' && (
          <button
            onClick={() => onQuickUpdateStatus(order.id, 'confirmed')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Duyệt đơn
          </button>
        )}

        {order.status === 'confirmed' && (
          <button
            onClick={() => onOpenPackingCheck(order)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Kiểm gói
          </button>
        )}

        {order.status === 'packed' && (
          <button
            onClick={() => onQuickUpdateStatus(order.id, 'shipping')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Giao ship
          </button>
        )}

        {order.status === 'shipping' && (
          <button
            onClick={() => onQuickUpdateStatus(order.id, 'delivered')}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Thành công
          </button>
        )}
      </div>

    </div>
  );
};
