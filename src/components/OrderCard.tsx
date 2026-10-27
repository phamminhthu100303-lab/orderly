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
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Eye, 
  Printer, 
  PackageCheck,
  Star,
  MessageSquare,
  MapPin as MapPinIcon,
  Tag
} from 'lucide-react';
import { motion } from 'motion/react';
import { Platform } from '../types';

interface OrderCardProps {
  order: Order;
  isSelected?: boolean;
  onToggleSelect?: (orderId: string) => void;
  onChangePlatform?: (orderId: string, newPlatform: Platform) => void;
  onViewDetails: (order: Order) => void;
  onOpenPackingCheck: (order: Order) => void;
  onQuickUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onPrintLabel: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  isSelected,
  onToggleSelect,
  onChangePlatform,
  onViewDetails,
  onOpenPackingCheck,
  onQuickUpdateStatus,
  onPrintLabel,
}) => {
  const platformMeta = getPlatformMeta(order.platform);
  const statusMeta = getStatusMeta(order.status);

  // Platform icon resolver
  const renderPlatformIcon = () => {
    switch (order.platform) {
      case 'shopee': return <ShoppingBag className="w-3 h-3 text-[#EE4D2D]" />;
      case 'tiktok': return <Video className="w-3 h-3 text-slate-900" />;
      case 'lazada': return <Store className="w-3 h-3 text-[#0F146D]" />;
      case 'facebook': return <MessageCircle className="w-3 h-3 text-[#1877F2]" />;
      case 'instagram': return <Camera className="w-3 h-3 text-[#E1306C]" />;
      case 'zalo': return <MessageSquare className="w-3 h-3 text-[#0068FF]" />;
      case 'website': return <Globe className="w-3 h-3 text-pink-600" />;
      case 'pos': return <MapPinIcon className="w-3 h-3 text-[#7C3AED]" />;
      default: return <ShoppingBag className="w-3 h-3 text-slate-500" />;
    }
  };

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const primaryItem = order.items[0];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`bg-white rounded-2xl sm:rounded-3xl border shadow-[0_2px_12px_-2px_rgba(244,114,182,0.06)] hover:shadow-lg hover:shadow-pink-200/25 transition-all p-4 flex flex-col justify-between group ${
        isSelected
          ? 'border-pink-400 ring-2 ring-pink-200/70'
          : 'border-pink-100/90 hover:border-pink-300/80'
      }`}
    >
      <div>
        {/* Top Row: Checkbox, Mã đơn, Kênh bán, Trạng thái & Giờ */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-pink-50">
          <div className="flex items-center gap-2 flex-wrap">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={() => onToggleSelect(order.id)}
                className="w-4 h-4 text-pink-500 rounded focus:ring-pink-300 accent-pink-500 cursor-pointer shrink-0"
                title="Chọn đơn để phân loại hàng loạt"
              />
            )}

            <span className="font-bold text-sm text-slate-900 font-['Quicksand',sans-serif]">
              {order.orderNumber}
            </span>

            {/* Quick manual platform switcher */}
            {onChangePlatform ? (
              <div className="flex items-center gap-1">
                <select
                  value={order.platform}
                  onChange={(e) => onChangePlatform(order.id, e.target.value as Platform)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${platformMeta.bg} ${platformMeta.color} border ${platformMeta.border} cursor-pointer focus:outline-none transition-colors hover:ring-1 hover:ring-pink-300`}
                  title="Bấm để phân loại thủ công sang App khác"
                >
                  <option value="shopee">Shopee</option>
                  <option value="tiktok">TikTok Shop</option>
                  <option value="lazada">Lazada</option>
                  <option value="facebook">Facebook Inbox</option>
                  <option value="instagram">Instagram</option>
                  <option value="zalo">Zalo Chat</option>
                  <option value="website">Website</option>
                  <option value="pos">Tại Quầy</option>
                </select>
              </div>
            ) : (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${platformMeta.bg} ${platformMeta.color}`}>
                {renderPlatformIcon()}
                <span>{platformMeta.label}</span>
              </span>
            )}

            {order.channelSourceNote && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-pink-50 text-pink-700 border border-pink-100 truncate max-w-[110px]" title={order.channelSourceNote}>
                {order.channelSourceNote}
              </span>
            )}

            {order.customer.isVip && (
              <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-amber-100 text-amber-800">
                VIP
              </span>
            )}
          </div>

          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${statusMeta.bg} ${statusMeta.color} border ${statusMeta.border}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            <span>{statusMeta.label}</span>
          </span>
        </div>

        {/* Khách hàng & Địa chỉ */}
        <div className="py-2.5 text-xs space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="font-bold text-slate-800 text-[13px] truncate">
              {order.customer.name}
              <span className="text-slate-400 font-normal text-xs ml-1.5">
                {order.customer.phone}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{order.createdAt}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{order.customer.address}</span>
          </div>
        </div>

        {/* Danh sách sản phẩm (Tinh gọn, trực quan, không rườm rà) */}
        <div className="bg-pink-50/30 rounded-xl p-2.5 border border-pink-100/50 space-y-2">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-8 h-8 rounded-lg object-cover border border-pink-100 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="truncate">
                  <div className="font-semibold text-slate-800 truncate text-[11px] sm:text-xs">
                    {item.name}
                  </div>
                  {item.variant && (
                    <div className="text-slate-400 text-[10px]">{item.variant}</div>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-slate-600 text-[11px] font-medium whitespace-nowrap">
                x{item.quantity} · <span className="font-semibold text-slate-800">{formatVND(item.price * item.quantity)}</span>
              </div>
            </div>
          ))}

          {order.items.length > 2 && (
            <div className="text-[10px] text-pink-600 font-semibold pt-0.5">
              + {order.items.length - 2} sản phẩm khác (Tổng {totalQuantity} món)
            </div>
          )}
        </div>

        {/* Thông tin tiền thu & tình trạng kiểm gói */}
        <div className="flex items-center justify-between pt-2.5 pb-1 text-xs">
          <div className="flex items-center gap-1.5">
            {order.packingVerified ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Đã kiểm gói</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                <span>Chưa kiểm gói</span>
              </span>
            )}

            <span className="text-[10px] text-slate-400 font-medium">
              {order.isPaid ? '• Đã thanh toán' : `• ${order.paymentMethod}`}
            </span>
          </div>

          <div className="text-right">
            <span className="text-sm sm:text-base font-bold text-pink-600 font-['Quicksand',sans-serif]">
              {formatVND(order.totalAmount)}
            </span>
          </div>
        </div>

        {/* Khách đánh giá ngắn gọn nếu có */}
        {order.feedback && (
          <div className="mt-1 px-2 py-1 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[10px] text-amber-800 flex items-center gap-1 truncate">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
            <span className="truncate">{order.feedback.rating}★: {order.feedback.comment}</span>
          </div>
        )}
      </div>

      {/* Dòng nút hành động gọn gàng */}
      <div className="mt-3 pt-2.5 border-t border-pink-50 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* In phiếu */}
          <button
            id={`btn-print-order-${order.id}`}
            onClick={() => onPrintLabel(order)}
            className="p-1.5 rounded-xl border border-pink-200/70 text-slate-500 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
            title="In phiếu gửi hàng"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>

          {/* Chi tiết */}
          <button
            id={`btn-view-order-${order.id}`}
            onClick={() => onViewDetails(order)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-pink-200/70 text-xs font-semibold text-slate-600 hover:text-pink-600 hover:bg-pink-50 transition-colors cursor-pointer"
          >
            <Eye className="w-3 h-3 text-pink-500" />
            <span>Chi tiết</span>
          </button>
        </div>

        {/* Nút hành động trạng thái (1 nút bấm chính rõ ràng) */}
        <div>
          {order.status === 'pending' && (
            <button
              id={`btn-confirm-order-${order.id}`}
              onClick={() => onQuickUpdateStatus(order.id, 'confirmed')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Duyệt đơn</span>
            </button>
          )}

          {order.status === 'confirmed' && (
            <button
              id={`btn-pack-order-${order.id}`}
              onClick={() => onOpenPackingCheck(order)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <PackageCheck className="w-3 h-3" />
              <span>Kiểm gói</span>
            </button>
          )}

          {order.status === 'packed' && (
            <button
              id={`btn-ship-order-${order.id}`}
              onClick={() => onQuickUpdateStatus(order.id, 'shipping')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Truck className="w-3 h-3" />
              <span>Giao Ship</span>
            </button>
          )}

          {order.status === 'shipping' && (
            <button
              id={`btn-deliver-order-${order.id}`}
              onClick={() => onQuickUpdateStatus(order.id, 'delivered')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Thành công</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
