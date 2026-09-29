import Image from "next/image";
import Link from "next/link";

export default function AudienceSection() {
  return (
    <section className="px-6 md:px-12 py-24 bg-white" id="audience">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-wine text-xs font-bold tracking-[0.2em] uppercase mb-4">Find their kind of happy</p>
          <h2 className="font-serif text-4xl md:text-5xl text-ink mb-6">
            Gifts that feel <em className="font-medium text-wine">just right.</em>
          </h2>
          <p className="text-ink/70 max-w-2xl mx-auto">
            Explore thoughtful edits for him and her, curated around the people who make your moments matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link href="/men" className="group relative block h-[500px] overflow-hidden rounded-sm bg-[#f2ede7]">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <Image
              src="/men-hero.png"
              alt="Man holding a bouquet as a gift"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
              <span className="text-xs font-bold tracking-[0.2em] uppercase mb-3 text-white/90">The edit for him</span>
              <strong className="font-serif text-5xl font-normal leading-tight mb-6">
                For<br /><em className="font-medium">Men</em>
              </strong>
              <span className="inline-block w-fit border-b border-white pb-1 text-sm font-medium transition-colors group-hover:text-[#eadbd3] group-hover:border-[#eadbd3]">
                Shop his gifts &rarr;
              </span>
            </div>
          </Link>

          <Link href="/women" className="group relative block h-[500px] overflow-hidden rounded-sm bg-[#f4ecea]">
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            <Image
              src="/women-hero.png"
              alt="Woman holding a bouquet as a gift"
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-10 text-white">
              <span className="text-xs font-bold tracking-[0.2em] uppercase mb-3 text-white/90">The edit for her</span>
              <strong className="font-serif text-5xl font-normal leading-tight mb-6">
                For<br /><em className="font-medium">Women</em>
              </strong>
              <span className="inline-block w-fit border-b border-white pb-1 text-sm font-medium transition-colors group-hover:text-[#eadbd3] group-hover:border-[#eadbd3]">
                Shop her gifts &rarr;
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
