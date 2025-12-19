import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { FiShoppingCart, FiStar } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { addToCart } from '../store/slices/cartSlice'

function ProductCard({ product }) {
  const dispatch = useDispatch()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch(addToCart({
      productId: product._id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url || '/placeholder.png',
      quantity: 1
    }))
    toast.success('Added to cart!')
  }

  return (
    <Link to={`/products/${product._id}`} className="group">
      <div className="card-hover overflow-hidden">
        <div className="relative aspect-square bg-dark-800 rounded-xl overflow-hidden mb-4">
          <img
            src={product.images?.[0]?.url || '/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="absolute top-3 left-3 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
              {Math.round((1 - product.price / product.compareAtPrice) * 100)}% OFF
            </span>
          )}
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 bg-primary-500 text-white p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary-600 transform translate-y-2 group-hover:translate-y-0"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
        
        <div className="space-y-2">
          <p className="text-dark-400 text-sm">{product.category?.name || 'Uncategorized'}</p>
          <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={14}
                className={i < Math.floor(product.avgRating || 0) ? 'fill-primary-500 text-primary-500' : 'text-dark-600'}
              />
            ))}
            <span className="text-dark-400 text-sm ml-1">({product.reviewCount || 0})</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-white">${product.price?.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-dark-500 line-through text-sm">${product.compareAtPrice?.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

