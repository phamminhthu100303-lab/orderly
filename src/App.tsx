import React, { useState, useEffect, useMemo } from 'react';
import { 
  Order, 
  InventoryItem, 
  OrderStatus, 
  Platform 
} from './types';
import { 
  INITIAL_ORDERS, 
  INITIAL_INVENTORY, 
  STORAGE_KEYS, 
  calculateMetrics 
} from './mockData';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { OrderFilterBar } from './components/OrderFilterBar';
import { OrderCard } from './components/OrderCard';
import { OrderRow } from './components/OrderRow';
import { OrderDetailModal } from './components/OrderDetailModal';
import { InventoryModal } from './components/InventoryModal';
import { PackingCheckModal } from './components/PackingCheckModal';
import { CustomerReviewsModal } from './components/CustomerReviewsModal';
import { CreateOrderModal } from './components/CreateOrderModal';
import { PrintLabelModal } from './components/PrintLabelModal';
import { GridMenuModal } from './components/GridMenuModal';
import { RevenueReportModal } from './components/RevenueReportModal';
import { 
  Sparkles, 
  Inbox, 
  Plus, 
  CheckCircle2, 
  RefreshCw,
  Heart,
  PackageCheck,
  AlertTriangle,
  LayoutGrid,
  List,
  Search,
  PackageSearch,
  FileSpreadsheet
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  // Load state from localStorage or initial mock data
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  // Save to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
    } catch (e) {
      console.error('Failed to save inventory to localStorage', e);
    }
  }, [inventory]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterUnpackedOnly, setFilterUnpackedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Modals state
  const [activeOrderDetail, setActiveOrderDetail] = useState<Order | null>(null);
  const [activePackingOrder, setActivePackingOrder] = useState<Order | null>(null);
  const [activePrintOrder, setActivePrintOrder] = useState<Order | null>(null);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [isRevenueReportOpen, setIsRevenueReportOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Computed metrics
  const metrics = useMemo(() => calculateMetrics(orders), [orders]);

  // Inventory discrepancy count
  const inventoryDiscrepancyCount = useMemo(() => {
    return inventory.filter(item => item.actualStock !== item.systemStock).length;
  }, [inventory]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      packed: orders.filter(o => o.status === 'packed').length,
      shipping: orders.filter(o => o.status === 'shipping').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length,
    };
  }, [orders]);

  // Filtered & sorted orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter(order => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchNumber = order.orderNumber.toLowerCase().includes(q);
          const matchCustomer = order.customer.name.toLowerCase().includes(q);
          const matchPhone = order.customer.phone.includes(q);
          const matchSku = order.items.some(i => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
          if (!matchNumber && !matchCustomer && !matchPhone && !matchSku) return false;
        }

        // Status filter
        if (selectedStatus !== 'all' && order.status !== selectedStatus) {
          return false;
        }

        // Platform filter
        if (selectedPlatform !== 'all' && order.platform !== selectedPlatform) {
          return false;
        }

        // Unpacked check
        if (filterUnpackedOnly && order.packingVerified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return b.id.localeCompare(a.id);
        }
        if (sortBy === 'oldest') {
          return a.id.localeCompare(b.id);
        }
        if (sortBy === 'amount-desc') {
          return b.totalAmount - a.totalAmount;
        }
        if (sortBy === 'amount-asc') {
          return a.totalAmount - b.totalAmount;
        }
        return 0;
      });
  }, [orders, searchQuery, selectedStatus, selectedPlatform, sortBy, filterUnpackedOnly]);

  // Handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' +
                   new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = { ...o, status: newStatus };
        if (newStatus === 'packed' && !o.packedAt) {
          updated.packedAt = nowStr;
        }
        if (newStatus === 'shipping' && !o.shippedAt) {
          updated.shippedAt = nowStr;
        }
        return updated;
      }
      return o;
    }));

    // Update active modal if open
    if (activeOrderDetail && activeOrderDetail.id === orderId) {
      setActiveOrderDetail(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleCompletePacking = (orderId: string, boxNote?: string) => {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' +
                   new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'packed',
          packingVerified: true,
          packageBox: boxNote || o.packageBox,
          packedAt: nowStr,
        };
      }
      return o;
    }));

    if (activeOrderDetail && activeOrderDetail.id === orderId) {
      setActiveOrderDetail(prev => prev ? { 
        ...prev, 
        status: 'packed', 
        packingVerified: true, 
        packageBox: boxNote || prev.packageBox,
        packedAt: nowStr 
      } : null);
    }
  };

  const handleUpdateInternalNote = (orderId: string, note: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, internalNote: note } : o));
    if (activeOrderDetail && activeOrderDetail.id === orderId) {
      setActiveOrderDetail(prev => prev ? { ...prev, internalNote: note } : null);
    }
  };

  const handleReplyFeedback = (orderId: string, replyText: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId && o.feedback) {
        return {
          ...o,
          feedback: {
            ...o.feedback,
            reply: replyText
          }
        };
      }
      return o;
    }));

    if (activeOrderDetail && activeOrderDetail.id === orderId && activeOrderDetail.feedback) {
      setActiveOrderDetail(prev => prev ? {
        ...prev,
        feedback: { ...prev.feedback!, reply: replyText }
      } : null);
    }
  };

  // Inventory Handlers
  const handleUpdateActualStock = (id: string, newActual: number, reason?: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          actualStock: newActual,
          discrepancyReason: reason !== undefined ? reason : item.discrepancyReason,
          lastAuditDate: 'Hôm nay'
        };
      }
      return item;
    }));
  };

  const handleSyncSystemWithActual = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          systemStock: item.actualStock,
          discrepancyReason: 'Đã cân bằng lại tồn kho sau kiểm kê',
          lastAuditDate: 'Hôm nay'
        };
      }
      return item;
    }));
  };

  const handleAddNewInventoryItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}`
    };
    setInventory(prev => [item, ...prev]);
  };

  // Create Order Handler
  const handleCreateOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    // Also deduct stock in inventory
    newOrder.items.forEach(orderItem => {
      setInventory(prev => prev.map(inv => {
        if (inv.sku === orderItem.sku) {
          const updatedSystem = Math.max(0, inv.systemStock - orderItem.quantity);
          const updatedActual = Math.max(0, inv.actualStock - orderItem.quantity);
          return {
            ...inv,
            systemStock: updatedSystem,
            actualStock: updatedActual
          };
        }
        return inv;
      }));
    });
  };

  // Multi-platform sync simulation
  const handleSyncPlatforms = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Create a simulated incoming order from TikTok or Shopee
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const simulatedNewOrder: Order = {
        id: `ord-sync-${Date.now()}`,
        orderNumber: `ORD-${randomId}`,
        platform: Math.random() > 0.5 ? 'tiktok' : 'shopee',
        createdAt: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' +
                   new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        customer: {
          name: 'Võ Tuyết Nhi',
          phone: '0932 119 882',
          address: 'Chung cư Safira Khang Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
          isVip: false,
          totalOrdersCount: 1,
        },
        items: [
          {
            id: `item-sync-${Date.now()}`,
            name: 'Son Kem Lì Velvet Dưỡng Ẩm',
            sku: 'LIP-VELVET-04',
            variant: '#04 Peach Milk',
            price: 185000,
            quantity: 1,
            imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=300&q=80',
            checkedForPacking: false,
          }
        ],
        subtotal: 185000,
        shippingFee: 20000,
        shopVoucher: 15000,
        platformVoucher: 20000,
        totalAmount: 170000,
        paymentMethod: 'COD',
        isPaid: false,
        shippingPartner: 'SPX Express',
        trackingCode: `SPX${Math.floor(10000000 + Math.random() * 90000000)}`,
        notes: 'Đơn mới tự động gom từ livestream TikTok',
        internalNote: 'Đơn mới đồng bộ từ sàn',
        packingVerified: false,
      };

      setOrders(prev => [simulatedNewOrder, ...prev]);
      setIsSyncing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen pastel-mesh-bg text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
        onOpenInventory={() => setIsInventoryOpen(true)}
        onOpenReviews={() => setIsReviewsOpen(true)}
        onSyncPlatforms={handleSyncPlatforms}
        onOpenGridMenu={() => setIsGridMenuOpen(true)}
        onOpenRevenueReport={() => setIsRevenueReportOpen(true)}
        isSyncing={isSyncing}
        inventoryDiscrepancyCount={inventoryDiscrepancyCount}
        averageRating={metrics.averageRating}
        totalReviewsCount={metrics.totalReviewsCount}
      />

      {/* Main Container - Streamlined & Mobile Friendly */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 space-y-3.5 sm:space-y-4 flex-1 w-full pb-24 sm:pb-10">
        
        {/* 1. Bộ Lọc Đơn Hàng Tối Giản Đưa Lên Đầu */}
        <section>
          <OrderFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={selectedStatus}
            onSelectStatus={setSelectedStatus}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            filterUnpackedOnly={filterUnpackedOnly}
            onToggleUnpackedOnly={() => setFilterUnpackedOnly(!filterUnpackedOnly)}
            statusCounts={statusCounts}
          />
        </section>

        {/* 2. Chỉ Số & Doanh Thu Hôm Nay (Có nút Thu gọn/Mở rộng) */}
        <section>
          <MetricsOverview
            totalOrders={metrics.totalOrders}
            totalRevenue={metrics.totalRevenue}
            totalVouchersDiscount={metrics.totalVouchersDiscount}
            averageRating={metrics.averageRating}
            totalReviewsCount={metrics.totalReviewsCount}
            onOpenReviews={() => setIsReviewsOpen(true)}
            onOpenRevenueReport={() => setIsRevenueReportOpen(true)}
          />
        </section>

        {/* 3. Danh Sách Đơn Hàng */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight flex items-center gap-2 font-['Quicksand',sans-serif]">
                <span>Danh Sách Đơn Hàng</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100/80 text-pink-700">
                  {filteredOrders.length} đơn
                </span>
              </h2>

              {/* Quick clear filters if applied */}
              {(selectedStatus !== 'all' || selectedPlatform !== 'all' || filterUnpackedOnly || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                    setSelectedPlatform('all');
                    setFilterUnpackedOnly(false);
                  }}
                  className="text-[11px] text-pink-600 hover:text-pink-700 font-semibold underline cursor-pointer"
                >
                  Xóa lọc
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* View Mode Toggle Switcher */}
              <div className="bg-pink-50/80 p-0.5 rounded-xl border border-pink-200/80 flex items-center gap-0.5 shadow-2xs">
                <button
                  id="btn-view-cards"
                  onClick={() => setViewMode('cards')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-pink-600 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                  }`}
                  title="Xem dạng thẻ gọn gàng"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Dạng thẻ</span>
                </button>

                <button
                  id="btn-view-list"
                  onClick={() => setViewMode('list')}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white text-pink-600 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800 font-medium'
                  }`}
                  title="Xem dạng danh sách tối giản"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Dạng danh sách</span>
                </button>
              </div>

              {/* Quick alert if inventory has discrepancies */}
              {inventoryDiscrepancyCount > 0 && (
                <button
                  onClick={() => setIsInventoryOpen(true)}
                  className="hidden md:inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>{inventoryDiscrepancyCount} lệch tồn</span>
                </button>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-pink-100 p-10 text-center space-y-3 shadow-2xs">
              <div className="w-14 h-14 rounded-full bg-pink-50 text-pink-400 mx-auto flex items-center justify-center">
                <Inbox className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-bold text-slate-800 font-['Quicksand',sans-serif]">
                  Không tìm thấy đơn hàng nào
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Hãy thử đổi bộ lọc trạng thái, sàn thương mại hoặc tìm kiếm từ khóa khác nha!
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                  setSelectedPlatform('all');
                  setFilterUnpackedOnly(false);
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-pink-500 text-white hover:bg-pink-600 transition-all cursor-pointer shadow-xs"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : viewMode === 'cards' ? (
            /* Clean 2-column Card View */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={(ord) => setActiveOrderDetail(ord)}
                    onOpenPackingCheck={(ord) => setActivePackingOrder(ord)}
                    onQuickUpdateStatus={handleUpdateOrderStatus}
                    onPrintLabel={(ord) => setActivePrintOrder(ord)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Ultra-clean Compact List View */
            <div className="space-y-2.5">
              <AnimatePresence>
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onViewDetails={(ord) => setActiveOrderDetail(ord)}
                    onOpenPackingCheck={(ord) => setActivePackingOrder(ord)}
                    onQuickUpdateStatus={handleUpdateOrderStatus}
                    onPrintLabel={(ord) => setActivePrintOrder(ord)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-pink-100/80 bg-white/80 backdrop-blur-md py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <span className="text-pink-500 font-bold font-['Quicksand',sans-serif]">Orderly</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Đồng bộ đa sàn Shopee · TikTok Shop · Lazada · Facebook · Instagram
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeOrderDetail && (
          <OrderDetailModal
            order={activeOrderDetail}
            onClose={() => setActiveOrderDetail(null)}
            onUpdateStatus={handleUpdateOrderStatus}
            onUpdateInternalNote={handleUpdateInternalNote}
            onOpenPackingCheck={(ord) => {
              setActiveOrderDetail(null);
              setActivePackingOrder(ord);
            }}
            onPrintLabel={(ord) => setActivePrintOrder(ord)}
            onReplyFeedback={handleReplyFeedback}
          />
        )}

        {activePackingOrder && (
          <PackingCheckModal
            order={activePackingOrder}
            onClose={() => setActivePackingOrder(null)}
            onCompletePacking={handleCompletePacking}
            onPrintLabel={(ord) => setActivePrintOrder(ord)}
          />
        )}

        {isInventoryOpen && (
          <InventoryModal
            inventory={inventory}
            onClose={() => setIsInventoryOpen(false)}
            onUpdateActualStock={handleUpdateActualStock}
            onSyncSystemWithActual={handleSyncSystemWithActual}
            onAddNewItem={handleAddNewInventoryItem}
          />
        )}

        {isReviewsOpen && (
          <CustomerReviewsModal
            orders={orders}
            onClose={() => setIsReviewsOpen(false)}
            onReplyFeedback={handleReplyFeedback}
          />
        )}

        {isCreateOrderOpen && (
          <CreateOrderModal
            inventory={inventory}
            onClose={() => setIsCreateOrderOpen(false)}
            onCreateOrder={handleCreateOrder}
          />
        )}

        {activePrintOrder && (
          <PrintLabelModal
            order={activePrintOrder}
            onClose={() => setActivePrintOrder(null)}
          />
        )}

        {isGridMenuOpen && (
          <GridMenuModal
            isOpen={isGridMenuOpen}
            onClose={() => setIsGridMenuOpen(false)}
            onOpenCreateOrder={() => setIsCreateOrderOpen(true)}
            onOpenInventory={() => setIsInventoryOpen(true)}
            onOpenReviews={() => setIsReviewsOpen(true)}
            onOpenRevenueReport={() => setIsRevenueReportOpen(true)}
            onSyncPlatforms={handleSyncPlatforms}
            onSelectStatus={(status) => setSelectedStatus(status)}
            onFilterUnpacked={() => setFilterUnpackedOnly(true)}
            inventoryDiscrepancyCount={inventoryDiscrepancyCount}
            statusCounts={statusCounts}
            averageRating={metrics.averageRating}
          />
        )}

        {isRevenueReportOpen && (
          <RevenueReportModal
            isOpen={isRevenueReportOpen}
            onClose={() => setIsRevenueReportOpen(false)}
            orders={orders}
          />
        )}
      </AnimatePresence>

      {/* Mobile-Friendly Bottom Navigation Bar (Phone-First UX) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-pink-100/90 py-1.5 px-3 shadow-[0_-4px_20px_-4px_rgba(244,114,182,0.12)] flex items-center justify-around">
        {/* Tab 1: Đơn hàng */}
        <button
          id="mobile-bottom-orders"
          onClick={() => {
            setSelectedStatus('all');
            setSelectedPlatform('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold py-1 px-2 rounded-xl transition-all cursor-pointer ${
            selectedStatus === 'all' && !filterUnpackedOnly
              ? 'text-pink-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span className="text-[10px]">Đơn hàng</span>
        </button>

        {/* Tab 2: Tìm kiếm */}
        <button
          id="mobile-bottom-search"
          onClick={() => {
            const mobileInput = document.getElementById('mobile-search-input') as HTMLInputElement | null;
            const headerInput = document.getElementById('header-search-input') as HTMLInputElement | null;
            const btn = document.getElementById('btn-toggle-mobile-search');
            if (btn) btn.click();
            setTimeout(() => {
              if (mobileInput) mobileInput.focus();
              else if (headerInput) headerInput.focus();
            }, 100);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center gap-0.5 text-xs font-semibold py-1 px-2 rounded-xl transition-all cursor-pointer ${
            searchQuery ? 'text-pink-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span className="text-[10px]">Tìm kiếm</span>
        </button>

        {/* Tab 3: Tạo đơn (Center Floating Action Button) */}
        <button
          id="mobile-bottom-create"
          onClick={() => setIsCreateOrderOpen(true)}
          className="-mt-5 p-3 rounded-full bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-500 text-white shadow-lg shadow-pink-300/80 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white"
          title="Tạo đơn hàng mới"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Tab 4: Kho hàng */}
        <button
          id="mobile-bottom-inventory"
          onClick={() => setIsInventoryOpen(true)}
          className="relative flex flex-col items-center gap-0.5 text-xs font-semibold py-1 px-2 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
        >
          <PackageSearch className="w-4 h-4" />
          <span className="text-[10px]">Kho hàng</span>
          {inventoryDiscrepancyCount > 0 && (
            <span className="absolute top-0.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          )}
        </button>

        {/* Tab 5: Menu Lưới (Grid Menu) */}
        <button
          id="mobile-bottom-grid"
          onClick={() => setIsGridMenuOpen(true)}
          className="flex flex-col items-center gap-0.5 text-xs font-semibold py-1 px-2 rounded-xl text-slate-600 hover:text-pink-600 transition-all cursor-pointer"
        >
          <LayoutGrid className="w-4 h-4 text-pink-500" />
          <span className="text-[10px] text-pink-600 font-bold">Menu Lưới</span>
        </button>
      </nav>

    </div>
  );
}
