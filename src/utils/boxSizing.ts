import { Order, OrderItem } from '../types';

export interface CartonBoxSpec {
  id: string;
  name: string;
  code: string;
  type: 'box' | 'bag';
  dimensions: {
    length: number; // cm
    width: number;  // cm
    height: number; // cm
  };
  dimensionString: string;
  volumeCm3: number;
  volumetricWeightGrams: number;
  estimatedCostVnd: number;
  suitableDescription: string;
  recommendedForFragile: boolean;
  colorTheme: string;
}

export const STANDARD_BOXES: CartonBoxSpec[] = [
  {
    id: 'box-s',
    name: 'Hộp Carton Cỡ S (Hộp 01)',
    code: 'SIZE-S',
    type: 'box',
    dimensions: { length: 15, width: 10, height: 10 },
    dimensionString: '15 x 10 x 10 cm',
    volumeCm3: 1500,
    volumetricWeightGrams: 250,
    estimatedCostVnd: 1800,
    suitableDescription: '1 - 2 món nhỏ (son môi, mỹ phẩm mini, kẹp tóc, phụ kiện)',
    recommendedForFragile: true,
    colorTheme: 'from-amber-400 to-orange-400',
  },
  {
    id: 'box-m',
    name: 'Hộp Carton Cỡ M (Hộp 02)',
    code: 'SIZE-M',
    type: 'box',
    dimensions: { length: 20, width: 15, height: 10 },
    dimensionString: '20 x 15 x 10 cm',
    volumeCm3: 3000,
    volumetricWeightGrams: 500,
    estimatedCostVnd: 2500,
    suitableDescription: '2 - 3 món (váy lụa mỏng, áo thun, nến thơm, mỹ phẩm combo)',
    recommendedForFragile: true,
    colorTheme: 'from-pink-500 to-rose-400',
  },
  {
    id: 'box-l',
    name: 'Hộp Carton Cỡ L (Hộp 03)',
    code: 'SIZE-L',
    type: 'box',
    dimensions: { length: 30, width: 20, height: 10 },
    dimensionString: '30 x 20 x 10 cm',
    volumeCm3: 6000,
    volumetricWeightGrams: 1000,
    estimatedCostVnd: 3600,
    suitableDescription: '3 - 5 món (đầm xòe, áo len cardigan, giày dép, combo nhiều món)',
    recommendedForFragile: true,
    colorTheme: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'box-xl',
    name: 'Hộp Carton Cỡ XL (Hộp Đại 04)',
    code: 'SIZE-XL',
    type: 'box',
    dimensions: { length: 35, width: 25, height: 15 },
    dimensionString: '35 x 25 x 15 cm',
    volumeCm3: 13125,
    volumetricWeightGrams: 2180,
    estimatedCostVnd: 4900,
    suitableDescription: '5+ món hoặc áo khoác dày, combo lớn, hàng cồng kềnh',
    recommendedForFragile: true,
    colorTheme: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'bag-pe',
    name: 'Túi Niêm Phong PE Chuyên Dụng',
    code: 'BAG-PE',
    type: 'bag',
    dimensions: { length: 28, width: 42, height: 4 },
    dimensionString: '28 x 42 cm (Siêu bền)',
    volumeCm3: 4700,
    volumetricWeightGrams: 350,
    estimatedCostVnd: 700,
    suitableDescription: 'Quần áo mềm không sợ vỡ nát, tiết kiệm 70% chi phí hộp',
    recommendedForFragile: false,
    colorTheme: 'from-emerald-500 to-teal-500',
  },
];

export interface BoxRecommendationResult {
  suggestedBox: CartonBoxSpec;
  alternativeBox?: CartonBoxSpec;
  totalQuantity: number;
  estimatedVolumeCm3: number;
  volumetricWeightGrams: number;
  hasFragileItem: boolean;
  fragileItemNames: string[];
  isAllApparel: boolean;
  fitPercentage: number;
  packingAdvice: string;
}

/**
 * Phân tích sản phẩm để tính toán thể tích và phát hiện hàng dễ vỡ
 */
export function estimateItemMetrics(item: OrderItem): {
  unitVolumeCm3: number;
  unitWeightGrams: number;
  isFragile: boolean;
  isApparel: boolean;
} {
  const nameLower = (item.name || '').toLowerCase();
  const skuLower = (item.sku || '').toLowerCase();

  // Kiểm tra hàng dễ vỡ (mỹ phẩm thủy tinh, nến thơm, chai lọ son)
  const isFragile = 
    nameLower.includes('son') || 
    nameLower.includes('nến') || 
    nameLower.includes('thủy tinh') || 
    nameLower.includes('kem') || 
    nameLower.includes('serum') || 
    nameLower.includes('chai') || 
    nameLower.includes('lọ') || 
    nameLower.includes('gương') ||
    skuLower.includes('cnd') ||
    skuLower.includes('lip');

  // Kiểm tra quần áo vải mềm
  const isApparel = 
    nameLower.includes('váy') || 
    nameLower.includes('đầm') || 
    nameLower.includes('áo') || 
    nameLower.includes('quần') || 
    nameLower.includes('len') || 
    nameLower.includes('cardigan') || 
    nameLower.includes('sơ mi') ||
    skuLower.includes('drs') ||
    skuLower.includes('crd');

  // Ước tính thể tích & trọng lượng
  if (nameLower.includes('áo khoác') || nameLower.includes('cardigan') || nameLower.includes('len dệt kim')) {
    return { unitVolumeCm3: 2200, unitWeightGrams: 420, isFragile, isApparel };
  }
  if (nameLower.includes('váy') || nameLower.includes('đầm')) {
    return { unitVolumeCm3: 1300, unitWeightGrams: 280, isFragile, isApparel };
  }
  if (nameLower.includes('áo') || nameLower.includes('chân váy') || nameLower.includes('quần')) {
    return { unitVolumeCm3: 900, unitWeightGrams: 180, isFragile, isApparel };
  }
  if (nameLower.includes('túi') || nameLower.includes('tote')) {
    return { unitVolumeCm3: 1200, unitWeightGrams: 200, isFragile: false, isApparel: false };
  }
  if (nameLower.includes('nến') || skuLower.includes('cnd')) {
    return { unitVolumeCm3: 650, unitWeightGrams: 350, isFragile: true, isApparel: false };
  }
  if (nameLower.includes('son') || skuLower.includes('lip') || nameLower.includes('phụ kiện') || nameLower.includes('kẹp')) {
    return { unitVolumeCm3: 180, unitWeightGrams: 60, isFragile: true, isApparel: false };
  }

  // Mặc định
  return { unitVolumeCm3: 850, unitWeightGrams: 200, isFragile, isApparel };
}

/**
 * Gợi ý kích thước thùng carton tối ưu nhất dựa trên đơn hàng
 */
export function recommendCartonBox(order: Order): BoxRecommendationResult {
  let totalRawVolume = 0;
  let totalWeight = 0;
  let totalQuantity = 0;
  const fragileItemNames: string[] = [];
  let allApparel = true;

  order.items.forEach(item => {
    const qty = item.quantity || 1;
    totalQuantity += qty;
    const metrics = estimateItemMetrics(item);
    totalRawVolume += metrics.unitVolumeCm3 * qty;
    totalWeight += metrics.unitWeightGrams * qty;

    if (metrics.isFragile) {
      fragileItemNames.push(item.name);
    }
    if (!metrics.isApparel) {
      allApparel = false;
    }
  });

  const hasFragileItem = fragileItemNames.length > 0;

  // Nếu có hàng dễ vỡ, thêm 25% thể tích dự phòng cho màng xốp nổ (bubble wrap)
  const estimatedVolumeCm3 = Math.round(hasFragileItem ? totalRawVolume * 1.25 : totalRawVolume * 1.1);

  // Chọn hộp phù hợp
  let suggestedBox: CartonBoxSpec;
  let alternativeBox: CartonBoxSpec | undefined;
  let packingAdvice = '';

  if (estimatedVolumeCm3 <= 1300 && totalQuantity <= 2) {
    suggestedBox = STANDARD_BOXES.find(b => b.id === 'box-s')!;
    alternativeBox = STANDARD_BOXES.find(b => b.id === 'box-m');
    packingAdvice = hasFragileItem
      ? 'Quấn 2 vòng xốp nổ quanh thân son/nến, dán tem Hàng Dễ Vỡ phía trên nắp.'
      : 'Xếp vừa khít, nên kèm thiệp cảm ơn nơ hồng vào ngăn trên cùng.';
  } else if (estimatedVolumeCm3 <= 2700 && totalQuantity <= 4) {
    suggestedBox = STANDARD_BOXES.find(b => b.id === 'box-m')!;
    alternativeBox = allApparel && !hasFragileItem
      ? STANDARD_BOXES.find(b => b.id === 'bag-pe')
      : STANDARD_BOXES.find(b => b.id === 'box-l');
    packingAdvice = hasFragileItem
      ? 'Bọc xốp chống sốc cho mỹ phẩm/nến, đặt quần áo gấp xung quanh để giảm va đập.'
      : 'Kích cỡ vàng cho đơn 2-3 món thời trang, vừa vặn không bị xô lệch khi vận chuyển.';
  } else if (estimatedVolumeCm3 <= 5500 && totalQuantity <= 6) {
    suggestedBox = STANDARD_BOXES.find(b => b.id === 'box-l')!;
    alternativeBox = STANDARD_BOXES.find(b => b.id === 'box-xl');
    packingAdvice = 'Gấp phẳng váy đầm theo nếp, xếp áo len/túi phía dưới, dán băng dính niêm phong dạng chữ H.';
  } else {
    suggestedBox = STANDARD_BOXES.find(b => b.id === 'box-xl')!;
    alternativeBox = STANDARD_BOXES.find(b => b.id === 'box-l');
    packingAdvice = 'Đơn hàng lớn nhiều sản phẩm: Xếp đồ nặng ở đáy hộp, đồ dễ nhàu ở trên, dán gia cố 2 bên hông thùng.';
  }

  // Nếu toàn bộ là quần áo không dễ vỡ và số lượng ít, gợi ý túi PE để tiết kiệm
  if (allApparel && !hasFragileItem && totalQuantity <= 2) {
    alternativeBox = suggestedBox;
    suggestedBox = STANDARD_BOXES.find(b => b.id === 'bag-pe')!;
    packingAdvice = 'Đơn thuần quần áo vải mềm: Gợi ý dùng Túi Niêm Phong PE để tiết kiệm 70% tiền bao bì và đóng gói siêu nhanh.';
  }

  const fitPercentage = Math.min(95, Math.max(55, Math.round((estimatedVolumeCm3 / suggestedBox.volumeCm3) * 100)));

  return {
    suggestedBox,
    alternativeBox,
    totalQuantity,
    estimatedVolumeCm3,
    volumetricWeightGrams: suggestedBox.volumetricWeightGrams,
    hasFragileItem,
    fragileItemNames,
    isAllApparel: allApparel,
    fitPercentage,
    packingAdvice,
  };
}
