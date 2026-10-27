import type { Metadata } from "next";
import { GorevlerIstemci } from "@/components/gorevler/GorevlerIstemci";

export const metadata: Metadata = {
  title: "Görevler",
  description: "Ödevler, projeler ve sınav hazırlık görevleri takibi.",
};

export default function GorevlerPage() {
  return <GorevlerIstemci />;
}
