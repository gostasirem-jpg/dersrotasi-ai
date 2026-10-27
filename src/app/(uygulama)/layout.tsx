import { AppSidebar } from "@/components/AppSidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileNav } from "@/components/MobileNav";

export default function UygulamaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-main flex flex-col">
      {/* Masaüstü sabit sol kenar menüsü */}
      <AppSidebar />

      {/* Telefon ve tablet üst ince başlık çubuğu */}
      <MobileHeader />

      {/* Ana İçerik Alanı */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <main
          id="main-content"
          className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-18 pb-24 lg:pt-8 lg:pb-8"
        >
          {children}
        </main>
      </div>

      {/* Telefon ve tablet alt navigasyon çubuğu ve menü paneli */}
      <MobileNav />
    </div>
  );
}
