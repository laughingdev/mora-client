export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-6 bg-[#fffdfa]/80 backdrop-blur-xs">
      {/* Lightweight animated luxury spinner & logo watermark */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glowing ring */}
        <div className="w-16 h-16 border-2 border-wine/20 border-t-wine rounded-full animate-spin" />
        
        {/* Inner static logo mark */}
        <div className="absolute w-8 h-8 rounded-full bg-cream flex items-center justify-center border border-line shadow-2xs">
          <span className="font-serif text-wine text-xs font-bold tracking-tighter">M</span>
        </div>
      </div>

      <p className="font-serif text-base text-ink font-normal tracking-wide animate-pulse">
        Crafting your gift experience...
      </p>
      <span className="text-[11px] uppercase tracking-[0.2em] text-wine/70 mt-1">
        Mora Moments
      </span>
    </div>
  );
}
