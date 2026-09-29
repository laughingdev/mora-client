import { permanentRedirect } from "next/navigation";

export default function BlogsRedirectPage() {
  permanentRedirect("/blog");
}
