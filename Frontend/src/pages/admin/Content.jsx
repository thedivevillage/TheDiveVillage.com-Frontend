import LazyVideo from '../../components/LazyVideo'
import { useState, useEffect, useCallback } from 'react'
import SectionReveal from '../../components/SectionReveal'
import { contentService } from '../../services/contentService'
import CloudinaryUploadWidget from '../../components/admin/CloudinaryUploadWidget'
import {
  HelpCircle,
  Image as ImageIcon,
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Film,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default function AdminContent() {
  const [activeTab, setActiveTab] = useState('faq') // 'faq' | 'gallery'

  // FAQ State
  const [faqs, setFaqs] = useState([])
  const [faqLoading, setFaqLoading] = useState(true)
  const [faqSearch, setFaqSearch] = useState('')
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('ALL')
  const [faqModalOpen, setFaqModalOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState(null)

  const [faqFormData, setFaqFormData] = useState({
    id: '',
    question: '',
    answer: '',
    category: 'General',
    displayOrder: 0,
    isActive: true,
  })

  // Gallery State
  const [gallery, setGallery] = useState([])
  const [galleryLoading, setGalleryLoading] = useState(true)
  const [gallerySearch, setGallerySearch] = useState('')
  const [galleryTypeFilter, setGalleryTypeFilter] = useState('ALL') // 'ALL' | 'IMAGE' | 'VIDEO'
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [editingGallery, setEditingGallery] = useState(null)

  const [galleryFormData, setGalleryFormData] = useState({
    id: '',
    title: '',
    src: '',
    thumbnail: '',
    mediaType: 'IMAGE',
    category: 'Underwater',
    location: '',
    displayOrder: 0,
    isActive: true,
  })

  // Alert State
  const [notification, setNotification] = useState(null)

  const showToast = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  // -------------------------------------------------------------
  // FAQ FETCH & HANDLERS
  // -------------------------------------------------------------
  const fetchFaqs = useCallback(async () => {
    setFaqLoading(true)
    try {
      const res = await contentService.getFaqs({ includeInactive: true })
      const data = res.data?.data
      const list = Array.isArray(data) ? data : (Array.isArray(data?.faqs) ? data.faqs : [])
      setFaqs(list)
    } catch (err) {
      console.error('Failed to fetch FAQs:', err)
      showToast('error', 'Failed to load FAQs')
    } finally {
      setFaqLoading(false)
    }
  }, [])

  // -------------------------------------------------------------
  // GALLERY FETCH & HANDLERS
  // -------------------------------------------------------------
  const fetchGallery = useCallback(async () => {
    setGalleryLoading(true)
    try {
      const res = await contentService.getGallery({ includeInactive: true })
      const data = res.data?.data
      const list = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : [])
      setGallery(list)
    } catch (err) {
      console.error('Failed to fetch Gallery:', err)
      showToast('error', 'Failed to load Gallery items')
    } finally {
      setGalleryLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFaqs()
    fetchGallery()
  }, [fetchFaqs, fetchGallery])

  // FAQ Modal Handlers
  const handleOpenFaqModal = (faq = null) => {
    if (faq) {
      setEditingFaq(faq)
      setFaqFormData({
        id: faq.id || '',
        question: faq.question || '',
        answer: faq.answer || '',
        category: faq.category || 'General',
        displayOrder: faq.sortOrder !== undefined ? faq.sortOrder : (faq.displayOrder || 0),
        isActive: faq.isActive ?? true,
      })
    } else {
      setEditingFaq(null)
      setFaqFormData({
        id: '',
        question: '',
        answer: '',
        category: 'General',
        displayOrder: faqs.length + 1,
        isActive: true,
      })
    }
    setFaqModalOpen(true)
  }

  const handleSaveFaq = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        ...faqFormData,
        sortOrder: faqFormData.displayOrder,
      }
      await contentService.upsertFaq(payload)
      showToast('success', editingFaq ? 'FAQ updated successfully!' : 'FAQ created successfully!')
      setFaqModalOpen(false)
      fetchFaqs()
    } catch (err) {
      console.error('Save FAQ Error:', err)
      showToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to save FAQ')
    }
  }

  const handleToggleFaqActive = async (faq) => {
    try {
      const payload = {
        ...faq,
        sortOrder: faq.sortOrder !== undefined ? faq.sortOrder : faq.displayOrder,
        isActive: !faq.isActive,
      }
      await contentService.upsertFaq(payload)
      showToast('success', `FAQ ${!faq.isActive ? 'activated' : 'deactivated'}`)
      fetchFaqs()
    } catch (err) {
      console.error('Toggle FAQ error:', err)
      showToast('error', 'Failed to update FAQ status')
    }
  }

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return
    try {
      await contentService.deleteFaq(id)
      showToast('success', 'FAQ deleted')
      fetchFaqs()
    } catch (err) {
      console.error('Delete FAQ error:', err)
      showToast('error', 'Failed to delete FAQ')
    }
  }

  // Gallery Modal Handlers
  const handleOpenGalleryModal = (item = null) => {
    if (item) {
      setEditingGallery(item)
      setGalleryFormData({
        id: item.id || '',
        title: item.title || '',
        src: item.src || '',
        thumbnail: item.thumbnail || '',
        mediaType: (item.type || item.mediaType || 'IMAGE').toUpperCase(),
        category: item.category || 'Underwater',
        location: item.location || '',
        displayOrder: item.sortOrder !== undefined ? item.sortOrder : (item.displayOrder || 0),
        isActive: item.isActive ?? true,
      })
    } else {
      setEditingGallery(null)
      setGalleryFormData({
        id: '',
        title: '',
        src: '',
        thumbnail: '',
        mediaType: 'IMAGE',
        category: 'Underwater',
        location: '',
        displayOrder: gallery.length + 1,
        isActive: true,
      })
    }
    setGalleryModalOpen(true)
  }

  const handleSaveGallery = async (e) => {
    e.preventDefault()
    if (!galleryFormData.src) {
      showToast('error', 'Please provide an image/video URL or upload a file')
      return
    }

    try {
      const payload = {
        ...galleryFormData,
        type: (galleryFormData.mediaType || 'IMAGE').toLowerCase(),
        sortOrder: galleryFormData.displayOrder,
      }
      await contentService.upsertGalleryItem(payload)
      showToast('success', editingGallery ? 'Gallery item updated!' : 'Gallery item added!')
      setGalleryModalOpen(false)
      fetchGallery()
    } catch (err) {
      console.error('Save Gallery Error:', err)
      showToast('error', err.response?.data?.message || err.response?.data?.error || 'Failed to save Gallery item')
    }
  }

  const handleToggleGalleryActive = async (item) => {
    try {
      const payload = {
        ...item,
        type: (item.type || item.mediaType || 'image').toLowerCase(),
        sortOrder: item.sortOrder !== undefined ? item.sortOrder : item.displayOrder,
        isActive: !item.isActive,
      }
      await contentService.upsertGalleryItem(payload)
      showToast('success', `Media ${!item.isActive ? 'published' : 'hidden'}`)
      fetchGallery()
    } catch (err) {
      console.error('Toggle Gallery error:', err)
      showToast('error', 'Failed to update media status')
    }
  }


  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return
    try {
      await contentService.deleteGalleryItem(id)
      showToast('success', 'Media item deleted')
      fetchGallery()
    } catch (err) {
      console.error('Delete Gallery error:', err)
      showToast('error', 'Failed to delete media item')
    }
  }

  // Filtered lists
  const faqCategories = Array.from(new Set(faqs.map((f) => f.category || 'General')))

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqSearch.toLowerCase())
    const matchesCat = faqCategoryFilter === 'ALL' || faq.category === faqCategoryFilter
    return matchesSearch && matchesCat
  })

  const filteredGallery = gallery.filter((item) => {
    const matchesSearch =
      (item.title || '').toLowerCase().includes(gallerySearch.toLowerCase()) ||
      (item.location || '').toLowerCase().includes(gallerySearch.toLowerCase())
    const itemType = (item.type || item.mediaType || 'IMAGE').toUpperCase()
    const matchesType = galleryTypeFilter === 'ALL' || itemType === galleryTypeFilter
    return matchesSearch && matchesType
  })

  return (
    <SectionReveal className="antialiased">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg border shadow-lg transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white border border-gray-200/90 p-6 rounded-2xl shadow-xs">
        <div>
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-0.5">Content Management</span>
          <h1 className="text-2xl font-bold text-slate-900">Site Content & CMS</h1>
          <p className="mt-0.5 text-slate-500 text-xs sm:text-sm">
            Manage FAQs and Gallery media assets visible on the public website.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            FAQs ({faqs.length})
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Gallery ({gallery.length})
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FAQ TAB CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'faq' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all shadow-2xs"
                />
              </div>

              {/* Category Filter */}
              <select
                value={faqCategoryFilter}
                onChange={(e) => setFaqCategoryFilter(e.target.value)}
                className="w-full sm:w-48 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-slate-900 transition-all cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Categories</option>
                {faqCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleOpenFaqModal()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add FAQ
            </button>
          </div>

          {/* FAQ List */}
          {faqLoading ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">Loading FAQs...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
              No FAQs found.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className={`bg-white border rounded-xl p-4 sm:p-5 shadow-xs transition-all ${
                    faq.isActive ? 'border-gray-200' : 'border-rose-200 bg-rose-50/20 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-gray-200">
                          {faq.category || 'General'}
                        </span>
                        <span className="text-xs text-slate-400">Order: {faq.displayOrder}</span>
                        {!faq.isActive && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{faq.question}</h3>
                      <p className="mt-1 text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleToggleFaqActive(faq)}
                        title={faq.isActive ? 'Hide on Public Site' : 'Publish to Public Site'}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          faq.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 border-gray-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {faq.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenFaqModal(faq)}
                        className="p-1.5 bg-white border border-gray-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-all cursor-pointer shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteFaq(faq.id)}
                        className="p-1.5 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* GALLERY TAB CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search media title or location..."
                  value={gallerySearch}
                  onChange={(e) => setGallerySearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-all shadow-2xs"
                />
              </div>

              {/* Media Type Filter */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setGalleryTypeFilter('ALL')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    galleryTypeFilter === 'ALL'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({gallery.length})
                </button>
                <button
                  onClick={() => setGalleryTypeFilter('IMAGE')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    galleryTypeFilter === 'IMAGE'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Images ({gallery.filter((g) => (g.type || g.mediaType || 'IMAGE').toUpperCase() === 'IMAGE').length})
                </button>
                <button
                  onClick={() => setGalleryTypeFilter('VIDEO')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    galleryTypeFilter === 'VIDEO'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Videos ({gallery.filter((g) => (g.type || g.mediaType || '').toUpperCase() === 'VIDEO').length})
                </button>
              </div>
            </div>

            <button
              onClick={() => handleOpenGalleryModal()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Media
            </button>
          </div>

          {/* Gallery Media Grid */}
          {galleryLoading ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">Loading Gallery...</div>
          ) : filteredGallery.length === 0 ? (
            <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-gray-200 shadow-xs">
              No media items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredGallery.map((item) => (
                <div
                  key={item.id}
                  className={`group bg-white border rounded-xl overflow-hidden shadow-xs transition-all flex flex-col justify-between ${
                    item.isActive ? 'border-gray-200 hover:border-gray-300' : 'border-rose-200 opacity-70'
                  }`}
                >
                  {/* Media Preview Thumbnail */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    {(item.type || item.mediaType || '').toLowerCase() === 'video' ? (
                      <LazyVideo
                        src={item.src}
                        poster={item.thumbnail || undefined}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => e.currentTarget.pause()}
                      />
                    ) : (
                      <img
                        src={item.src}
                        alt={item.title || 'Gallery item'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}

                    {/* Media Type Badge */}
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                      {(item.type || item.mediaType || '').toLowerCase() === 'video' ? (
                        <>
                          <Film className="w-3 h-3 text-amber-300" /> Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-3 h-3 text-blue-300" /> Image
                        </>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => handleToggleGalleryActive(item)}
                        className={`p-1 rounded-md border backdrop-blur-xs transition-all cursor-pointer ${
                          item.isActive
                            ? 'bg-emerald-600 text-white border-emerald-500'
                            : 'bg-rose-600 text-white border-rose-500'
                        }`}
                      >
                        {item.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                        {item.title || 'Untitled Media'}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{item.location || 'Dive Village'}</span>
                        <span className="text-slate-400">Order: {item.displayOrder}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between gap-1.5 mt-3 pt-2.5 border-t border-gray-100">
                      <button
                        onClick={() => handleOpenGalleryModal(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-1 bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(item.id)}
                        className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* FAQ MODAL */}
      {/* ========================================================================= */}
      {faqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-xl p-6 shadow-xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
              </h2>
              <button
                onClick={() => setFaqModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={faqFormData.question}
                  onChange={(e) => setFaqFormData({ ...faqFormData, question: e.target.value })}
                  placeholder="e.g. Do I need previous diving certification?"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">
                  Answer *
                </label>
                <textarea
                  required
                  rows={4}
                  value={faqFormData.answer}
                  onChange={(e) => setFaqFormData({ ...faqFormData, answer: e.target.value })}
                  placeholder="Detailed answer text..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 resize-none font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={faqFormData.category}
                    onChange={(e) => setFaqFormData({ ...faqFormData, category: e.target.value })}
                    placeholder="General, Booking, Safety..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={faqFormData.displayOrder}
                    onChange={(e) =>
                      setFaqFormData({ ...faqFormData, displayOrder: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={faqFormData.isActive}
                    onChange={(e) =>
                      setFaqFormData({ ...faqFormData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <span className="text-xs font-semibold text-slate-700">
                  Publish on public site ({faqFormData.isActive ? 'Active' : 'Hidden'})
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFaqModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GALLERY MODAL */}
      {/* ========================================================================= */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-xl p-6 shadow-xl text-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editingGallery ? 'Edit Media Item' : 'Add Gallery Media'}
              </h2>
              <button
                onClick={() => setGalleryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">
                  Title / Caption
                </label>
                <input
                  type="text"
                  value={galleryFormData.title}
                  onChange={(e) => setGalleryFormData({ ...galleryFormData, title: e.target.value })}
                  placeholder="e.g. Scuba Diving Experience"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">
                    Media Type
                  </label>
                  <select
                    value={galleryFormData.mediaType}
                    onChange={(e) =>
                      setGalleryFormData({ ...galleryFormData, mediaType: e.target.value })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-slate-900 cursor-pointer"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={galleryFormData.location}
                    onChange={(e) =>
                      setGalleryFormData({ ...galleryFormData, location: e.target.value })
                    }
                    placeholder="e.g. Main Reef"
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                </div>
              </div>

              {/* Upload Widget & URL */}
              <div>
                <label className="block text-slate-700 mb-1">
                  Media Source URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={galleryFormData.src}
                    onChange={(e) => setGalleryFormData({ ...galleryFormData, src: e.target.value })}
                    placeholder="https://res.cloudinary.com/..."
                    className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                  <CloudinaryUploadWidget
                    onSuccess={(url) => setGalleryFormData({ ...galleryFormData, src: url })}
                  />
                </div>
              </div>

              {/* Thumbnail URL for video */}
              {galleryFormData.mediaType === 'VIDEO' && (
                <div>
                  <label className="block text-slate-700 mb-1">
                    Poster/Thumbnail Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={galleryFormData.thumbnail}
                    onChange={(e) =>
                      setGalleryFormData({ ...galleryFormData, thumbnail: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={galleryFormData.category}
                    onChange={(e) =>
                      setGalleryFormData({ ...galleryFormData, category: e.target.value })
                    }
                    placeholder="Underwater, Training, Action..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={galleryFormData.displayOrder}
                    onChange={(e) =>
                      setGalleryFormData({
                        ...galleryFormData,
                        displayOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900 font-normal"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={galleryFormData.isActive}
                    onChange={(e) =>
                      setGalleryFormData({ ...galleryFormData, isActive: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <span className="text-xs font-semibold text-slate-700">
                  Publish on gallery page ({galleryFormData.isActive ? 'Active' : 'Hidden'})
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2 bg-white border border-gray-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  Save Media Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SectionReveal>
  )
}
