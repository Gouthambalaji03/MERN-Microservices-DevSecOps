import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../services/api'

const initialState = {
  products: [],
  product: null,
  categories: [],
  featured: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  },
}

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const response = await api.get('/products', { params })
    return response.data.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch products')
  }
})

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/products/${id}`)
    return response.data.data.product
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch product')
  }
})

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/categories')
    return response.data.data.categories
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories')
  }
})

export const fetchFeatured = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/products/featured')
    return response.data.data.products
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch featured products')
  }
})

export const searchProducts = createAsyncThunk('products/search', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/search', { params })
    return response.data.data
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Search failed')
  }
})

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearProduct: (state) => {
      state.product = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false
        state.product = action.payload
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload
      })
      .addCase(searchProducts.pending, (state) => {
        state.loading = true
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { clearProduct } = productSlice.actions
export default productSlice.reducer

