import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionReveal from '../../components/SectionReveal'
import { productService } from '../../services/productService'
import api from '../../services/api'
import { SHOP_PRODUCTS } from '../../utils/products'

export default function AdminCatalog() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    sku: '',
    basePrice: '',
    category: 'Tops',
    description: '',
    imageUrl: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')

  const [toast, setToast] = useState(null)
  const [categoriesList, setCategoriesList] = useState(['Tops', 'Bottoms', 'Skin Wear', 'Accessories'])

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const [res, catsRes] = await Promise.allSettled([
        productService.list({ includeInactive: true, limit: 100 }),
        productService.getCategories(),
      ])
      const fetched = res.status === 'fulfilled' ? res.value?.data?.data?.products || [] : []
      if (catsRes.status === 'fulfilled') {
        const remoteCats = catsRes.value?.data?.data?.categories || []
        if (remoteCats.length > 0) {
          const names = Array.from(new Set([...remoteCats.map((c) => c.name), 'Tops', 'Bottoms', 'Skin Wear', 'Accessories']))
          setCategoriesList(names)
        }
      }
      setProducts(fetched.length > 0 ? fetched : SHOP_PRODUCTS)
    } catch {
      setProducts(SHOP_PRODUCTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData({
      title: '',
      sku: `SKU-${Date.now()}`,
      basePrice: '',
      category: categoriesList[0] || 'Tops',
      description: '',
      imageUrl: '',
      isActive: true,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p) => {
    setEditingProduct(p)
    setFormData({
      title: p.title || p.name || '',
      sku: p.sku || `SKU-${p.id}`,
      basePrice: p.basePrice || p.price || '',
      category: p.category?.name || p.category || 'Tops',
      description: p.description || '',
      imageUrl: p.mediaUrls?.[0] || p.image || '',
      isActive: p.isActive !== undefined ? p.isActive : true,
    })
    setFormError('')
    setIsModalOpen(true)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setFormError('')
    try {
      const uploadData = new FormData()
      uploadData.append('image', file)
      const res = await api.post('/api/uploads/product-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = res.data?.data?.url || res.data?.data?.secure_url
      if (url) {
        setFormData((prev) => ({ ...prev, imageUrl: url }))
        showToast('success', 'Image uploaded successfully!')
      }
    } catch {
      setFormError('Image upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.basePrice) {
      setFormError('Title and Price are required.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const payload = {
        title: formData.title.trim(),
        sku: formData.sku.trim(),
        basePrice: parseFloat(formData.basePrice),
        category: formData.category,
        description: formData.description,
        mediaUrls: formData.imageUrl ? [formData.imageUrl] : [],
        isActive: formData.isActive,
      }

      if (editingProduct?.id && !String(editingProduct.id).startsWith('product-')) {
        await productService.update(editingProduct.id, payload)
        showToast('success', 'Product updated successfully!')
      } else {
        await productService.create(payload)
        showToast('success', 'Product created successfully!')
      }
      setIsModalOpen(false)
      fetchProducts()
    } catch (err) {
      setFormError(err.response?.data?.error || err.response?.data?.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (p) => {
    try {
      if (String(p.id).startsWith('product-')) {
        setProducts((prev) =>
          prev.map((item) => (item.id === p.id ? { ...item, isActive: !item.isActive } : item))
        )
        showToast('success', `Product status toggled.`)
        return
      }
      await productService.update(p.id, { isActive: !p.isActive })
      showToast('success', `Product ${!p.isActive ? 'activated' : 'deactivated'}.`)
      fetchProducts()
    } catch {
      showToast('error', 'Failed to update product status.')
    }
  }

  const handleDeleteProduct = async (p) => {
    if (!window.confirm(`Are you sure you want to delete "${p.title || p.name}"?`)) return
    try {
      if (String(p.id).startsWith('product-')) {
        setProducts((prev) => prev.filter((item) => item.id !== p.id))
        showToast('success', 'Product removed.')
        return
      }
      await productService.remove(p.id)
      showToast('success', 'Product removed successfully.')
      fetchProducts()
    } catch {
      showToast('error', 'Failed to delete product.')
    }
  }

  const filteredProducts = products.filter((p) => {
    const title = (p.title || p.name || '').toLowerCase()
    const cat = (p.category?.name || p.category || '').toLowerCase()
    const matchesSearch = title.includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || cat === selectedCategory.toLowerCase()
    return matchesSearch && matchesCategory
  })

  return (
    <SectionReveal>
      <div className="space-y-6 relative">

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border shadow-lg transition-all ${
              toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/90 p-6 rounded-2xl shadow-xs">
          <div>
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-0.5">Catalog Management</span>
            <h1 className="text-2xl font-bold text-slate-900">Products ({products.length})</h1>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg font-semibold text-xs hover:bg-slate-800 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ Add New Product</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search by title or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition shadow-2xs"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 transition cursor-pointer shadow-2xs"
          >
            <option value="all">All Categories</option>
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-medium">Loading catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
            <p className="text-sm font-bold text-slate-900 mb-1">No products found</p>
            <p className="text-xs text-slate-500">No items match your search filter.</p>
          </div>
        ) : (
          /* Products Table Grid */
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm text-slate-800">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Product</th>
                  <th className="px-6 py-3.5 font-bold">Category</th>
                  <th className="px-6 py-3.5 font-bold">Price</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((p) => {
                  const title = p.title || p.name
                  const price = p.basePrice || p.price
                  const cat = p.category?.name || p.category || 'Merchandise'
                  const img = p.mediaUrls?.[0] || p.image
                  const isActive = p.isActive !== false

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4 flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-lg bg-slate-50 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                          {img ? (
                            <img src={img} alt={title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-[10px] font-bold text-slate-400">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{title}</p>
                          <p className="text-xs text-slate-400 font-mono">SKU: {p.sku || p.id}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700 border border-gray-200">
                          {cat}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-900">
                        ₹{Number(price).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-3 py-1 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-xs hover:bg-rose-100 transition cursor-pointer shadow-2xs"
                          title="Delete / Deactivate Product"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Add / Edit Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-lg w-full text-slate-900 shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
                </div>

                <form onSubmit={handleSave} className="space-y-3.5 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-700 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-slate-900 text-xs sm:text-sm font-normal"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 mb-1">Price (₹)</label>
                      <input
                        type="number"
                        required
                        value={formData.basePrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, basePrice: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-slate-900 text-xs sm:text-sm font-normal"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-slate-800 outline-none focus:border-slate-900 text-xs cursor-pointer"
                      >
                        {categoriesList.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Description</label>
                    <textarea
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-white border border-gray-300 rounded-lg p-2.5 text-slate-900 outline-none focus:border-slate-900 text-xs font-normal"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1">Product Image</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-gray-300 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 cursor-pointer"
                      />
                      {uploading && <span className="text-slate-500 text-xs">Uploading...</span>}
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-2 w-14 h-14 rounded-lg border border-gray-200 overflow-hidden">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {formError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving || uploading}
                      className="px-4 py-2 rounded-lg bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving...' : 'Save Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </SectionReveal>
  )
}
