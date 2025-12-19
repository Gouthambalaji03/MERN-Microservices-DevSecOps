import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FiShoppingCart, FiHeart, FiShare2, FiStar, FiMinus, FiPlus, FiCheck } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { fetchProduct, clearProduct } from '../store/slices/productSlice'
import { addToCart } from '../store/slices/cartSlice'
import Loading from '../components/Loading'

function ProductDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const { product, loading } = useSelector((state) => state.products)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    dispatch(fetchProduct(id))
    return () => dispatch(clearProduct())
  }, [dispatch, id])

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images?.[0]?.url || '/placeholder.png',
        quantity
      }))
      toast.success(`Added ${quantity} item(s) to cart!`)
    }
  }

  if (loading) return <Loading />

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
        <Link to="/products" className="text-primary-500 hover:text-primary-400">
          Back to Products
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center space-x-2 text-sm text-dark-400 mb-8">
        <Link to="/" className="hover:text-white">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-white">Products</Link>
        <span>/</span>
        <span className="text-white">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-4">
          <div className="aspect-square bg-dark-800 rounded-2xl overflow-hidden">
            <img
              src={product.images?.[selectedImage]?.url || '/placeholder.png'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          {product.images?.length > 1 && (
            <div className="flex space-x-3">
              {product.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-primary-500 text-sm font-medium mb-2">{product.category?.name}</p>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    size={18}
                    className={i < Math.floor(product.avgRating || 0) ? 'fill-primary-500 text-primary-500' : 'text-dark-600'}
                  />
                ))}
              </div>
              <span className="text-dark-400">
                {product.avgRating?.toFixed(1) || '0'} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-bold text-white">${product.price?.toFixed(2)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xl text-dark-500 line-through">${product.compareAtPrice?.toFixed(2)}</span>
            )}
          </div>

          <p className="text-dark-300 leading-relaxed">{product.description}</p>

          <div className="flex items-center space-x-2">
            {product.inventory > 0 ? (
              <>
                <FiCheck className="text-green-500" />
                <span className="text-green-500">In Stock</span>
                <span className="text-dark-500">({product.inventory} available)</span>
              </>
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-dark-800 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 text-dark-400 hover:text-white transition-colors"
              >
                <FiMinus />
              </button>
              <span className="w-12 text-center text-white font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                className="p-3 text-dark-400 hover:text-white transition-colors"
              >
                <FiPlus />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={product.inventory <= 0}
              className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiShoppingCart />
              <span>Add to Cart</span>
            </button>
            
            <button className="p-3 bg-dark-800 rounded-xl text-dark-400 hover:text-primary-500 transition-colors">
              <FiHeart size={22} />
            </button>
            
            <button className="p-3 bg-dark-800 rounded-xl text-dark-400 hover:text-white transition-colors">
              <FiShare2 size={22} />
            </button>
          </div>

          {product.attributes && (
            <div className="border-t border-dark-800 pt-6 space-y-4">
              <h3 className="font-semibold text-white">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(product.attributes).map(([key, value]) => (
                  <div key={key} className="bg-dark-800/50 rounded-lg p-3">
                    <p className="text-dark-400 text-sm">{key}</p>
                    <p className="text-white">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductDetail

