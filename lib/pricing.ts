export interface ProductPriceInfo {
  sellPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountAmount: number;
  discountPercent: number;
  hasMultiplePrices: boolean;
  lowestOptionName?: string;
}

/**
 * Calculates the lowest effective selling price and actual price across
 * the base product and all of its variants.
 */
export function getProductPriceInfo(product: any): ProductPriceInfo {
  if (!product) {
    return {
      sellPrice: 0,
      originalPrice: 0,
      hasDiscount: false,
      discountAmount: 0,
      discountPercent: 0,
      hasMultiplePrices: false,
    };
  }

  const baseOriginalPrice = Number(product.price) || 0;
  const rawSalePrice = product.salePrice;
  const baseSalePrice =
    rawSalePrice !== undefined && rawSalePrice !== null && Number(rawSalePrice) > 0
      ? Number(rawSalePrice)
      : null;

  const baseSellPrice = baseSalePrice !== null ? baseSalePrice : baseOriginalPrice;
  const baseDiscountRatio =
    baseSalePrice !== null && baseOriginalPrice > baseSalePrice
      ? (baseOriginalPrice - baseSalePrice) / baseOriginalPrice
      : 0;

  interface PriceCandidate {
    name: string;
    sellPrice: number;
    originalPrice: number;
  }

  const candidates: PriceCandidate[] = [];

  // 1. Add base product candidate
  if (baseOriginalPrice > 0 || baseSellPrice > 0) {
    candidates.push({
      name: "Standard",
      sellPrice: baseSellPrice,
      originalPrice: baseOriginalPrice > baseSellPrice ? baseOriginalPrice : baseSellPrice,
    });
  }

  // 2. Add variant candidates
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      const vPrice = Number(v.price) || 0;
      if (vPrice <= 0) continue;

      let vOriginalPrice = vPrice;
      if (baseDiscountRatio > 0) {
        vOriginalPrice = Math.max(vPrice, Math.round(vPrice / (1 - baseDiscountRatio)));
        if (baseOriginalPrice > vPrice && vOriginalPrice < baseOriginalPrice) {
          vOriginalPrice = baseOriginalPrice;
        }
      } else if (baseOriginalPrice > vPrice) {
        vOriginalPrice = baseOriginalPrice;
      }

      candidates.push({
        name: v.name || "Variant",
        sellPrice: vPrice,
        originalPrice: vOriginalPrice,
      });
    }
  }

  if (candidates.length === 0) {
    return {
      sellPrice: baseSellPrice,
      originalPrice: baseOriginalPrice,
      hasDiscount: baseOriginalPrice > baseSellPrice,
      discountAmount: Math.max(0, baseOriginalPrice - baseSellPrice),
      discountPercent:
        baseOriginalPrice > 0
          ? Math.round(((baseOriginalPrice - baseSellPrice) / baseOriginalPrice) * 100)
          : 0,
      hasMultiplePrices: false,
    };
  }

  // Find candidate with lowest sellPrice
  let lowest = candidates[0];
  let highest = candidates[0];

  for (const c of candidates) {
    if (c.sellPrice < lowest.sellPrice) {
      lowest = c;
    }
    if (c.sellPrice > highest.sellPrice) {
      highest = c;
    }
  }

  const sellPrice = lowest.sellPrice;
  const originalPrice = Math.max(lowest.originalPrice, sellPrice);
  const hasDiscount = originalPrice > sellPrice;
  const discountAmount = originalPrice - sellPrice;
  const discountPercent =
    originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;
  const hasMultiplePrices = highest.sellPrice > lowest.sellPrice;

  return {
    sellPrice,
    originalPrice,
    hasDiscount,
    discountAmount,
    discountPercent,
    hasMultiplePrices,
    lowestOptionName: lowest.name,
  };
}
