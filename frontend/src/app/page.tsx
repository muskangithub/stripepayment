'use client';

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category, ProductsResponse } from '@/types';
import { productsApi, categoriesApi } from '@/lib/api';
import { Search, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { LogoCloud } from '@/components/LogoCloud';
import { StatsSection } from '@/components/StatsSection';
import { TestimonialSlider } from '@/components/TestimonialSlider';
import { CommunityGallery } from '@/components/CommunityGallery';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory]);

  async function loadData() {
    try {
      const [productsData, categoriesData, featuredData] = await Promise.all([
        productsApi.getAll() as Promise<ProductsResponse>,
        categoriesApi.getAll() as Promise<Category[]>,
        productsApi.getAll({ featured: true }) as Promise<ProductsResponse>,
      ]);
      setProducts(productsData.products);
      setCategories(categoriesData);
      setFeaturedProducts(featuredData.products);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadProducts() {
    try {
      const data = await productsApi.getAll({
        search: search || undefined,
        category: selectedCategory || undefined
      }) as ProductsResponse;
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-t-2 border-purple-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-32 pb-20 overflow-hidden bg-premium">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />

        <div className="relative max-w-7xl mx-auto text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 text-purple-300 text-sm font-bold mb-8 animate-fade-in shadow-2xl">
            <Sparkles className="w-4 h-4" />
            <span>Discover the Future of Shopping</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter animate-fade-in">
            <span className="text-white">Experience</span>
            <br />
            <span className="text-gradient">Pure Luxury</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in [animation-delay:200ms]">
            Curated collections for the modern lifestyle. Fast, secure, and purely premium.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:400ms]">
            <div className="w-full max-w-md relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
              <input
                type="text"
                placeholder="Find your next favorite item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 glass rounded-[2rem] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg shadow-2xl"
              />
            </div>
            <button className="px-8 py-5 bg-white text-black font-black rounded-[2rem] hover:bg-purple-500 hover:text-white transition-all shadow-xl hover:shadow-purple-500/40">
              Browse All
            </button>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in [animation-delay:600ms] opacity-50">
            <div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" /> <span>Secure Payments</span></div>
            <div className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> <span>Trending Products</span></div>
          </div>
        </div>
      </section>

      {/* Trust Signals: Logo Cloud */}
      <LogoCloud />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-24 px-4 bg-white/[0.02]">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-4">The Spotlight</h2>
                <div className="h-1.5 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
              </div>
              <p className="text-gray-400 hidden md:block max-w-xs text-right">Our most wanted items this season, handpicked for you.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <StatsSection />

      {/* Categories Grid */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Explore the Best</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-8 py-4 rounded-full font-bold transition-all ${selectedCategory === ''
                  ? 'bg-white text-black shadow-xl ring-4 ring-white/10'
                  : 'glass text-gray-400 hover:text-white'
                  }`}
              >
                All Gear
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={`px-8 py-4 rounded-full font-bold transition-all ${selectedCategory === category.slug
                    ? 'bg-purple-600 text-white shadow-xl ring-4 ring-purple-600/20'
                    : 'glass text-gray-400 hover:text-white'
                    }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length === 0 && (
            <div className="text-center py-20 glass rounded-[3rem]">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-2xl font-bold text-white">No matches found</p>
              <p className="text-gray-500 mt-2">Try rephrasing your search query</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSlider />

      {/* Community Gallery */}
      <CommunityGallery />

      {/* Pre-footer CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto glass rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8">Ready to Elevate Your Style?</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join the community of fashion enthusiasts and get early access to our limited drops.
          </p>
          <button className="px-12 py-5 bg-white text-black font-black rounded-full hover:bg-purple-500 hover:text-white transition-all text-xl shadow-2xl hover:shadow-purple-500/40">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-4 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-2xl font-black text-white mb-6">ShopPro</h3>
              <p className="text-gray-500 leading-relaxed">Redefining modern e-commerce with a premium, trusted, and fast shopping experience.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Shop</h4>
              <ul className="space-y-4 text-gray-500">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">New Arrivals</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Best Sellers</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Featured</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Support</h4>
              <ul className="space-y-4 text-gray-500">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Shipping</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Returns</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Legal</h4>
              <ul className="space-y-4 text-gray-500">
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Privacy</li>
                <li className="hover:text-purple-400 transition-colors cursor-pointer">Terms</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 text-center text-gray-600 text-sm">
            <p>© 2024 ShopPro Premium. Designed for Excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

