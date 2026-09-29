import Link from "next/link";
import { 
  ShieldCheck, 
  FileText, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Mail, 
  MessageCircle, 
  ChevronRight,
  Clock,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { PageRecord } from "../data/defaultPages";

interface CmsPageViewProps {
  page: PageRecord;
  slug: string;
}

const POLICY_LINKS = [
  { slug: "privacy-policy", label: "Privacy Policy", icon: ShieldCheck },
  { slug: "terms-and-conditions", label: "Terms & Conditions", icon: FileText },
  { slug: "shipping-policy", label: "Shipping Policy", icon: Truck },
  { slug: "refund-policy", label: "Refund Policy", icon: RotateCcw },
  { slug: "contact-us", label: "Contact Us", icon: Mail },
  { slug: "about-us", label: "About Us", icon: Sparkles },
];

export default function CmsPageView({ page, slug }: CmsPageViewProps) {
  // Determine relevant icon
  const matchedNav = POLICY_LINKS.find((p) => p.slug === slug);
  const PageIcon = matchedNav?.icon || FileText;

  const formattedDate = page.updatedAt 
    ? new Date(page.updatedAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "September 2026";

  return (
    <div className="min-h-screen bg-ivory">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream/80 via-cream/40 to-ivory border-b border-line pt-10 pb-14 px-6 md:px-12">
        <div className="container mx-auto max-w-5xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted mb-6">
            <Link href="/" className="hover:text-wine transition-colors">Home</Link>
            <ChevronRight size={12} className="text-muted/60" />
            <span className="text-muted/80">Information</span>
            <ChevronRight size={12} className="text-muted/60" />
            <span className="text-wine font-semibold truncate">{page.title}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-line text-wine text-xs font-semibold tracking-wider uppercase mb-4 shadow-2xs">
                <PageIcon size={14} className="text-wine" />
                <span>Official Policy & Store Information</span>
              </div>
              <h1 className="font-serif text-3xl md:text-5xl text-wine font-normal tracking-tight mb-3">
                {page.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-gold" />
                  <span>Last revised: {formattedDate}</span>
                </span>
                <span className="text-line">•</span>
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-gold" />
                  <span>Verified for Mora Moments India</span>
                </span>
              </div>
            </div>

            {/* Quick trust badge */}
            <div className="hidden lg:flex items-center gap-3 bg-white/70 border border-line p-4 rounded-xl shadow-2xs backdrop-blur-xs">
              <div className="w-10 h-10 rounded-full bg-wine/10 flex items-center justify-center text-wine shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-ink">Transparent & Secure</p>
                <p className="text-muted text-[11px]">Compliant with Indian DPDP Act & IT Regulations</p>
              </div>
            </div>
          </div>

          {/* Policy Navigation Pills Bar */}
          <div className="mt-10 pt-6 border-t border-line/60 overflow-x-auto no-scrollbar scrollbar-hide">
            <div className="flex items-center gap-2 min-w-max pb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted mr-1">Other Policies:</span>
              {POLICY_LINKS.map((item) => {
                const isActive = item.slug === slug;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-wine text-white shadow-xs font-semibold"
                        : "bg-white/80 text-ink/80 hover:bg-white hover:text-wine border border-line/80"
                    }`}
                  >
                    <IconComponent size={13} className={isActive ? "text-gold" : "text-muted"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Document Content */}
      <section className="container mx-auto max-w-4xl px-6 md:px-12 py-12 md:py-16">
        <div className="bg-white border border-line rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.03)] p-8 md:p-14">
          <article 
            className="cms-content text-ink/85 leading-relaxed text-[15px] space-y-6"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />

          {/* Assistance & Grievance Box */}
          <div className="mt-14 pt-10 border-t border-line">
            <div className="bg-cream/40 border border-line rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3 className="font-serif text-xl text-wine mb-1.5">Have questions regarding this policy?</h3>
                <p className="text-xs text-muted leading-relaxed max-w-xl">
                  Our customer happiness desk is available Monday to Saturday, 10 AM to 7 PM IST to answer any questions or clarify our gifting processes.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="mailto:care@moramoments.in"
                  className="inline-flex items-center gap-2 bg-wine text-white px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-wine-dark transition-colors shadow-xs"
                >
                  <Mail size={14} />
                  <span>Email Support</span>
                </a>
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white text-ink border border-line px-4 py-2.5 rounded-md text-xs font-bold uppercase tracking-wider hover:text-wine hover:border-wine transition-colors"
                >
                  <MessageCircle size={14} className="text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
