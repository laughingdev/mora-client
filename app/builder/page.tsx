import { Metadata } from "next";
import BuilderClient from "./BuilderClient";

export const metadata: Metadata = {
  title: "Gift Builder | Curate Your Custom Hamper",
  description: "Curate a personalized gift hamper with handcrafted luxury boxes, customizable artisan products, and personalized greeting cards handwritten by calligraphy artists.",
};

export default function BuilderPage() {
  return <BuilderClient />;
}
