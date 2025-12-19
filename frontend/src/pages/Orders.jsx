import { useSelector } from 'react-redux'
import { Link, Navigate } from 'react-router-dom'
import { FiPackage, FiTruck, FiCheck, FiClock } from 'react-icons/fi'

function Orders() {
  const { user } = useSelector((state) => state.auth)

  if (!user) {
    return <Navigate to="/login" />
  }

  const mockOrders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 259.99,
      items: 3
    },
    {
      id: 'ORD-002',
      date: '2024-01-18',
      status: 'shipped',
      total: 129.99,
      items: 2
    },
    {
      id: 'ORD-003',
      date: '2024-01-20',
      status: 'processing',
      total: 89.99,
      items: 1
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FiCheck className="text-green-500" />
      case 'shipped':
        return <FiTruck className="text-blue-500" />
      case 'processing':
        return <FiClock className="text-yellow-500" />
      default:
        return <FiPackage className="text-dark-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-400'
      case 'shipped':
        return 'bg-blue-500/10 text-blue-400'
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-400'
      default:
        return 'bg-dark-700 text-dark-400'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display text-3xl font-bold text-white mb-8">My Orders</h1>

      {mockOrders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-dark-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiPackage size={40} className="text-dark-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">No orders yet</h2>
          <p className="text-dark-400 mb-8">Start shopping to see your orders here</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-dark-800 rounded-xl flex items-center justify-center">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{order.id}</h3>
                    <p className="text-dark-400 text-sm">
                      {new Date(order.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-dark-400 text-sm">{order.items} items</p>
                    <p className="font-semibold text-white">${order.total.toFixed(2)}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  
                  <button className="btn-secondary py-2 px-4 text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Orders

