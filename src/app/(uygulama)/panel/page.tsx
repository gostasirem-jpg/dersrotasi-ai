import type { Metadata } from "next";
import { PanelIstemci } from "@/components/panel/PanelIstemci";

export const metadata: Metadata = {
  title: "Panel",
  description:
    "DersRotası AI genel kontrol paneli ile günlük derslerinizi ve haftalık hedeflerinizi yönetin.",
};

export default function PanelPage() {
  return <PanelIstemci />;
}
