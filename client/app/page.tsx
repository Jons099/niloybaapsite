import HeroSection from '@/components/home/HeroSection'
import FeaturedCategories from '@/components/home/FeaturedCategories'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import BrandStory from '@/components/home/BrandStory'
import Newsletter from '@/components/home/Newsletter'

export default function Home() {
  return (
    <main className="bg-luxury-pearl">
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <BrandStory />
      <Newsletter />
    </main>
  )
}