import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: JSON.parse(localStorage.getItem('cart')) || [],
  total: 0,
}

const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    ...initialState,
    total: calculateTotal(initialState.items),
  },
  reducers: {
    addToCart: (state, action) => {
      const existingItem = state.items.find(item => item.productId === action.payload.productId)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1
      } else {
        state.items.push({ ...action.payload, quantity: action.payload.quantity || 1 })
      }
      state.total = calculateTotal(state.items)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter(item => item.productId !== action.payload)
      state.total = calculateTotal(state.items)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    updateQuantity: (state, action) => {
      const item = state.items.find(item => item.productId === action.payload.productId)
      if (item) {
        item.quantity = action.payload.quantity
        if (item.quantity <= 0) {
          state.items = state.items.filter(i => i.productId !== action.payload.productId)
        }
      }
      state.total = calculateTotal(state.items)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },
    clearCart: (state) => {
      state.items = []
      state.total = 0
      localStorage.removeItem('cart')
    },
  },
})

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer

