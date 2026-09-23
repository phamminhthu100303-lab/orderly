import React from 'react';
import { Order } from '../types';
import { formatVND, getPlatformMeta } from '../utils';
import { X, Printer, Heart, CheckCircle2, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface PrintLabelModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PrintLabelModal: React.FC<PrintLabelModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const platformMeta = getPlatformMeta(order.platform);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-xl w-full border border-pink-200 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:w-full"
      >
        {/* Modal Toolbar - Hidden during print */}
        <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-pink-500" />
            <span className="font-bold text-xs text-slate-800 font-['Quicksand',sans-serif]">
              Mẫu Phiếu Giao Hàng & Đóng Gói (A6 / Khổ Nhỏ)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500 text-white text-xs font-bold hover:bg-pink-600 shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Physical Shipping Slip */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-900 space-y-4 print:p-2">
          
          {/* Header */}
          <div className="border-2 border-dashed border-slate-800 p-4 rounded-xl space-y-3">
            
            <div className="flex items-start justify-between border-b pb-3 border-slate-300">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-base text-pink-600 font-sans">
                  <Heart className="w-4 h-4 fill-pink-500 inline" /> ORDERLY BOUTIQUE
                </div>
                <div className="text-[10px] text-slate-600 font-sans">
                  Tiệm Thời Trang & Phụ Kiện Xinh Xắn
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  Hotline: 0988.234.567 · TP. Hồ Chí Minh
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-2 py-0.5 bg-slate-100 border border-slate-300 text-[10px] font-bold uppercase rounded font-sans">
                  {platformMeta.label}
                </span>
                <div className="font-bold text-sm mt-1">{order.shippingPartner}</div>
              </div>
            </div>

            {/* Tracking Barcode simulation */}
            <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="font-bold tracking-widest text-sm mb-1">{order.trackingCode}</div>
              {/* Fake visual barcode stripes */}
              <div className="h-10 flex items-center justify-center gap-[2px] px-8 overflow-hidden">
                {[4,2,3,1,5,2,4,1,3,2,5,1,2,4,3,1,5,2,1,4,2,3,5,1,2,3,4,1,5,2,3,1,4,2,5].map((w, idx) => (
                  <div key={idx} className="bg-slate-900 h-full" style={{ width: `${w * 1.5}px` }} />
                ))}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Mã đơn: {order.orderNumber}</div>
            </div>

            {/* Sender & Receiver Boxes */}
            <div className="grid grid-cols-2 gap-3 text-[11px] font-sans border-y py-3 border-slate-300">
              <div className="border-r pr-2 border-slate-200 space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[9px]">NGƯỜI GỬI:</span>
                <div className="font-bold">Tiệm Của Nắng (Orderly)</div>
                <div className="text-slate-600 text-[10px]">Quận 3, TP. Hồ Chí Minh</div>
                <div className="text-slate-600 text-[10px]">SĐT: 0988 234 567</div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[9px]">NGƯỜI NHẬN:</span>
                <div className="font-bold text-sm text-slate-900">{order.customer.name}</div>
                <div className="font-bold text-slate-800">{order.customer.phone}</div>
                <div className="text-slate-700 text-[10px] leading-tight">{order.customer.address}</div>
              </div>
            </div>

            {/* Package Contents Checklist */}
            <div className="font-sans space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold border-b pb-1 border-slate-200">
                <span>NỘI DUNG HÀNG ({order.items.length} SẢN PHẨM):</span>
                <span>SỐ LƯỢNG</span>
              </div>
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between text-[11px] text-slate-800">
                  <span className="truncate pr-2">
                    • {item.name} {item.variant ? `(${item.variant})` : ''}
                  </span>
                  <span className="font-bold shrink-0">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Quality & Packing Verification Stamp */}
            <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center justify-between font-sans text-[11px] text-emerald-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Kiểm soát đóng gói: <strong>{order.packageBox ? order.packageBox : 'Chuẩn 100%'}</strong></span>
              </div>
              <span className="text-[10px] font-semibold bg-emerald-200/80 px-2 py-0.5 rounded">
                ĐÃ KIỂM KHO
              </span>
            </div>

            {/* Payment & COD Section */}
            <div className="border-t pt-2 border-slate-300 flex items-center justify-between font-sans">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  TIỀN THU NGƯỜI NHẬN (COD):
                </span>
                <span className="text-lg font-bold text-pink-600">
                  {order.isPaid ? '0 ₫ (ĐÃ THANH TOÁN)' : formatVND(order.totalAmount)}
                </span>
              </div>

              <div className="text-right text-[10px] text-slate-500 font-sans">
                <div>Chữ ký người nhận</div>
                <div className="h-8"></div>
                <div className="italic">(Đồng kiểm khi nhận)</div>
              </div>
            </div>

          </div>

          <p className="text-[10px] text-slate-400 text-center font-sans">
            Cảm ơn bạn đã ủng hộ Orderly Boutique! Chúc bạn luôn rạng rỡ và hạnh phúc 💕
          </p>
        </div>

        {/* Modal Footer - Hidden during print */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </div>
  );
};
