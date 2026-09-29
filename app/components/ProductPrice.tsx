import React from "react";
import { getProductPriceInfo, ProductPriceInfo } from "../../lib/pricing";

interface ProductPriceProps {
  product?: any;
  priceInfo?: ProductPriceInfo;
  size?: "sm" | "md" | "lg";
  className?: string;
  showSaveBadge?: boolean;
}

export default function ProductPrice({
  product,
  priceInfo: customPriceInfo,
  size = "md",
  className = "",
  showSaveBadge = true,
}: ProductPriceProps) {
  const info = customPriceInfo || getProductPriceInfo(product);

  if (size === "sm") {
    return (
      <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
        <span className="font-bold text-ink text-xs">
          ₹{info.sellPrice.toLocaleString("en-IN")}
        </span>
        {info.hasDiscount && (
          <>
            <span className="line-through text-muted/70 text-[10px]">
              ₹{info.originalPrice.toLocaleString("en-IN")}
            </span>
            {showSaveBadge && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-1 py-0.2 rounded">
                Save ₹{info.discountAmount.toLocaleString("en-IN")}
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  if (size === "lg") {
    return (
      <div className={`flex items-baseline gap-3 flex-wrap ${className}`}>
        <span className="text-3xl font-serif text-wine font-bold">
          ₹{info.sellPrice.toLocaleString("en-IN")}
        </span>
        {info.hasDiscount && (
          <>
            <span className="line-through text-muted text-lg">
              ₹{info.originalPrice.toLocaleString("en-IN")}
            </span>
            {showSaveBadge && (
              <span className="text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                Save ₹{info.discountAmount.toLocaleString("en-IN")} ({info.discountPercent}% OFF)
              </span>
            )}
          </>
        )}
      </div>
    );
  }

  // Default "md" size (for ProductGrid, ShopClient, Category pages)
  return (
    <div className={`flex items-baseline gap-2 flex-wrap ${className}`}>
      <span className="font-bold text-sm text-ink">
        ₹{info.sellPrice.toLocaleString("en-IN")}
      </span>
      {info.hasDiscount && (
        <>
          <span className="line-through text-muted/70 text-xs">
            ₹{info.originalPrice.toLocaleString("en-IN")}
          </span>
          {showSaveBadge && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-1.5 py-0.5 rounded whitespace-nowrap">
              Save ₹{info.discountAmount.toLocaleString("en-IN")}
            </span>
          )}
        </>
      )}
    </div>
  );
}
