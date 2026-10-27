import type { Metadata } from "next";
import { DerslerIstemci } from "@/components/dersler/DerslerIstemci";

export const metadata: Metadata = {
  title: "Dersler",
  description: "Derslerinizi ve zorluk seviyelerini yönetin.",
};

export default function DerslerPage() {
  return <DerslerIstemci />;
}
