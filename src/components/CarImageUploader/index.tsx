import { useState, type ChangeEvent, type DragEvent } from 'react'
import { FiLoader, FiUpload, FiX } from 'react-icons/fi'

export interface ImageItemProps {
  uid: string
  name: string
  previewUrl: string
  url: string
}

interface CarImageUploaderProps {
  images: ImageItemProps[]
  uploadingIds: string[]
  onFilesSelected: (files: FileList | null) => void
  onRemoveImage: (image: ImageItemProps) => void
}

export function CarImageUploader({
  images,
  uploadingIds,
  onFilesSelected,
  onRemoveImage,
}: CarImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    onFilesSelected(event.dataTransfer.files)
  }

  return (
    <div className="mb-6 flex w-full flex-col gap-4 rounded-lg bg-white p-4">
      <label
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-colors ${
          isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
        }`}
      >
        <FiUpload size={28} className="text-gray-400" />
        <span className="px-4 text-center text-sm text-gray-500">
          Arraste as imagens aqui ou clique para selecionar
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event: ChangeEvent<HTMLInputElement>) => onFilesSelected(event.target.files)}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.uid} className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100">
              <img src={image.previewUrl} alt="Pré-visualização" className="h-full w-full object-cover" />

              {uploadingIds.includes(image.uid) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <FiLoader size={22} className="animate-spin text-white" />
                </div>
              )}

              <button
                type="button"
                onClick={() => onRemoveImage(image)}
                className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500 shadow hover:bg-red-50"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
