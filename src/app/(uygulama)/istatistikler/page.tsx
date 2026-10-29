import type { Metadata } from "next";
import { IstatistiklerIstemci } from "@/components/istatistikler/IstatistiklerIstemci";

export const metadata: Metadata = {
  title: "İstatistikler",
  description: "Çalışma sürelerinizi ve tamamlanan görevlerinizi inceleyin.",
};

export default function IstatistiklerPage() {
  return <IstatistiklerIstemci />;
}
