import { useState } from 'react'
import api from '../../services/api'

export default function CloudinaryUploadWidget({ onSuccess, label = 'Upload' }) {
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setErrorMsg(null)

    try {
      const formData = new FormData()
      formData.append('files', file)

      const res = await api.post('/api/v1/uploads/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const uploadedFiles = res.data?.data?.files || []
      const uploadedFile = uploadedFiles[0]

      if (uploadedFile?.url) {
        onSuccess(uploadedFile.url, uploadedFile)
        setUploading(false)
        return
      }

      throw new Error('No upload URL returned from server')
    } catch (err) {
      console.error('Cloudinary backend upload error:', err)
      const msg = err.response?.data?.error || err.message || 'Upload failed'
      setErrorMsg(msg)
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-1 shrink-0">
      <label className="relative flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl font-semibold text-xs cursor-pointer transition-all shrink-0">
        {uploading ? (
          <>
            <svg className="w-4 h-4 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {label}
          </>
        )}
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="sr-only"
        />
      </label>
      {errorMsg && (
        <span className="text-[10px] text-red-400 font-medium px-1">{errorMsg}</span>
      )}
    </div>
  )
}

