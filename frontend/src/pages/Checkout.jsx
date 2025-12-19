import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Navigate, useNavigate } from 'react-router-dom'
import { FiCreditCard, FiTruck, FiShield } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { clearCart } from '../store/slices/cartSlice'
import api from '../services/api'

function Checkout() {
  const { user } = useSelector((state) => state.auth)
  const { items, total } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  })

  if (!user) {
    return <Navigate to="/login" />
  }

  if (items.length === 0) {
    return <Navigate to="/cart" />
  }

  const shipping = total > 100 ? 0 : 10
  const tax = total * 0.08
  const grandTotal = total + shipping + tax

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderData = {
        userId: user.id,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress,
        paymentMethod: 'card'
      }

      await api.post('/orders', orderData)
      
      dispatch(clearCart())
      toast.success('Order placed successfully!')
      navigate('/orders')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FiTruck className="text-primary-500" />
                <span>Shipping Address</span>
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm text-dark-400 mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-dark-400 mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <FiCreditCard className="text-primary-500" />
                <span>Payment Method</span>
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 bg-dark-800 rounded-xl cursor-pointer border-2 border-primary-500">
                  <input type="radio" name="payment" defaultChecked className="text-primary-500" />
                  <div className="flex-1">
                    <p className="font-medium text-white">Credit / Debit Card</p>
                    <p className="text-dark-400 text-sm">Pay securely with Stripe</p>
                  </div>
                  <FiCreditCard className="text-dark-400" size={24} />
                </label>

                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm text-dark-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">Expiry Date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-dark-400 mb-1">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h3 className="font-semibold text-white text-lg mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-dark-800 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{item.name}</p>
                      <p className="text-dark-400 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-700 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Subtotal</span>
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
                <div className="border-t border-dark-700 pt-2 mt-2">
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-bold text-white">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-6 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay $${grandTotal.toFixed(2)}`}
              </button>

              <div className="mt-4 flex items-center justify-center space-x-2 text-dark-400 text-sm">
                <FiShield size={16} />
                <span>Secure checkout powered by Stripe</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default Checkout

