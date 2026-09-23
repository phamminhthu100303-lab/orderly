import React, { useState } from 'react';
import { Order, OrderItem, Platform, InventoryItem } from '../types';
import { formatVND } from '../utils';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  User, 
  MapPin, 
  Phone, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

interface CreateOrderModalProps {
  inventory: InventoryItem[];
  onClose: () => void;
  onCreateOrder: (order: Order) => void;
}

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  inventory,
  onClose,
  onCreateOrder,
}) => {
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [shippingPartner, setShippingPartner] = useState('GHTK');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Banking' | 'Ví MoMo'>('COD');
  const [isPaid, setIsPaid] = useState(false);
  const [notes, setNotes] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [shopVoucher, setShopVoucher] = useState(0);
  const [shippingFee, setShippingFee] = useState(25000);

  // Selected items in order
  const [selectedItems, setSelectedItems] = useState<{ inventoryId: string; quantity: number }[]>([
    { inventoryId: inventory[0]?.id || '', quantity: 1 }
  ]);

  const handleAddItemRow = () => {
    setSelectedItems(prev => [...prev, { inventoryId: inventory[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, inventoryId: string) => {
    setSelectedItems(prev => {
      const next = [...prev];
      next[idx].inventoryId = inventoryId;
      return next;
    });
  };

  const handleQuantityChange = (idx: number, qty: number) => {
    setSelectedItems(prev => {
      const next = [...prev];
      next[idx].quantity = Math.max(1, qty);
      return next;
    });
  };

  // Calculations
  const calculatedItems: OrderItem[] = selectedItems.map((entry, i) => {
    const inv = inventory.find(inv => inv.id === entry.inventoryId) || inventory[0];
    return {
      id: `new-item-${Date.now()}-${i}`,
      name: inv.name,
      sku: inv.sku,
      variant: inv.variant,
      price: inv.price,
      quantity: entry.quantity,
      imageUrl: inv.imageUrl,
      checkedForPacking: false,
    };
  });

  const subtotal = calculatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = Math.max(0, subtotal + shippingFee - shopVoucher);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || calculatedItems.length === 0) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingPrefix = shippingPartner === 'GHTK' ? 'S194' : shippingPartner === 'GHN' ? 'GHN' : 'SPX';

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${randomSuffix}`,
      platform,
      createdAt: new Date().toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }) + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress || 'Chưa cập nhật địa chỉ chi tiết',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        isVip: false,
        totalOrdersCount: 1,
      },
      items: calculatedItems,
      subtotal,
      shippingFee,
      shopVoucher,
      platformVoucher: 0,
      totalAmount,
      paymentMethod,
      isPaid,
      shippingPartner,
      trackingCode: `${trackingPrefix}${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes,
      internalNote,
      packingVerified: false,
    };

    onCreateOrder(newOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-2xl w-full border border-pink-100 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-pink-50 via-white to-pink-50 border-b border-pink-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center shadow-xs">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-['Quicksand',sans-serif]">
                Tạo Đơn Hàng Mới
              </h2>
              <p className="text-xs text-slate-500">
                Nhập đơn chốt qua livestream, Direct Instagram hoặc tin nhắn Facebook
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Platform selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nguồn đơn hàng (Nền tảng):
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 text-xs">
              {(['facebook', 'instagram', 'tiktok', 'shopee', 'lazada', 'website'] as Platform[]).map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-2 rounded-xl border text-center capitalize font-semibold transition-all cursor-pointer ${
                    platform === p
                      ? 'bg-pink-500 text-white border-pink-500 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-pink-50/50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 rounded-2xl bg-pink-50/30 border border-pink-100 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-pink-500" />
              Thông tin khách nhận hàng:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tên khách hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Phương Uyên"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  placeholder="09xx xxx xxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Địa chỉ giao hàng</label>
                <input
                  type="text"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-300"
                />
              </div>
            </div>
          </div>

          {/* Product Items Picker */}
          <div className="p-4 rounded-2xl bg-white border border-pink-100 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5 text-pink-500" />
                Sản phẩm trong đơn:
              </span>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm món</span>
              </button>
            </div>

            <div className="space-y-2">
              {selectedItems.map((entry, idx) => {
                const currentInv = inventory.find(i => i.id === entry.inventoryId) || inventory[0];
                return (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-pink-50/40 border border-pink-100">
                    <select
                      value={entry.inventoryId}
                      onChange={(e) => handleItemChange(idx, e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-white border border-pink-200 text-xs focus:outline-none cursor-pointer"
                    >
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.id}>
                          {inv.name} ({inv.variant}) - {formatVND(inv.price)} (Tồn: {inv.actualStock})
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-pink-200">
                      <span className="text-[11px] text-slate-400">SL:</span>
                      <input
                        type="number"
                        min="1"
                        value={entry.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        className="w-10 text-center font-bold text-xs"
                      />
                    </div>

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Calculations breakdown */}
            <div className="pt-2 border-t border-pink-100 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold">{formatVND(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Phí vận chuyển (₫):</span>
                <input
                  type="number"
                  value={shippingFee}
                  onChange={(e) => setShippingFee(Number(e.target.value))}
                  className="w-24 p-1 text-right text-xs rounded border border-slate-200"
                />
              </div>
              <div className="flex items-center justify-between text-purple-700">
                <span>Voucher giảm giá (₫):</span>
                <input
                  type="number"
                  value={shopVoucher}
                  onChange={(e) => setShopVoucher(Number(e.target.value))}
                  className="w-24 p-1 text-right text-xs rounded border border-purple-200 bg-purple-50/50"
                />
              </div>
              <div className="pt-2 border-t border-pink-100 flex justify-between font-bold text-sm text-slate-900">
                <span>Tổng tiền thanh toán:</span>
                <span className="text-base text-pink-600 font-['Quicksand',sans-serif]">
                  {formatVND(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment configs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Đơn vị vận chuyển</label>
              <select
                value={shippingPartner}
                onChange={(e) => setShippingPartner(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-pink-200"
              >
                <option value="GHTK">Giao Hàng Tiết Kiệm (GHTK)</option>
                <option value="GHN">Giao Hàng Nhanh (GHN)</option>
                <option value="SPX Express">SPX Express</option>
                <option value="Viettel Post">Viettel Post</option>
                <option value="J&T Express">J&T Express</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Phương thức thanh toán</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-white border border-pink-200"
              >
                <option value="COD">Thanh toán khi nhận (COD)</option>
                <option value="Banking">Chuyển khoản ngân hàng</option>
                <option value="Ví MoMo">Ví điện tử MoMo</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lời nhắn của khách</label>
              <input
                type="text"
                placeholder="Giao giờ hành chính, gọi trước..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-pink-200"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Ghi chú nội bộ shop</label>
              <input
                type="text"
                placeholder="Khách livestream chốt đơn, tặng nơ..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white border border-pink-200"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm hover:from-pink-600 hover:to-rose-500 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác nhận tạo đơn</span>
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};
