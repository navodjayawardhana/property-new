import Navbar from "./components/Navbar";
import HeroSearch from "./components/HeroSearch";
import FeaturedProperties from "./components/FeaturedProperties";
import CountrySection from "./components/CountrySection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSearch />
        <FeaturedProperties />
        <CountrySection />
      </main>
      <Footer />
    </>
  );
}
