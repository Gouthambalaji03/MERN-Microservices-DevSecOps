import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi'
import { fetchFeatured, fetchCategories } from '../store/slices/productSlice'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'

function Home() {
  const dispatch = useDispatch()
  const { featured, categories, loading } = useSelector((state) => state.products)

  useEffect(() => {
    dispatch(fetchFeatured())
    dispatch(fetchCategories())
  }, [dispatch])

  const features = [
    { icon: FiTruck, title: 'Free Shipping', desc: 'On orders over $100' },
    { icon: FiRefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: FiShield, title: 'Secure Payment', desc: 'SSL encrypted checkout' },
    { icon: FiHeadphones, title: '24/7 Support', desc: 'Dedicated customer support' },
  ]

  return (
    <div>
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-primary-600/5"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/20 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="text-primary-400 text-sm font-medium">Production-Grade Microservices</span>
              </div>
              
              <h1 className="font-display text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-white">Shop the</span>
                <br />
                <span className="text-gradient">Future Today</span>
              </h1>
              
              <p className="text-dark-300 text-lg max-w-lg">
                Experience seamless shopping powered by 10 microservices, Kubernetes orchestration, and DevSecOps best practices.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn-primary flex items-center justify-center space-x-2">
                  <span>Explore Products</span>
                  <FiArrowRight />
                </Link>
                <Link to="/register" className="btn-secondary flex items-center justify-center">
                  Create Account
                </Link>
              </div>
              
              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-white">10+</p>
                  <p className="text-dark-400 text-sm">Microservices</p>
                </div>
                <div className="w-px h-12 bg-dark-700"></div>
                <div>
                  <p className="text-3xl font-bold text-white">99.9%</p>
                  <p className="text-dark-400 text-sm">Uptime SLA</p>
                </div>
                <div className="w-px h-12 bg-dark-700"></div>
                <div>
                  <p className="text-3xl font-bold text-white">&lt;200ms</p>
                  <p className="text-dark-400 text-sm">Response Time</p>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-3xl blur-2xl"></div>
              <div className="relative glass rounded-3xl p-8">
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-dark-800 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 border-y border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="text-primary-500" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{feature.title}</h4>
                  <p className="text-dark-400 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-display text-3xl font-bold text-white">Shop by Category</h2>
                <p className="text-dark-400 mt-2">Browse our curated collections</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {categories.slice(0, 4).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category._id}`}
                  className="group card-hover text-center py-8"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/10 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="text-3xl">📦</span>
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20 bg-dark-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">Featured Products</h2>
              <p className="text-dark-400 mt-2">Handpicked for you</p>
            </div>
            <Link to="/products" className="text-primary-500 hover:text-primary-400 transition-colors flex items-center space-x-2">
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </div>
          
          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-primary-600/5"></div>
            <div className="relative">
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Ready to Start Shopping?
              </h2>
              <p className="text-dark-300 max-w-lg mx-auto mb-8">
                Join thousands of happy customers and experience the future of e-commerce.
              </p>
              <Link to="/register" className="btn-primary inline-flex items-center space-x-2">
                <span>Get Started Free</span>
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

