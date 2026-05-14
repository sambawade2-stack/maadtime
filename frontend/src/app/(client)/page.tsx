import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NaturalSection from "@/components/home/NaturalSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeaturedProducts />
      <NaturalSection />
      <TestimonialsSection />
      <WhatsAppCTA />
    </>
  );
}
