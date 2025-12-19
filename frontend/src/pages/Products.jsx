import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiFilter, FiX, FiChevronDown } from 'react-icons/fi'
import { fetchProducts, fetchCategories, searchProducts } from '../store/slices/productSlice'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'

function Products() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: searchParams.get('sort') || 'newest',
  })

  const dispatch = useDispatch()
  const { products, categories, loading, pagination } = useSelector((state) => state.products)
  const query = searchParams.get('q')

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  useEffect(() => {
    const params = {
      page: searchParams.get('page') || 1,
      limit: 12,
      ...filters,
    }

    if (query) {
      dispatch(searchProducts({ q: query, ...params }))
    } else {
      dispatch(fetchProducts(params))
    }
  }, [dispatch, searchParams, filters, query])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '', sort: 'newest' })
    setSearchParams(query ? { q: query } : {})
  }

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">
            {query ? `Search: "${query}"` : 'All Products'}
          </h1>
          <p className="text-dark-400 mt-1">
            {pagination.total} products found
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden btn-secondary flex items-center space-x-2 py-2 px-4"
          >
            <FiFilter size={18} />
            <span>Filters</span>
          </button>
          
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="appearance-none bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 pr-10 text-white focus:outline-none focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-dark-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <aside className={`${isFilterOpen ? 'fixed inset-0 z-50 bg-dark-950 p-6' : 'hidden'} md:block md:relative md:w-64 flex-shrink-0`}>
          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="text-lg font-semibold text-white">Filters</h2>
            <button onClick={() => setIsFilterOpen(false)} className="text-dark-400">
              <FiX size={24} />
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-white mb-3">Category</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleFilterChange('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    !filters.category ? 'bg-primary-500/10 text-primary-400' : 'text-dark-300 hover:text-white'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleFilterChange('category', cat._id)}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      filters.category === cat._id ? 'bg-primary-500/10 text-primary-400' : 'text-dark-300 hover:text-white'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-3">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full input-field py-2 text-sm"
                />
                <span className="text-dark-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full input-field py-2 text-sm"
                />
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full btn-secondary py-2 text-sm"
            >
              Clear Filters
            </button>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <Loading />
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-dark-400">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center mt-12 space-x-2">
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams)
                        params.set('page', i + 1)
                        setSearchParams(params)
                      }}
                      className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                        pagination.page === i + 1
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Products

