import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import NaturalSection from "@/components/home/NaturalSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import WhatsAppCTA from "@/components/home/WhatsAppCTA";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <CategoriesSection />
      <FeaturedProducts />
      <NaturalSection />
      <TestimonialsSection />
      <WhatsAppCTA />
    </>
  );
}
