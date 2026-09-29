import { Suspense } from "react";
import type { Metadata } from "next";
import TrackOrderClient from "./TrackOrderClient";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Track the real-time status of your Mora Moments gift order. Enter your order ID to see crafting progress, dispatch details, and estimated delivery.",
  openGraph: {
    title: "Track Your Order | Mora Moments",
    description: "Track the real-time status of your Mora Moments gift order.",
  }
};

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fbf9f6] flex items-center justify-center pt-32 pb-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-3 border-[#6b1d2f]/20 border-t-[#6b1d2f] rounded-full animate-spin" />
            <p className="font-serif text-lg text-[#2c1810]">Loading Order Tracker...</p>
          </div>
        </div>
      }
    >
      <TrackOrderClient />
    </Suspense>
  );
}
