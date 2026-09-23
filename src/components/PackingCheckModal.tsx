import React, { useState, useMemo } from 'react';
import { Order } from '../types';
import { getPlatformMeta, formatVND } from '../utils';
import { 
  X, 
  PackageCheck, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Gift, 
  ShieldCheck, 
  Printer, 
  CheckCircle2,
  Box,
  Lightbulb,
  AlertTriangle,
  Scale,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { STANDARD_BOXES, recommendCartonBox } from '../utils/boxSizing';

interface PackingCheckModalProps {
  order: Order | null;
  onClose: () => void;
  onCompletePacking: (orderId: string, boxNote?: string) => void;
  onPrintLabel: (order: Order) => void;
}

export const PackingCheckModal: React.FC<PackingCheckModalProps> = ({
  order,
  onClose,
  onCompletePacking,
  onPrintLabel,
}) => {
  if (!order) return null;

  // Box sizing calculation based on item dimensions and quantities
  const recommendation = useMemo(() => recommendCartonBox(order), [order]);

  // Selected box ID state
  const [selectedBoxId, setSelectedBoxId] = useState<string>(() => {
    if (order.packageBox) {
      const match = STANDARD_BOXES.find(b => order.packageBox?.includes(b.code) || order.packageBox?.includes(b.dimensionString));
      if (match) return match.id;
    }
    return recommendation.suggestedBox.id;
  });

  const selectedBox = STANDARD_BOXES.find(b => b.id === selectedBoxId) || recommendation.suggestedBox;

  // Track checked items
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    order.items.forEach(item => {
      initial[item.id] = !!item.checkedForPacking;
    });
    return initial;
  });

  // Additional quality control checklist
  const [hasFreebie, setHasFreebie] = useState(order.packingVerified || false);
  const [hasFragileProtection, setHasFragileProtection] = useState(order.packingVerified || recommendation.hasFragileItem);
  const [hasSecuritySeal, setHasSecuritySeal] = useState(order.packingVerified || false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);

  const toggleItem = (itemId: string) => {
    setCheckedItemIds(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const allItemsChecked = order.items.every(item => checkedItemIds[item.id]);

  const handleFinish = () => {
    setShowSuccessCelebration(true);
    const boxSummary = `${selectedBox.name} (${selectedBox.dimensionString})`;
    setTimeout(() => {
      onCompletePacking(order.id, boxSummary);
      onClose();
    }, 1200);
  };

  const platformMeta = getPlatformMeta(order.platform);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full border border-pink-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shadow-sm">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 font-['Quicksand',sans-serif]">
                  Kiểm Soát Đóng Gói & Đề Xuất Cỡ Thùng
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${platformMeta.bg} ${platformMeta.color}`}>
                  {platformMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Đơn hàng: <strong className="text-slate-800">{order.orderNumber}</strong> · Khách: <strong>{order.customer.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Note warning if customer left special instructions */}
          {order.notes && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Lưu ý từ khách hàng:</strong> "{order.notes}"
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 0: GỢI Ý CỠ THÙNG CARTON DỰA TRÊN SẢN PHẨM & SỐ LƯỢNG */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-pink-50/60 rounded-2xl sm:rounded-3xl border border-amber-200/90 p-3.5 sm:p-4 space-y-3 shadow-2xs">
            
            {/* Header gợi ý */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-xs">
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Gợi ý cỡ thùng carton tối ưu
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/90 text-amber-900 shadow-2xs">
                      <Sparkles className="w-2.5 h-2.5 text-amber-700" />
                      Tự động tính theo đơn
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Đơn gồm <strong>{recommendation.totalQuantity} món</strong> · Thể tích ước tính: <strong>~{recommendation.estimatedVolumeCm3.toLocaleString()} cm³</strong>
                  </p>
                </div>
              </div>

              {/* Tag cỡ đang chọn */}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs font-bold text-amber-950 bg-white px-2.5 py-1 rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1">
                  <span>Cỡ chọn:</span>
                  <span className="text-pink-600 font-extrabold">{selectedBox.code}</span>
                  <span className="text-slate-400 font-mono text-[11px]">({selectedBox.dimensionString})</span>
                </span>
              </div>
            </div>

            {/* Bộ chọn nhanh 5 kích cỡ thùng thông dụng */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {STANDARD_BOXES.map((box) => {
                const isSelected = selectedBoxId === box.id;
                const isSuggested = recommendation.suggestedBox.id === box.id;

                return (
                  <button
                    key={box.id}
                    type="button"
                    onClick={() => setSelectedBoxId(box.id)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-amber-500 ring-2 ring-amber-400/80 shadow-xs'
                        : 'bg-white/80 border-slate-200/80 hover:border-amber-300 hover:bg-white'
                    }`}
                  >
                    {isSuggested && (
                      <span className="absolute -top-2 right-1.5 px-1.5 py-0.2 rounded-md bg-gradient-to-r from-amber-600 to-rose-500 text-white text-[8px] font-extrabold uppercase tracking-tight shadow-2xs">
                        ⭐ Khuyên dùng
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-900' : 'text-slate-800'}`}>
                          {box.code}
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 stroke-[3]" />}
                      </div>

                      <div className="text-[10px] font-bold text-slate-600 mt-0.5 font-mono">
                        {box.dimensionString}
                      </div>
                    </div>

                    <div className="text-[9px] text-slate-400 mt-1 pt-1 border-t border-slate-100 flex items-center justify-between">
                      <span>{box.type === 'bag' ? 'Túi dán keo' : `~${box.volumetricWeightGrams}g`}</span>
                      <span className="font-semibold text-slate-500">{formatVND(box.estimatedCostVnd)}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Đánh giá độ lấp đầy & Mẹo đóng gói */}
            <div className="p-2.5 rounded-xl bg-white/95 border border-amber-100/90 text-xs space-y-1.5">
              
              {/* Thanh đo lấp đầy thùng */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 flex items-center gap-1 font-medium">
                  <Maximize2 className="w-3 h-3 text-amber-500" />
                  Độ lấp đầy hộp dự kiến:
                </span>
                <span className="font-bold text-slate-700">
                  {recommendation.fitPercentage}% thể tích ({selectedBox.name})
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    recommendation.fitPercentage > 90 
                      ? 'bg-rose-500' 
                      : recommendation.fitPercentage >= 70 
                        ? 'bg-emerald-500' 
                        : 'bg-amber-400'
                  }`}
                  style={{ width: `${recommendation.fitPercentage}%` }}
                />
              </div>

              {/* Lời khuyên đóng gói thông minh */}
              <div className="flex items-start gap-1.5 pt-0.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>Mẹo đóng gói:</strong> {recommendation.packingAdvice}
                </div>
              </div>

              {/* Cảnh báo hàng dễ vỡ */}
              {recommendation.hasFragileItem && (
                <div className="flex items-center gap-1.5 pt-1 text-[11px] text-rose-700 font-semibold bg-rose-50/70 p-1.5 rounded-lg border border-rose-200/60">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>
                    Đơn có hàng dễ móp/vỡ ({recommendation.fragileItemNames.join(', ')}): Đã tự động dự trù khoảng trống cho màng bóng khí 2 lớp!
                  </span>
                </div>
              )}

            </div>

          </div>

          {/* ======================================================== */}
          {/* Section 1: Item Checklist with Variants */}
          {/* ======================================================== */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1. Kiểm tra từng món hàng (Đúng SKU, màu & size):
              </span>
              <span className="text-xs font-semibold text-pink-600">
                Đã kiểm: {Object.values(checkedItemIds).filter(Boolean).length}/{order.items.length} món
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => {
                const isChecked = !!checkedItemIds[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-white border-pink-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                        isChecked
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>

                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-pink-100 shrink-0"
                        referrerPolicy="no-referrer"
                      />

                      <div>
                        <div className="text-xs font-bold text-slate-800">{item.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-semibold text-slate-700">
                            {item.sku}
                          </span>
                          {item.variant && (
                            <span className="px-1.5 py-0.2 rounded bg-pink-100 text-pink-800 font-bold">
                              {item.variant}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-slate-500 block">Số lượng cần gói</span>
                      <span className="text-base font-bold text-slate-900">
                        x{item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* Section 2: Extra Anti-Loss & Delight Checklist */}
          {/* ======================================================== */}
          <div className="space-y-2 pt-2 border-t border-pink-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
              2. Tiêu chuẩn đóng gói Orderly (Chống thất thoát & vỡ hỏng):
            </span>

            <div className="space-y-2 text-xs">
              
              {/* Freebie / Card check */}
              <label className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-pink-50/30 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFreebie}
                  onChange={(e) => setHasFreebie(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-300 accent-pink-500"
                />
                <Gift className="w-4 h-4 text-purple-500 shrink-0" />
                <span className="text-slate-700 font-medium">
                  Đã bỏ <strong>Thiệp cảm ơn + Quà tặng kèm / Sticker</strong> cho khách
                </span>
              </label>

              {/* Fragile check */}
              <label className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-pink-50/30 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFragileProtection}
                  onChange={(e) => setHasFragileProtection(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-300 accent-pink-500"
                />
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-slate-700 font-medium">
                  Đã bọc <strong>Bóng khí chống sốc / Dán tem Hàng Dễ Vỡ</strong> (nếu có mỹ phẩm/thủy tinh)
                </span>
              </label>

              {/* Security Seal */}
              <label className="p-2.5 rounded-xl border border-pink-200 bg-pink-50/30 flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSecuritySeal}
                  onChange={(e) => setHasSecuritySeal(e.target.checked)}
                  className="w-4 h-4 text-pink-500 rounded focus:ring-pink-300 accent-pink-500"
                />
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0" />
                <span className="text-slate-800 font-bold">
                  Đã dán băng keo niêm phong hộp & dán đúng mã vận đơn: <span className="font-mono text-pink-600">{order.trackingCode}</span>
                </span>
              </label>

            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintLabel(order)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In tem vận đơn</span>
            </button>
            <span className="hidden sm:inline-block text-[11px] text-slate-500">
              Đóng gói bằng: <strong className="text-slate-700">{selectedBox.code} ({selectedBox.dimensionString})</strong>
            </span>
          </div>

          <button
            onClick={handleFinish}
            disabled={!allItemsChecked}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
              allItemsChecked
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-emerald-200 hover:from-emerald-700 hover:to-teal-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác nhận đóng gói hoàn tất</span>
          </button>
        </div>

        {/* Success animation toast */}
        <AnimatePresence>
          {showSuccessCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-6 text-center space-y-3"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-['Quicksand',sans-serif]">
                Tuyệt Vời! Đã Đóng Gói Xong ✨
              </h3>
              <p className="text-xs text-slate-600 max-w-sm">
                Đơn hàng {order.orderNumber} đã kiểm tra 100% bằng <strong>{selectedBox.name} ({selectedBox.dimensionString})</strong>. Đã chuyển sang trạng thái <strong>Đã đóng gói</strong> sẵn sàng giao shipper!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};
