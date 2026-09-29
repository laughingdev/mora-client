"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  Grid3X3,
  LayoutGrid,
  Sparkles,
  ArrowRight,
  Gift,
  Calendar,
  RotateCcw,
  Check,
  FolderTree,
  Tag,
  DollarSign,
  UserCheck,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useStore } from "../../store/useStore";
import { getProductPriceInfo } from "../../lib/pricing";
import { getProductUrl, getCategoryUrl, getEventUrl } from "@/lib/urls";
import ProductPrice from "../components/ProductPrice";
import ProductCard from "../components/ProductCard";
import SortDropdown, { SortOption } from "../components/SortDropdown";

interface ShopClientProps {
  initialProducts: any[];
  categories: any[];
  events?: any[];
  meta: any;
  searchParams: any;
  currentCategory?: any;
  lockedGender?: "male" | "female";
  pageTitle?: string;
}

export default function ShopClient({
  initialProducts = [],
  categories = [],
  events = [],
  meta,
  searchParams = {},
  currentCategory,
  lockedGender,
  pageTitle
}: ShopClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart, addToWishlist, wishlist } = useStore();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.search || "");
  const [columnsView, setColumnsView] = useState<3 | 4>(4);

  // Custom price input state
  const [customMin, setCustomMin] = useState(searchParams.minPrice || "");
  const [customMax, setCustomMax] = useState(searchParams.maxPrice || "");

  // Update inputs if searchParams change externally
  useEffect(() => {
    setCustomMin(searchParams.minPrice || "");
    setCustomMax(searchParams.maxPrice || "");
    setSearchQuery(searchParams.search || "");
  }, [searchParams.minPrice, searchParams.maxPrice, searchParams.search]);

  // Collapsible section state in sidebar
  const [expandedSections, setExpandedSections] = useState({
    gender: true,
    categories: true,
    occasions: true,
    price: true,
  });

  // Track expanded parent categories in tree
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleParentCategory = (catId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedParents(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const [isPending, startTransition] = useTransition();

  const handleFiltersChange = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset page on filter or sort change unless page is explicitly specified
    if (!('page' in updates)) {
      params.delete('page');
    }
    const queryString = params.toString();
    startTransition(() => {
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    });
  };

  const handleFilterChange = (key: string, value: string | null) => {
    handleFiltersChange({ [key]: value });
  };

  const handleSortChange = (option: SortOption) => {
    handleFiltersChange({
      sort: option.sort,
      order: option.order,
    });
  };

  const currentSortValue = useMemo(() => {
    const s = searchParams?.sort;
    const o = searchParams?.order;
    if (s && o) {
      return `${s}-${o}`;
    }
    if (s && !o) {
      return `${s}-desc`;
    }
    // If order=asc alone (from /shop?order=asc), gracefully default to price-asc
    if (!s && o === 'asc') {
      return 'price-asc';
    }
    return 'createdAt-desc';
  }, [searchParams?.sort, searchParams?.order]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("search", searchQuery.trim() || null);
  };

  const activeCategorySlug = currentCategory?.slug || (typeof searchParams.categorySlug === 'string' ? searchParams.categorySlug : null);
  const activeGender = lockedGender || (typeof searchParams.gender === 'string' ? searchParams.gender : null);

  const clearAllFilters = () => {
    setSearchQuery("");
    setCustomMin("");
    setCustomMax("");
    if (lockedGender) {
      router.push(pathname);
    } else {
      router.push("/shop");
    }
  };

  // Build hierarchical category tree (Roots and their Children)
  const categoryTree = useMemo(() => {
    const roots = categories.filter((c: any) => !c.parentId);
    return roots.map((root: any) => ({
      ...root,
      children: categories.filter((c: any) => c.parentId === root.id)
    }));
  }, [categories]);

  // Auto-expand parent category if an active child is selected
  useEffect(() => {
    if (activeCategorySlug) {
      const activeCat = categories.find((c: any) => c.slug === activeCategorySlug);
      if (activeCat?.parentId) {
        setExpandedParents(prev => ({ ...prev, [activeCat.parentId]: true }));
      }
    }
  }, [activeCategorySlug, categories]);

  // Determine active filters for badge & chip display
  const activeFilters = useMemo(() => {
    const list: { label: string; key: string; value: string }[] = [];

    if (!lockedGender && searchParams.gender) {
      const gLabel = searchParams.gender === 'male' ? 'Men' : searchParams.gender === 'female' ? 'Women' : 'Unisex';
      list.push({ label: `Gender: ${gLabel}`, key: "gender", value: searchParams.gender });
    }

    if (activeCategorySlug) {
      const cat = categories.find((c: any) => c.slug === activeCategorySlug) || currentCategory;
      list.push({ label: cat ? cat.name : activeCategorySlug, key: "category", value: activeCategorySlug });
    }

    if (searchParams.eventSlug) {
      const ev = events.find((e: any) => e.slug === searchParams.eventSlug);
      list.push({ label: ev ? ev.name : searchParams.eventSlug, key: "eventSlug", value: searchParams.eventSlug });
    }

    if (searchParams.search) {
      list.push({ label: `"${searchParams.search}"`, key: "search", value: searchParams.search });
    }

    if (searchParams.minPrice || searchParams.maxPrice) {
      let priceLabel = "";
      if (searchParams.minPrice && searchParams.maxPrice) {
        priceLabel = `₹${Number(searchParams.minPrice).toLocaleString('en-IN')} - ₹${Number(searchParams.maxPrice).toLocaleString('en-IN')}`;
      } else if (searchParams.maxPrice) {
        priceLabel = `Under ₹${Number(searchParams.maxPrice).toLocaleString('en-IN')}`;
      } else if (searchParams.minPrice) {
        priceLabel = `Above ₹${Number(searchParams.minPrice).toLocaleString('en-IN')}`;
      }
      list.push({ label: priceLabel, key: "price", value: "price" });
    }

    return list;
  }, [activeCategorySlug, currentCategory, searchParams, categories, events, lockedGender]);

  const removeFilter = (filterKey: string) => {
    if (filterKey === "category") {
      router.push(lockedGender ? pathname : "/shop");
      return;
    }
    if (filterKey === "price") {
      setCustomMin("");
      setCustomMax("");
      handleFiltersChange({
        minPrice: null,
        maxPrice: null,
      });
    } else {
      handleFilterChange(filterKey, null);
    }
  };

  const handlePriceTierSelect = (min: string | null, max: string | null) => {
    setCustomMin(min || "");
    setCustomMax(max || "");
    handleFiltersChange({
      minPrice: min,
      maxPrice: max,
    });
  };

  const handleCustomPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = customMin.trim();
    const maxVal = customMax.trim();

    handleFiltersChange({
      minPrice: minVal && !isNaN(Number(minVal)) ? minVal : null,
      maxPrice: maxVal && !isNaN(Number(maxVal)) ? maxVal : null,
    });
  };

  return (
    <div className="relative">
      {/* 1. Quick Category & Audience Navigation Bar */}
      <div className="mb-8 pb-4 border-b border-line/70 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2.5 min-w-max">
          {/* Main "All Gifts" / Root Reset */}
          <Link
            href={lockedGender ? pathname : "/shop"}
            className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
              !activeCategorySlug && !searchParams.eventSlug && (!searchParams.gender || lockedGender)
                ? "bg-wine text-white shadow-sm"
                : "bg-white text-ink border border-line hover:border-wine/50 hover:text-wine"
            }`}
          >
            {lockedGender === "male" ? "All Men's Gifts" : lockedGender === "female" ? "All Women's Gifts" : "All Gifts"}
          </Link>

          {/* Gender Pills (Only shown when not locked to a specific gender page) */}
          {!lockedGender && (
            <>
              <button
                onClick={() => handleFilterChange("gender", activeGender === "male" ? null : "male")}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                  activeGender === "male"
                    ? "bg-wine text-white shadow-sm font-semibold"
                    : "bg-[#f8f9fa] text-ink/80 border border-line hover:border-wine/40 hover:text-wine"
                }`}
              >
                <span>For Him (Men)</span>
              </button>
              <button
                onClick={() => handleFilterChange("gender", activeGender === "female" ? null : "female")}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                  activeGender === "female"
                    ? "bg-wine text-white shadow-sm font-semibold"
                    : "bg-[#fdf9f9] text-ink/80 border border-line hover:border-wine/40 hover:text-wine"
                }`}
              >
                <span>For Her (Women)</span>
              </button>
              <button
                onClick={() => handleFilterChange("gender", activeGender === "both" ? null : "both")}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                  activeGender === "both"
                    ? "bg-wine text-white shadow-sm font-semibold"
                    : "bg-white text-ink/80 border border-line hover:border-wine/40 hover:text-wine"
                }`}
              >
                <span>Unisex</span>
              </button>
              <div className="h-4 w-[1px] bg-line/80 mx-1" />
            </>
          )}

          {/* Root Category Navigation */}
          {categoryTree.map((rootCat: any) => {
            const isSelected = activeCategorySlug === rootCat.slug;
            const href = isSelected ? (lockedGender ? pathname : "/shop") : getCategoryUrl(rootCat, categories);
            return (
              <Link
                key={rootCat.id}
                href={href}
                className={`px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-wine text-white shadow-sm font-semibold"
                    : "bg-white text-ink border border-line hover:border-wine/50 hover:text-wine"
                }`}
              >
                <span>{rootCat.name}</span>
                {rootCat.children.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-line/40 text-muted"}`}>
                    {rootCat.children.length}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Key Occasions Quick Links */}
          {events.length > 0 && (
            <>
              <div className="h-4 w-[1px] bg-line/80 mx-1" />
              {events.slice(0, 4).map((evt: any) => {
                const isSelected = searchParams.eventSlug === evt.slug;
                return (
                  <Link
                    key={evt.id}
                    href={getEventUrl(evt)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium tracking-wide transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#87364a] text-white shadow-sm"
                        : "bg-cream/40 text-muted border border-line hover:border-[#87364a] hover:text-[#87364a]"
                    }`}
                  >
                    <Sparkles size={11} className={isSelected ? "text-[#f8d7c4]" : "text-gold"} />
                    <span>{evt.name}</span>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* 2. Top Utility & Active Filter Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 gap-4 border-b border-line/70">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden inline-flex items-center gap-2 bg-white border border-line px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider text-wine shadow-sm hover:bg-[#faf7f2] transition-colors"
          >
            <Filter size={15} />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-wine text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilters.length}
              </span>
            )}
          </button>

          <span className="text-xs uppercase tracking-widest font-bold text-muted">
            Showing {meta?.total || initialProducts.length} {meta?.total === 1 ? 'gift' : 'gifts'}
          </span>

          {/* Active Filter Chips */}
          {activeFilters.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted/70 font-medium">Filtered by:</span>
              {activeFilters.map((af) => (
                <span
                  key={af.key}
                  className="inline-flex items-center gap-1.5 bg-[#f5ebe6] text-wine px-3 py-1 rounded-full text-xs font-medium border border-wine/25 shadow-2xs"
                >
                  <span>{af.label}</span>
                  <button
                    onClick={() => removeFilter(af.key)}
                    className="hover:text-red-700 transition-colors p-0.5 rounded-full hover:bg-wine/10"
                    aria-label={`Remove ${af.label} filter`}
                  >
                    <X size={12} strokeWidth={2.5} />
                  </button>
                </span>
              ))}

              <button
                onClick={clearAllFilters}
                className="text-xs text-muted hover:text-wine underline underline-offset-4 ml-1 transition-colors flex items-center gap-1 font-medium"
              >
                <RotateCcw size={11} /> Clear all
              </button>
            </div>
          )}
        </div>

        {/* Right Controls: Sort & Grid View Toggle */}
        <div className="flex items-center gap-4 self-end sm:self-auto">
          {/* Grid Layout Toggle (Desktop) */}
          <div className="hidden xl:flex items-center border border-line rounded-md bg-white overflow-hidden p-0.5 shadow-2xs">
            <button
              onClick={() => setColumnsView(3)}
              className={`p-1.5 transition-colors rounded-sm ${columnsView === 3 ? "bg-wine text-white" : "text-muted hover:text-ink"}`}
              title="3 Columns"
            >
              <Grid3X3 size={15} />
            </button>
            <button
              onClick={() => setColumnsView(4)}
              className={`p-1.5 transition-colors rounded-sm ${columnsView === 4 ? "bg-wine text-white" : "text-muted hover:text-ink"}`}
              title="4 Columns"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Custom Luxury Sort Dropdown */}
          <SortDropdown
            value={currentSortValue}
            onChange={handleSortChange}
            isLoading={isPending}
          />
        </div>
      </div>

      {/* 3. Main Grid Layout: Refined Sidebar Filters + Products Grid */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
        {/* Desktop Sidebar Filters with Luxury Hierarchy */}
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28 bg-white p-6 rounded-xl border border-line/80 shadow-sm">
          {/* Search Box */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search gifts, tags, sku..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#fbf9f6] border border-line/80 rounded-lg py-2.5 pl-9 pr-8 text-xs text-ink placeholder:text-muted/60 outline-none focus:border-wine focus:bg-white transition-all shadow-inner/5"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    handleFilterChange("search", null);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-wine"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </form>

          {/* Filter Section 1: Gender / Audience (if not locked) */}
          {!lockedGender && (
            <div className="border-b border-line/60 pb-5 mb-5">
              <button
                onClick={() => toggleSection('gender')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink hover:text-wine transition-colors mb-3"
              >
                <span className="flex items-center gap-2">
                  <UserCheck size={14} className="text-wine" />
                  <span>Audience / Gender</span>
                </span>
                {expandedSections.gender ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {expandedSections.gender && (
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: "All", value: null },
                    { label: "Men", value: "male" },
                    { label: "Women", value: "female" },
                    { label: "Unisex", value: "both" },
                  ].map((g) => {
                    const isSelected = (!g.value && !activeGender) || (activeGender === g.value);
                    return (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => handleFilterChange("gender", g.value)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium text-center transition-all ${
                          isSelected
                            ? "bg-wine text-white font-semibold shadow-xs"
                            : "bg-[#fbf9f6] text-ink/80 border border-line/70 hover:border-wine/40 hover:text-wine"
                        }`}
                      >
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Filter Section 2: Hierarchical Categories */}
          <div className="border-b border-line/60 pb-6 mb-6">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink hover:text-wine transition-colors mb-3.5"
            >
              <span className="flex items-center gap-2">
                <FolderTree size={14} className="text-wine" />
                <span>Categories</span>
              </span>
              {expandedSections.categories ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {expandedSections.categories && (
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                {/* "All Categories" option */}
                <Link
                  href={lockedGender ? pathname : "/shop"}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    !activeCategorySlug ? "bg-[#f6eee6] text-wine font-bold" : "text-muted hover:text-ink hover:bg-[#faf7f2]"
                  }`}
                >
                  <span className="font-semibold">All Categories</span>
                  {!activeCategorySlug && <Check size={13} className="text-wine" />}
                </Link>

                {/* Hierarchical Tree of Categories */}
                {categoryTree.map((rootCat: any) => {
                  const isRootActive = activeCategorySlug === rootCat.slug;
                  const hasChildren = rootCat.children && rootCat.children.length > 0;
                  const isChildActive = rootCat.children.some((c: any) => c.slug === activeCategorySlug);
                  const isExpanded = expandedParents[rootCat.id] || isRootActive || isChildActive;

                  return (
                    <div key={rootCat.id} className="flex flex-col">
                      <div className="flex items-center justify-between group">
                        <Link
                          href={isRootActive ? (lockedGender ? pathname : "/shop") : getCategoryUrl(rootCat, categories)}
                          className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                            isRootActive
                              ? "bg-[#f6eee6] text-wine font-bold"
                              : "text-ink font-medium hover:text-wine hover:bg-[#faf7f2]"
                          }`}
                        >
                          <span className="truncate">{rootCat.name}</span>
                          {isRootActive && <Check size={13} className="text-wine shrink-0 ml-1" />}
                        </Link>

                        {/* Expand/Collapse Chevron for parents with children */}
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={(e) => toggleParentCategory(rootCat.id, e)}
                            className="p-1.5 text-muted hover:text-wine transition-colors rounded-md"
                            aria-label={`Toggle ${rootCat.name} subcategories`}
                          >
                            <ChevronDown
                              size={13}
                              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Nested Subcategories */}
                      {hasChildren && isExpanded && (
                        <div className="ml-3 pl-3 border-l-2 border-line/60 flex flex-col gap-1 py-1 my-0.5">
                          {rootCat.children.map((subCat: any) => {
                            const isSubActive = activeCategorySlug === subCat.slug;
                            return (
                              <Link
                                key={subCat.id}
                                href={isSubActive ? (lockedGender ? pathname : "/shop") : getCategoryUrl(subCat, categories)}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11px] transition-all ${
                                  isSubActive
                                    ? "bg-wine/10 text-wine font-bold"
                                    : "text-muted hover:text-ink hover:bg-[#faf7f2]"
                                }`}
                              >
                                <span className="flex items-center gap-1.5 truncate">
                                  <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? "bg-wine" : "bg-line"}`} />
                                  <span className="truncate">{subCat.name}</span>
                                </span>
                                {isSubActive && <Check size={12} className="text-wine shrink-0 ml-1" />}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter Section 3: Price Range (Fixed presets + Custom Inputs) */}
          <div className="border-b border-line/60 pb-6 mb-6">
            <button
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink hover:text-wine transition-colors mb-3.5"
            >
              <span className="flex items-center gap-2">
                <Tag size={14} className="text-wine" />
                <span>Price Range</span>
              </span>
              {expandedSections.price ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>

            {expandedSections.price && (
              <div className="space-y-4">
                {/* Preset Price Tier Buttons */}
                <div className="flex flex-col gap-1.5">
                  {[
                    { label: "All Prices", min: null, max: null },
                    { label: "Under ₹999", min: null, max: "999" },
                    { label: "₹1,000 - ₹2,499", min: "1000", max: "2499" },
                    { label: "₹2,500 - ₹4,999", min: "2500", max: "4999" },
                    { label: "Above ₹5,000", min: "5000", max: null },
                  ].map((tier) => {
                    const isSelected =
                      (!tier.min && !tier.max && !searchParams.minPrice && !searchParams.maxPrice) ||
                      (searchParams.minPrice === tier.min && searchParams.maxPrice === tier.max) ||
                      (!tier.min && !searchParams.minPrice && searchParams.maxPrice === tier.max) ||
                      (!tier.max && !searchParams.maxPrice && searchParams.minPrice === tier.min);

                    return (
                      <button
                        key={tier.label}
                        type="button"
                        onClick={() => handlePriceTierSelect(tier.min, tier.max)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all text-left ${
                          isSelected
                            ? "bg-[#f6eee6] text-wine font-bold"
                            : "text-muted hover:text-ink hover:bg-[#faf7f2]"
                        }`}
                      >
                        <span>{tier.label}</span>
                        {isSelected && <Check size={13} className="text-wine shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Min / Max Inputs */}
                <form onSubmit={handleCustomPriceSubmit} className="pt-2 border-t border-line/50">
                  <div className="text-[11px] text-muted mb-2 font-medium">Custom Range (₹):</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[11px]">₹</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={customMin}
                        onChange={(e) => setCustomMin(e.target.value)}
                        className="w-full bg-[#fbf9f6] border border-line/80 rounded-md py-1.5 pl-6 pr-2 text-xs text-ink outline-none focus:border-wine focus:bg-white"
                        min="0"
                      />
                    </div>
                    <span className="text-muted text-xs">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted text-[11px]">₹</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={customMax}
                        onChange={(e) => setCustomMax(e.target.value)}
                        className="w-full bg-[#fbf9f6] border border-line/80 rounded-md py-1.5 pl-6 pr-2 text-xs text-ink outline-none focus:border-wine focus:bg-white"
                        min="0"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-wine/10 hover:bg-wine text-wine hover:text-white py-1.5 rounded-md text-xs font-semibold tracking-wide transition-colors"
                  >
                    Apply Price
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Filter Section 4: Occasions & Celebrations */}
          {events.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('occasions')}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink hover:text-wine transition-colors mb-3.5"
              >
                <span className="flex items-center gap-2">
                  <Calendar size={14} className="text-wine" />
                  <span>Occasions</span>
                </span>
                {expandedSections.occasions ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {expandedSections.occasions && (
                <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1 no-scrollbar">
                  <Link
                    href={lockedGender ? pathname : "/shop"}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                      !searchParams.eventSlug ? "bg-[#f6eee6] text-wine font-bold" : "text-muted hover:text-ink hover:bg-[#faf7f2]"
                    }`}
                  >
                    <span>All Occasions</span>
                    {!searchParams.eventSlug && <Check size={13} className="text-wine" />}
                  </Link>

                  {events.map((evt: any) => {
                    const isSelected = searchParams.eventSlug === evt.slug;
                    return (
                      <Link
                        key={evt.id}
                        href={getEventUrl(evt)}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${
                          isSelected ? "bg-[#f6eee6] text-wine font-bold" : "text-muted hover:text-ink hover:bg-[#faf7f2]"
                        }`}
                      >
                        <span className="truncate">{evt.name}</span>
                        {isSelected && <Check size={13} className="text-wine shrink-0 ml-1" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* 4. Products Grid */}
        <div className="flex-1 w-full min-w-0">
          {initialProducts.length === 0 ? (
            <div className="text-center py-20 px-6 bg-white border border-line/80 rounded-2xl shadow-sm">
              <div className="w-16 h-16 rounded-full bg-[#fbf5f2] flex items-center justify-center mx-auto mb-4 border border-wine/10">
                <Gift size={28} className="text-wine" />
              </div>
              <h3 className="font-serif text-2xl md:text-3xl text-ink mb-2">No gifts match your selection</h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-8 font-light leading-relaxed">
                We couldn't find products matching your currently selected filters. Try broadening your criteria or explore all gifts.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={clearAllFilters}
                  className="bg-wine text-white text-xs font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-[#521b29] rounded-xl transition-colors shadow-sm"
                >
                  Clear All Filters
                </button>
                <Link
                  href="/builder"
                  className="border border-wine text-wine text-xs font-bold uppercase tracking-wider px-6 py-3.5 hover:bg-wine hover:text-white rounded-xl transition-colors"
                >
                  Build Custom Gift
                </Link>
              </div>
            </div>
          ) : (
            <div
              className={`transition-opacity duration-200 ${
                isPending ? "opacity-60 pointer-events-none" : "opacity-100"
              } grid grid-cols-1 sm:grid-cols-2 ${
                columnsView === 3 ? "lg:grid-cols-3" : "lg:grid-cols-3 xl:grid-cols-4"
              } gap-6 sm:gap-7`}
            >
              <AnimatePresence>
                {initialProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    categories={categories}
                    animate={true}
                    className="rounded-xl shadow-xs hover:shadow-md transition-shadow"
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Filter Drawer (Slide-Over) */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-[110] lg:hidden"
              onClick={() => setIsMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 bottom-0 w-5/6 max-w-md bg-[#fffdfa] z-[120] shadow-2xl flex flex-col lg:hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-line flex items-center justify-between bg-white">
                <div>
                  <h3 className="font-serif text-xl text-wine font-medium">Filter Gifts</h3>
                  <p className="text-[11px] text-muted">Customize your curated selection</p>
                </div>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink hover:text-wine"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
                {/* Search */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink mb-2 block">Search</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search gifts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-line rounded-lg py-2.5 pl-8 text-xs text-ink outline-none"
                    />
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                  </div>
                </div>

                {/* Audience / Gender (if not locked) */}
                {!lockedGender && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-ink mb-2 block">Audience / Gender</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "All", value: null },
                        { label: "For Him (Men)", value: "male" },
                        { label: "For Her (Women)", value: "female" },
                        { label: "Unisex", value: "both" },
                      ].map((g) => {
                        const isSelected = (!g.value && !activeGender) || (activeGender === g.value);
                        return (
                          <button
                            key={g.label}
                            type="button"
                            onClick={() => {
                              handleFilterChange("gender", g.value);
                              setIsMobileFiltersOpen(false);
                            }}
                            className={`py-2 px-3 rounded-lg text-xs font-medium text-center ${
                              isSelected
                                ? "bg-wine text-white font-semibold"
                                : "bg-white border border-line text-ink"
                            }`}
                          >
                            {g.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Categories */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink mb-2 block">Categories</label>
                  <div className="flex flex-col gap-1.5 bg-white p-3 border border-line rounded-lg max-h-52 overflow-y-auto">
                    <Link
                      href={lockedGender ? pathname : "/shop"}
                      onClick={() => setIsMobileFiltersOpen(false)}
                      className={`text-left text-xs py-1.5 px-2 rounded-md ${!activeCategorySlug ? "bg-[#f6eee6] text-wine font-bold" : "text-muted"}`}
                    >
                      All Categories
                    </Link>
                    {categoryTree.map((rootCat: any) => (
                      <div key={rootCat.id} className="flex flex-col">
                        <Link
                          href={getCategoryUrl(rootCat, categories)}
                          onClick={() => setIsMobileFiltersOpen(false)}
                          className={`text-left text-xs py-1.5 px-2 rounded-md font-medium ${
                            activeCategorySlug === rootCat.slug ? "bg-[#f6eee6] text-wine font-bold" : "text-ink"
                          }`}
                        >
                          {rootCat.name}
                        </Link>
                        {rootCat.children && rootCat.children.length > 0 && (
                          <div className="ml-3 pl-2 border-l border-line/60 flex flex-col gap-1 my-1">
                            {rootCat.children.map((sub: any) => (
                              <Link
                                key={sub.id}
                                href={getCategoryUrl(sub, categories)}
                                onClick={() => setIsMobileFiltersOpen(false)}
                                className={`text-left text-[11px] py-1 px-2 rounded-md ${
                                  activeCategorySlug === sub.slug ? "bg-wine/10 text-wine font-bold" : "text-muted"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-ink mb-2 block">Price Range</label>
                  <div className="flex flex-col gap-1.5 bg-white p-3 border border-line rounded-lg mb-3">
                    {[
                      { label: "Any Price", min: null, max: null },
                      { label: "Under ₹999", min: null, max: "999" },
                      { label: "₹1,000 - ₹2,499", min: "1000", max: "2499" },
                      { label: "₹2,500 - ₹4,999", min: "2500", max: "4999" },
                      { label: "Above ₹5,000", min: "5000", max: null },
                    ].map((tier) => {
                      const isSelected =
                        (!tier.min && !tier.max && !searchParams.minPrice && !searchParams.maxPrice) ||
                        (searchParams.minPrice === tier.min && searchParams.maxPrice === tier.max) ||
                        (!tier.min && !searchParams.minPrice && searchParams.maxPrice === tier.max) ||
                        (!tier.max && !searchParams.maxPrice && searchParams.minPrice === tier.min);

                      return (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => {
                            handlePriceTierSelect(tier.min, tier.max);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`text-left text-xs py-1.5 px-2 rounded-md flex items-center justify-between ${
                            isSelected ? "bg-[#f6eee6] text-wine font-bold" : "text-muted"
                          }`}
                        >
                          <span>{tier.label}</span>
                          {isSelected && <Check size={13} className="text-wine" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Price in Drawer */}
                  <form
                    onSubmit={(e) => {
                      handleCustomPriceSubmit(e);
                      setIsMobileFiltersOpen(false);
                    }}
                    className="flex gap-2"
                  >
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-1/2 bg-white border border-line rounded-lg py-2 px-3 text-xs outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      className="w-1/2 bg-white border border-line rounded-lg py-2 px-3 text-xs outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-wine text-white text-xs px-3 py-2 rounded-lg font-bold uppercase"
                    >
                      Go
                    </button>
                  </form>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-line bg-white flex gap-3">
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-3 border border-line text-ink text-xs font-bold uppercase tracking-wider hover:bg-cream rounded-xl"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    handleSearch({ preventDefault: () => {} } as any);
                    setIsMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-3 bg-wine text-white text-xs font-bold uppercase tracking-wider hover:bg-[#521b29] rounded-xl"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
