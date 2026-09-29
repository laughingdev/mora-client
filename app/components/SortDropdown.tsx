"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

export interface SortOption {
  value: string;
  label: string;
  sort: string;
  order: "asc" | "desc";
  description?: string;
}

export const DEFAULT_SORT_OPTIONS: SortOption[] = [
  {
    value: "createdAt-desc",
    label: "Newest Arrivals",
    sort: "createdAt",
    order: "desc",
    description: "Freshly curated treasures",
  },
  {
    value: "price-asc",
    label: "Price: Low to High",
    sort: "price",
    order: "asc",
    description: "Budget-friendly first",
  },
  {
    value: "price-desc",
    label: "Price: High to Low",
    sort: "price",
    order: "desc",
    description: "Luxury & premium first",
  },
  {
    value: "name-asc",
    label: "Alphabetical: A to Z",
    sort: "name",
    order: "asc",
    description: "Title in ascending order",
  },
  {
    value: "name-desc",
    label: "Alphabetical: Z to A",
    sort: "name",
    order: "desc",
    description: "Title in descending order",
  },
];

interface SortDropdownProps {
  value: string;
  onChange: (option: SortOption) => void;
  options?: SortOption[];
  className?: string;
  isLoading?: boolean;
}

export default function SortDropdown({
  value,
  onChange,
  options = DEFAULT_SORT_OPTIONS,
  className = "",
  isLoading = false,
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find active option, fallback to first option
  const activeOption =
    options.find((opt) => opt.value === value) ||
    options.find((opt) => opt.value === "createdAt-desc") ||
    options[0];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation (Esc to close)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (option: SortOption) => {
    setIsOpen(false);
    if (option.value !== value) {
      onChange(option);
    }
  };

  const isCustomSort = activeOption.value !== "createdAt-desc";

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-left ${className}`}
    >
      {/* Trigger Button */}
      <button
        type="button"
        id="shop-sort-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Sort products"
        className={`group flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all duration-200 border shadow-2xs cursor-pointer select-none ${
          isOpen
            ? "border-wine bg-white text-wine ring-2 ring-wine/10"
            : isCustomSort
            ? "border-wine/50 bg-[#faf5f0] text-wine hover:border-wine"
            : "border-line bg-white text-ink hover:border-wine/40 hover:bg-[#fffdfa]"
        }`}
      >
        <ArrowUpDown
          size={13}
          className={`transition-colors shrink-0 ${
            isCustomSort || isOpen ? "text-wine" : "text-muted group-hover:text-wine"
          } ${isLoading ? "animate-spin" : ""}`}
        />

        <div className="flex items-center gap-1.5">
          <span className="text-muted text-[11px] uppercase tracking-wider font-semibold hidden sm:inline">
            Sort:
          </span>
          <span className="font-semibold text-xs tracking-tight text-ink">
            {activeOption.label}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-muted transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-wine" : "group-hover:text-ink"
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            role="listbox"
            aria-activedescendant={activeOption.value}
            className="absolute right-0 mt-2 w-60 sm:w-64 bg-white/98 backdrop-blur-md rounded-xl border border-line shadow-xl py-1.5 z-50 overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-line/60 bg-[#fbf9f6]">
              <p className="text-[10px] font-bold tracking-widest uppercase text-muted">
                Sort Collection By
              </p>
            </div>

            <div className="py-1">
              {options.map((option) => {
                const isSelected = option.value === activeOption.value;
                return (
                  <button
                    key={option.value}
                    role="option"
                    id={`sort-option-${option.value}`}
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer group ${
                      isSelected
                        ? "bg-[#f5ede7] text-wine font-semibold"
                        : "text-ink hover:bg-[#faf6f2] hover:text-wine"
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="leading-snug">{option.label}</span>
                      {option.description && (
                        <span
                          className={`text-[10px] font-normal ${
                            isSelected
                              ? "text-wine/75"
                              : "text-muted group-hover:text-wine/70"
                          }`}
                        >
                          {option.description}
                        </span>
                      )}
                    </div>

                    {isSelected && (
                      <Check
                        size={14}
                        className="text-wine shrink-0 ml-2 animate-in fade-in zoom-in-75 duration-150"
                        strokeWidth={2.5}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
