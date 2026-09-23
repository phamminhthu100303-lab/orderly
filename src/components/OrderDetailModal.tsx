import React, { useState } from 'react';
import { 
  Order, 
  OrderStatus 
} from '../types';
import { 
  formatVND, 
  getPlatformMeta, 
  getStatusMeta 
} from '../utils';
import { 
  X, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  Truck, 
  Copy, 
  Check, 
  Star, 
  PackageCheck, 
  Printer, 
  AlertCircle,
  MessageSquare,
  Edit3,
  Save,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
  onUpdateInternalNote: (orderId: string, note: string) => void;
  onOpenPackingCheck: (order: Order) => void;
  onPrintLabel: (order: Order) => void;
  onReplyFeedback: (orderId: string, replyText: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onUpdateStatus,
  onUpdateInternalNote,
  onOpenPackingCheck,
  onPrintLabel,
  onReplyFeedback,
}) => {
  if (!order) return null;

  const [copiedTracking, setCopiedTracking] = useState(false);
  const [internalNoteInput, setInternalNoteInput] = useState(order.internalNote || '');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [replyInput, setReplyInput] = useState(order.feedback?.reply || '');
  const [isReplying, setIsReplying] = useState(false);

  const platformMeta = getPlatformMeta(order.platform);
  const statusMeta = getStatusMeta(order.status);

  const copyTracking = () => {
    navigator.clipboard.writeText(order.trackingCode);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const handleSaveNote = () => {
    onUpdateInternalNote(order.id, internalNoteInput);
    setIsEditingNote(false);
  };

  const handleSendReply = () => {
    onReplyFeedback(order.id, replyInput);
    setIsReplying(false);
  };

  const statusTimeline: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'pending', label: 'Đặt đơn', desc: order.createdAt },
    { key: 'confirmed', label: 'Đã xác nhận', desc: 'Shop đã duyệt' },
    { key: 'packed', label: 'Đã đóng gói', desc: order.packedAt || 'Chờ kiểm hàng' },
    { key: 'shipping', label: 'Đang giao', desc: order.shippedAt || 'Shipper đã lấy' },
    { key: 'delivered', label: 'Thành công', desc: 'Khách đã nhận' },
  ];

  const getStepState = (stepKey: OrderStatus) => {
    const orderIndex = ['pending', 'confirmed', 'packed', 'shipping', 'delivered'].indexOf(order.status);
    const stepIndex = ['pending', 'confirmed', 'packed', 'shipping', 'delivered'].indexOf(stepKey);
    if (order.status === 'cancelled') return 'cancelled';
    if (stepIndex < orderIndex) return 'completed';
    if (stepIndex === orderIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl max-w-3xl w-full border border-pink-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-pink-50 via-white to-pink-50/50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-lg">
              #{order.orderNumber.replace('ORD-', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 font-['Quicksand',sans-serif]">
                  Chi Tiết Đơn Hàng {order.orderNumber}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${platformMeta.bg} ${platformMeta.color} border ${platformMeta.border}`}>
                  {platformMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Đặt lúc: {order.createdAt}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintLabel(order)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-pink-50/70 hover:text-pink-600 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In phiếu gửi</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Status Stepper Progression */}
          <div className="bg-pink-50/40 p-4 rounded-2xl border border-pink-100/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Tiến trình đơn hàng
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Chuyển trạng thái:</span>
                <select
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                  className="text-xs font-semibold bg-white border border-pink-200 rounded-xl px-2.5 py-1 text-pink-700 focus:outline-none cursor-pointer"
                >
                  <option value="pending">Chưa xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="packed">Đã đóng gói</option>
                  <option value="shipping">Đang giao shipper</option>
                  <option value="delivered">Giao thành công</option>
                  <option value="cancelled">Hủy đơn</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
              {statusTimeline.map((step, idx) => {
                const state = getStepState(step.key);
                let badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                if (state === 'completed') badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                if (state === 'current') badgeStyle = 'bg-pink-500 text-white border-pink-500 shadow-xs shadow-pink-200';

                return (
                  <div key={step.key} className={`p-2.5 rounded-xl border text-xs text-center ${badgeStyle} transition-all`}>
                    <div className="font-bold flex items-center justify-center gap-1">
                      {state === 'completed' && <Check className="w-3.5 h-3.5" />}
                      <span>{step.label}</span>
                    </div>
                    <div className="text-[10px] mt-0.5 opacity-80 truncate">
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two-Column: Customer Info & Shipping info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Box */}
            <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-pink-500" />
                  Thông tin khách hàng
                </span>
                {order.customer.isVip && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    Khách VIP ({order.customer.totalOrdersCount} đơn)
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="font-bold text-sm text-slate-900">
                  {order.customer.name}
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{order.customer.phone}</span>
                </div>
                <div className="flex items-start gap-1.5 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{order.customer.address}</span>
                </div>
                {order.notes && (
                  <div className="mt-2 p-2 rounded-xl bg-pink-50/50 border border-pink-100 text-[11px] text-pink-900">
                    <strong>Ghi chú của khách:</strong> {order.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Shipping & Payment Box */}
            <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-pink-500" />
                Vận chuyển & Thanh toán
              </span>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Đơn vị vận chuyển:</span>
                  <span className="font-bold text-slate-800">{order.shippingPartner}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Mã vận đơn:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-800">
                      {order.trackingCode}
                    </span>
                    <button
                      onClick={copyTracking}
                      className="p-1 text-slate-400 hover:text-pink-600 transition-colors"
                      title="Sao chép mã"
                    >
                      {copiedTracking ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {order.packageBox && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cỡ thùng đóng gói:</span>
                    <span className="font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      📦 {order.packageBox}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Phương thức:</span>
                  <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Trạng thái thanh toán:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    order.isPaid 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {order.isPaid ? 'Đã thanh toán trước' : 'Thu tiền khi nhận (COD)'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Product Items Table */}
          <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Sản phẩm trong đơn ({order.items.length} món)
              </span>
              <button
                onClick={() => onOpenPackingCheck(order)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 transition-all cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{order.packingVerified ? 'Xem lại kiểm gói' : 'Mở bảng kiểm gói chống sai sót'}</span>
              </button>
            </div>

            <div className="divide-y divide-pink-50">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-11 h-11 rounded-xl object-cover border border-pink-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-slate-800">{item.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>SKU: <strong>{item.sku}</strong></span>
                        {item.variant && <span>· Phân loại: <strong>{item.variant}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-slate-500">
                      {formatVND(item.price)} × {item.quantity}
                    </div>
                    <div className="font-bold text-slate-900">
                      {formatVND(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial summary calculations */}
            <div className="pt-3 border-t border-pink-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tiền hàng (Tạm tính):</span>
                <span>{formatVND(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Phí vận chuyển:</span>
                <span>+{formatVND(order.shippingFee)}</span>
              </div>
              {order.shopVoucher > 0 && (
                <div className="flex justify-between text-purple-600 font-medium">
                  <span>Voucher giảm giá của Shop:</span>
                  <span>-{formatVND(order.shopVoucher)}</span>
                </div>
              )}
              {order.platformVoucher > 0 && (
                <div className="flex justify-between text-purple-600 font-medium">
                  <span>Trợ giá sàn ({platformMeta.label}):</span>
                  <span>-{formatVND(order.platformVoucher)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-pink-100 flex justify-between text-sm font-bold text-slate-900">
                <span>Tổng tiền thực thu:</span>
                <span className="text-base text-pink-600 font-['Quicksand',sans-serif]">
                  {formatVND(order.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Internal Note Section for Shop Owner */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-pink-500" />
                Ghi chú nội bộ cho shop (chỉ nhân viên/chủ shop thấy)
              </span>
              {!isEditingNote ? (
                <button
                  onClick={() => setIsEditingNote(true)}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-pink-600 hover:text-pink-700"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Sửa ghi chú</span>
                </button>
              ) : (
                <button
                  onClick={handleSaveNote}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700"
                >
                  <Save className="w-3 h-3" />
                  <span>Lưu lại</span>
                </button>
              )}
            </div>

            {isEditingNote ? (
              <div className="space-y-2">
                <textarea
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  placeholder="Ghi chú dặn dò: quà tặng, bọc kỹ, khách đổi địa chỉ..."
                  className="w-full p-2.5 rounded-xl bg-white border border-pink-200 text-xs focus:ring-2 focus:ring-pink-300 focus:outline-none"
                  rows={2}
                />
              </div>
            ) : (
              <p className="text-slate-600 italic">
                {order.internalNote || 'Chưa có ghi chú nội bộ cho đơn này.'}
              </p>
            )}
          </div>

          {/* Customer Feedback & Reply Section */}
          {order.feedback && (
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  Đánh giá & Phản hồi từ khách ({order.feedback.rating} sao)
                </span>
                <span className="text-[11px] text-slate-400">{order.feedback.date}</span>
              </div>

              <p className="text-slate-800 text-xs font-medium bg-white p-3 rounded-xl border border-amber-100">
                "{order.feedback.comment}"
              </p>

              {/* Tags */}
              {order.feedback.tags && (
                <div className="flex flex-wrap gap-1.5">
                  {order.feedback.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Shop Reply */}
              {order.feedback.reply ? (
                <div className="p-2.5 rounded-xl bg-pink-50 border border-pink-200/70 text-[11px] text-pink-900 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-pink-700">
                    <span>Phản hồi của shop:</span>
                  </div>
                  <p>{order.feedback.reply}</p>
                </div>
              ) : (
                <div className="space-y-1.5 pt-1">
                  {!isReplying ? (
                    <button
                      onClick={() => setIsReplying(true)}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 underline"
                    >
                      + Trả lời đánh giá của khách
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={replyInput}
                        onChange={(e) => setReplyInput(e.target.value)}
                        placeholder="Cảm ơn nàng nhiều nha, chúc nàng..."
                        className="w-full p-2 text-xs rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-300"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setIsReplying(false)}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={handleSendReply}
                          className="px-3 py-1 text-xs font-bold bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                        >
                          Gửi phản hồi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            Đóng
          </button>
          
          <div className="flex items-center gap-2">
            {order.status === 'confirmed' && (
              <button
                onClick={() => {
                  onOpenPackingCheck(order);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm hover:opacity-95 transition-all cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                <span>Tiến hành kiểm gói</span>
              </button>
            )}

            {order.status === 'packed' && (
              <button
                onClick={() => {
                  onUpdateStatus(order.id, 'shipping');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-pink-500 hover:bg-pink-600 text-white shadow-sm transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>Giao shipper ngay</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
