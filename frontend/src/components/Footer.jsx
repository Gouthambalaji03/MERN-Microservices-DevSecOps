import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi'

function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-dark-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="font-display font-bold text-xl text-white">ShopNex</span>
            </div>
            <p className="text-dark-400 text-sm">
              A production-grade microservices e-commerce platform built with MERN stack and Kubernetes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-dark-400 hover:text-primary-500 transition-colors">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-dark-400 hover:text-primary-500 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-dark-400 hover:text-primary-500 transition-colors">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-dark-400 hover:text-primary-500 transition-colors">
                <FiMail size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-dark-400 hover:text-white transition-colors text-sm">All Products</Link></li>
              <li><Link to="/products?category=electronics" className="text-dark-400 hover:text-white transition-colors text-sm">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="text-dark-400 hover:text-white transition-colors text-sm">Clothing</Link></li>
              <li><Link to="/products?featured=true" className="text-dark-400 hover:text-white transition-colors text-sm">Featured</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Account</h4>
            <ul className="space-y-2">
              <li><Link to="/profile" className="text-dark-400 hover:text-white transition-colors text-sm">Profile</Link></li>
              <li><Link to="/orders" className="text-dark-400 hover:text-white transition-colors text-sm">Orders</Link></li>
              <li><Link to="/cart" className="text-dark-400 hover:text-white transition-colors text-sm">Cart</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Tech Stack</h4>
            <ul className="space-y-2 text-sm text-dark-400">
              <li>React + Vite</li>
              <li>Node.js + Express</li>
              <li>MongoDB</li>
              <li>Kubernetes</li>
              <li>Docker</li>
              <li>GitHub Actions</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-dark-500 text-sm">
            © 2024 ShopNex. DevSecOps Microservices Demo.
          </p>
          <p className="text-dark-500 text-sm mt-2 md:mt-0">
            Built with ❤️ for learning
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

