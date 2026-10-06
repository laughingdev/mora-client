"use client";

import Link from "next/link";
import { Mail, MessageCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FooterProps {
  categories?: any[];
  pages?: any[];
}

export default function Footer({ categories = [], pages = [] }: FooterProps) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${apiBase}/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        toast.success("Thank you for subscribing to Mora Moments newsletter!");
        setEmail("");
      } else {
        toast.error("Unable to subscribe at this moment. Please try again later.");
      }
    } catch (err) {
      toast.success("Thank you for subscribing to Mora Moments newsletter!");
      setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#321e22] text-[#f7e9dc] pt-20 pb-8 px-6 md:px-12 border-t-8 border-wine">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-16 border-b border-[#674a4f]">
          {/* Column 1 */}
          <div className="lg:pr-8">
            <Link href="/" className="inline-block mb-8">
              <img src="/mora-logo-with-bg.png" alt="Mora Moments" className="h-14 rounded-full" />
            </Link>
            <h4 className="font-serif text-xl text-[#dfb18e] mb-3">Sign up and save</h4>
            <p className="text-xs text-[#e7cfc4] mb-6 leading-relaxed">
              Subscribe for special offers, new gift drops and thoughtful inspiration.
            </p>
            <form onSubmit={handleSubmitNewsletter} className="flex border-b border-[#aa7d7d] pb-2 mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="bg-transparent text-sm w-full outline-none placeholder:text-[#e7cfc4]/50 text-white"
              />
              <button
                type="submit"
                disabled={submitting}
                className="text-[#dfb18e] hover:text-white transition-colors p-1 disabled:opacity-50"
                aria-label="Subscribe"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
              </button>
            </form>

            <div className="flex gap-4">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/mora_moments/"
                target="_blank"
                rel="noopener noreferrer"
                title="Follow us on Instagram @mora_moments"
                className="w-10 h-10 rounded-full border border-[#674a4f] flex items-center justify-center hover:bg-wine hover:border-wine transition-colors text-[#e7cfc4] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/918696333360"
                target="_blank"
                rel="noopener noreferrer"
                title="Chat with us on WhatsApp"
                className="w-10 h-10 rounded-full border border-[#674a4f] flex items-center justify-center hover:bg-[#25D366] hover:border-[#25D366] transition-colors text-[#e7cfc4] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2a10 10 0 0 0-8.513 15.242L2 22l4.898-1.436A10 10 0 1 0 12 2zm0 18a7.95 7.95 0 0 1-4.068-1.117l-.292-.174-2.898.85.864-2.83-.191-.304A7.957 7.957 0 1 1 12 20z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#dfb18e] mb-6">Menu</h4>
            <div className="flex flex-col gap-4 text-xs text-[#e7cfc4]">
              <Link href="/shop" className="hover:text-white transition-colors">All gifts</Link>
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <Link href="/builder" className="hover:text-white transition-colors">Create your gift</Link>
            </div>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#dfb18e] mb-6">Reviews and deals</h4>
            <div className="flex flex-col gap-4 text-xs text-[#e7cfc4] mb-8">
              <Link href="/shop?featured=true" className="hover:text-white transition-colors">Offers and deals</Link>
              <Link href="/shop?maxPrice=999" className="hover:text-white transition-colors">Gifts under ₹999</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Gift inspiration</Link>
            </div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#dfb18e] mb-6 pt-6 border-t border-[#674a4f]">Shop by occasion</h4>
            <div className="flex flex-col gap-4 text-xs text-[#e7cfc4]">
              <Link href="/events/birthday" className="hover:text-white transition-colors">Birthday gifts</Link>
              <Link href="/events/anniversary" className="hover:text-white transition-colors">Anniversaries & Romance</Link>
              <Link href="/events/weddings" className="hover:text-white transition-colors">Weddings & Celebrations</Link>
              <Link href="/events" className="text-[#dfb18e] hover:text-white transition-colors font-medium">All occasions →</Link>
            </div>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#dfb18e] mb-6">Join our community</h4>
            <div className="flex flex-col gap-4 text-xs text-[#e7cfc4] mb-8">
              <Link href="/affiliate-program" className="hover:text-white transition-colors">Affiliate programme</Link>
              <Link href="/about-us" className="hover:text-white transition-colors">Our story</Link>
              <Link href="/shop/corporate" className="hover:text-white transition-colors">Corporate Gifting</Link>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            </div>
            <h4 className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#dfb18e] mb-6 pt-6 border-t border-[#674a4f]">Quick links</h4>
            <div className="grid grid-cols-2 gap-4 text-xs text-[#e7cfc4]">
              {pages && pages.length > 0 ? (
                pages.slice(0, 6).map((page) => (
                  <Link
                    key={page.id || page.slug}
                    href={`/${page.slug}`}
                    className="hover:text-white transition-colors truncate"
                  >
                    {page.title}
                  </Link>
                ))
              ) : (
                <>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                  <Link href="/terms-and-conditions" className="hover:text-white transition-colors">Terms & Conditions</Link>
                  <Link href="/shipping-policy" className="hover:text-white transition-colors">Shipping Policy</Link>
                  <Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link>
                  <Link href="/contact-us" className="hover:text-white transition-colors">Contact Us</Link>
                </>
              )}
              <Link href="/track-order" className="hover:text-white transition-colors">Track order</Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-[10px] text-[#bda3a0]">
          <span>© 2026 Mora Moments. All rights reserved.</span>
          <span className="mt-4 md:mt-0">Made with ♥ in India</span>
        </div>
      </div>
    </footer>
  );
}
