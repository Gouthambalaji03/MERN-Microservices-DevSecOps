import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import { FiUser, FiMail, FiShield, FiPackage, FiSettings } from 'react-icons/fi'

function Profile() {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Account</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="card text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl font-bold text-white">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white">{user.name}</h2>
            <p className="text-dark-400">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-500/10 text-primary-400 text-sm rounded-full">
              {user.role}
            </span>
          </div>

          <nav className="mt-6 space-y-2">
            <Link to="/profile" className="flex items-center space-x-3 px-4 py-3 bg-primary-500/10 text-primary-400 rounded-xl">
              <FiUser />
              <span>Profile</span>
            </Link>
            <Link to="/orders" className="flex items-center space-x-3 px-4 py-3 text-dark-300 hover:bg-dark-800 rounded-xl transition-colors">
              <FiPackage />
              <span>Orders</span>
            </Link>
            <button className="flex items-center space-x-3 px-4 py-3 text-dark-300 hover:bg-dark-800 rounded-xl transition-colors w-full text-left">
              <FiSettings />
              <span>Settings</span>
            </button>
          </nav>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FiUser className="text-primary-500" />
              <span>Personal Information</span>
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue={user.name}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">Email</label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="input-field"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">Phone</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  className="input-field"
                />
              </div>
            </div>
            
            <button className="btn-primary mt-6">Save Changes</button>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FiMail className="text-primary-500" />
              <span>Shipping Address</span>
            </h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm text-dark-400 mb-1">Street Address</label>
                <input
                  type="text"
                  placeholder="123 Main Street"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">City</label>
                <input
                  type="text"
                  placeholder="New York"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">State</label>
                <input
                  type="text"
                  placeholder="NY"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">ZIP Code</label>
                <input
                  type="text"
                  placeholder="10001"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">Country</label>
                <input
                  type="text"
                  placeholder="United States"
                  className="input-field"
                />
              </div>
            </div>
            
            <button className="btn-primary mt-6">Save Address</button>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
              <FiShield className="text-primary-500" />
              <span>Security</span>
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-dark-400 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-dark-400 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
            </div>
            
            <button className="btn-primary mt-6">Update Password</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile

