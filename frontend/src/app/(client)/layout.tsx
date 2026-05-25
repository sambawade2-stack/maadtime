import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ClosedBanner from "@/components/boutique/ClosedBanner";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <ClosedBanner />
      <main className="min-h-screen pt-16 lg:pt-20">{children}</main>
      <Footer />
    </>
  );
}
