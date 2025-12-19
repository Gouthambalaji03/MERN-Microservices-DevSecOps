import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiLogOut } from 'react-icons/fi'
import { logout } from '../store/slices/authSlice'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useSelector((state) => state.auth)
  const { items } = useSelector((state) => state.cart)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-display font-bold text-xl text-white">ShopNex</span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-dark-800/50 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-dark-300 hover:text-white transition-colors">
              Products
            </Link>
            
            <Link to="/cart" className="relative p-2 text-dark-300 hover:text-white transition-colors">
              <FiShoppingCart size={22} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-3">
                <Link to="/profile" className="flex items-center space-x-2 text-dark-300 hover:text-white transition-colors">
                  <FiUser size={20} />
                  <span className="text-sm">{user.name}</span>
                </Link>
                <button onClick={handleLogout} className="p-2 text-dark-300 hover:text-primary-500 transition-colors">
                  <FiLogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-2 px-4">
                Sign In
              </Link>
            )}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden p-2 text-dark-300">
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-dark-900 border-t border-dark-800">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-dark-400"
                />
              </div>
            </form>
            <Link to="/products" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>
              Products
            </Link>
            <Link to="/cart" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>
              Cart ({items.length})
            </Link>
            {user ? (
              <>
                <Link to="/profile" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
                <Link to="/orders" className="block text-dark-300 hover:text-white py-2" onClick={() => setIsMenuOpen(false)}>
                  Orders
                </Link>
                <button onClick={handleLogout} className="block text-primary-500 py-2">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="block text-primary-500 py-2" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

