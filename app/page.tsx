import Navbar from "./components/Navbar";
import HeroSearch from "./components/HeroSearch";
import FeaturedProperties from "./components/FeaturedProperties";
import CountrySection from "./components/CountrySection";
import WhyUs from "./components/WhyUs";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSearch />
        <FeaturedProperties />
        <CountrySection />
        <WhyUs />
      </main>
      <Footer />
    </>
  );
}
