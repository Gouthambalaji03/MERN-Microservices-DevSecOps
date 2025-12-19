import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi'
import { removeFromCart, updateQuantity, clearCart } from '../store/slices/cartSlice'

function Cart() {
  const dispatch = useDispatch()
  const { items, total } = useSelector((state) => state.cart)
  const { user } = useSelector((state) => state.auth)

  const shipping = total > 100 ? 0 : 10
  const tax = total * 0.08
  const grandTotal = total + shipping + tax

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiShoppingBag size={40} className="text-dark-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
        <p className="text-dark-400 mb-8">Looks like you haven't added anything yet</p>
        <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
          <span>Start Shopping</span>
          <FiArrowRight />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Shopping Cart</h1>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-dark-400 hover:text-red-500 transition-colors text-sm"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productId} className="card flex items-center space-x-4">
              <div className="w-24 h-24 bg-dark-800 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-primary-500 font-semibold mt-1">${item.price?.toFixed(2)}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center bg-dark-800 rounded-lg">
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
                    className="p-2 text-dark-400 hover:text-white transition-colors"
                  >
                    <FiMinus size={16} />
                  </button>
                  <span className="w-8 text-center text-white text-sm">{item.quantity}</span>
                  <button
                    onClick={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
                    className="p-2 text-dark-400 hover:text-white transition-colors"
                  >
                    <FiPlus size={16} />
                  </button>
                </div>
                
                <button
                  onClick={() => dispatch(removeFromCart(item.productId))}
                  className="p-2 text-dark-400 hover:text-red-500 transition-colors"
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-white">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h3 className="font-semibold text-white text-lg mb-4">Order Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-dark-400">Subtotal ({items.length} items)</span>
                <span className="text-white">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Shipping</span>
                <span className="text-white">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dark-400">Tax</span>
                <span className="text-white">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-dark-700 pt-3 mt-3">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-white">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {total < 100 && (
              <p className="text-dark-400 text-sm mt-4 p-3 bg-dark-800 rounded-lg">
                Add ${(100 - total).toFixed(2)} more for free shipping!
              </p>
            )}

            {user ? (
              <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center space-x-2">
                <span>Proceed to Checkout</span>
                <FiArrowRight />
              </Link>
            ) : (
              <Link to="/login" className="btn-primary w-full mt-6 flex items-center justify-center space-x-2">
                <span>Login to Checkout</span>
                <FiArrowRight />
              </Link>
            )}
            
            <Link to="/products" className="block text-center text-dark-400 hover:text-white transition-colors mt-4 text-sm">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart

