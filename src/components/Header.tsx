import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  PackageSearch, 
  Star, 
  Heart, 
  CheckCircle2, 
  Search, 
  X, 
  LayoutGrid,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenCreateOrder: () => void;
  onOpenInventory: () => void;
  onOpenReviews: () => void;
  onOpenManualClassification: () => void;
  onOpenGridMenu: () => void;
  onOpenRevenueReport?: () => void;
  inventoryDiscrepancyCount: number;
  averageRating: number;
  totalReviewsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenCreateOrder,
  onOpenInventory,
  onOpenReviews,
  onOpenManualClassification,
  onOpenGridMenu,
  onOpenRevenueReport,
  inventoryDiscrepancyCount,
  averageRating,
  totalReviewsCount,
}) => {
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-pink-100/90 shadow-[0_2px_16px_-4px_rgba(251,113,133,0.06)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        
        {/* Main Row */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-300 to-pink-200 flex items-center justify-center shadow-sm shadow-pink-200 text-white font-extrabold transition-transform active:scale-95">
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent font-['Quicksand',sans-serif]">
                Orderly
              </h1>
              <span className="hidden xs:inline-flex px-1.5 py-0.2 text-[9px] font-bold tracking-wider uppercase bg-pink-50 text-pink-600 border border-pink-200/80 rounded-full items-center gap-0.5">
                <Sparkles className="w-2 h-2" />
                Boutique
              </span>
            </div>
          </div>

          {/* Desktop & Tablet Top Search Bar */}
          <div className="hidden sm:flex flex-1 max-w-sm md:max-w-md mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="header-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Tìm mã đơn, tên khách, SĐT, SKU..."
                className="w-full pl-9 pr-8 py-1.5 text-xs rounded-2xl bg-pink-50/40 border border-pink-200/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300/60 focus:border-pink-300 text-slate-800 placeholder-slate-400 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Mobile search toggle button */}
            <button
              id="btn-toggle-mobile-search"
              onClick={() => setIsMobileSearchExpanded(!isMobileSearchExpanded)}
              className={`sm:hidden p-2 rounded-xl border transition-all cursor-pointer ${
                isMobileSearchExpanded || searchQuery
                  ? 'bg-pink-100/70 border-pink-300 text-pink-600'
                  : 'bg-white border-pink-200/90 text-slate-600 hover:bg-pink-50'
              }`}
              title="Tìm kiếm đơn"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Grid Menu Button (Top Menu Menu Lưới) */}
            <button
              id="btn-open-grid-menu"
              onClick={onOpenGridMenu}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-pink-50 via-white to-pink-50 border border-pink-200/90 text-slate-700 hover:border-pink-300 hover:shadow-xs transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Menu tiện ích dạng lưới"
            >
              <LayoutGrid className="w-4 h-4 text-pink-500" />
              <span className="hidden xs:inline">Menu Lưới</span>
              {inventoryDiscrepancyCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </button>

            {/* Manual App Classification button */}
            <button
              id="btn-manual-classification"
              onClick={onOpenManualClassification}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white border border-pink-200/90 text-slate-700 hover:bg-pink-50/70 hover:border-pink-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
              title="Phân loại thủ công đơn hàng từ các App"
            >
              <Layers className="w-3.5 h-3.5 text-pink-500" />
              <span>Phân loại App</span>
            </button>

            {/* Inventory audit button */}
            <button
              id="btn-open-inventory"
              onClick={onOpenInventory}
              className="relative hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white border border-pink-200/90 text-slate-700 hover:bg-pink-50/60 hover:border-pink-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <PackageSearch className="w-3.5 h-3.5 text-rose-500" />
              <span>Kho & Lệch</span>
              {inventoryDiscrepancyCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                  {inventoryDiscrepancyCount}
                </span>
              )}
            </button>

            {/* Customer reviews button */}
            <button
              id="btn-open-reviews"
              onClick={onOpenReviews}
              className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-2xl bg-white border border-pink-200/90 text-slate-700 hover:bg-pink-50/60 hover:border-pink-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{averageRating}</span>
              <span className="text-slate-400 text-[10px]">({totalReviewsCount})</span>
            </button>

            {/* Revenue report export button */}
            {onOpenRevenueReport && (
              <button
                id="btn-header-revenue-report"
                onClick={onOpenRevenueReport}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-2xl bg-white border border-pink-200/90 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Xuất báo cáo doanh thu CSV hoặc PDF"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Báo cáo</span>
              </button>
            )}

            {/* Create manual order button */}
            <button
              id="btn-create-order-header"
              onClick={onOpenCreateOrder}
              className="inline-flex items-center gap-1 px-3 sm:px-3.5 py-1.5 text-xs font-bold rounded-2xl bg-gradient-to-r from-pink-500 via-rose-400 to-pink-500 text-white shadow-xs shadow-pink-200 hover:from-pink-600 hover:to-rose-500 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Tạo đơn</span>
            </button>

          </div>
        </div>

        {/* Mobile Expandable Search Bar */}
        <AnimatePresence>
          {isMobileSearchExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden pt-2.5 overflow-hidden"
            >
              <div className="relative w-full">
                <Search className="w-4 h-4 text-pink-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="mobile-search-input"
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Tìm mã đơn, tên khách, SĐT, SKU..."
                  className="w-full pl-9 pr-8 py-2 text-xs rounded-2xl bg-pink-50/50 border border-pink-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-300 text-slate-800 placeholder-slate-400 shadow-2xs"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </header>
  );
};
