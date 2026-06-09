'use client';

import { useEffect, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export default function CoverImageUpload({
  value,
  onChange,
  disabled = false,
  onUploadingChange,
}) {
  const [preview, setPreview] = useState(value || '');
  const [objectUrl, setObjectUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!objectUrl) {
      setPreview(value || '');
    }
  }, [value, objectUrl]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  useEffect(() => {
    onUploadingChange?.(uploading);
  }, [onUploadingChange, uploading]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';

    if (!file) return;

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please choose a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image must be 5MB or smaller');
      return;
    }

    if (objectUrl) URL.revokeObjectURL(objectUrl);

    const localPreview = URL.createObjectURL(file);
    setObjectUrl(localPreview);
    setPreview(localPreview);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/uploads/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onChange(res.data.data.imageUrl);
      toast.success('Cover image uploaded');
    } catch (err) {
      setPreview(value || '');
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl('');
    setPreview('');
    onChange('');
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink-700">Cover image</label>

      <div className="overflow-hidden rounded-2xl border border-surface-200 bg-white">
        {preview ? (
          <div className="relative aspect-[16/9] bg-surface-100">
            <img src={preview} alt="Event cover preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={handleRemove}
              disabled={disabled || uploading}
              className="absolute right-3 top-3 rounded-xl bg-white/90 p-2 text-ink-700 shadow-card transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Remove cover image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <label className="flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-3 bg-surface-50 px-4 text-center transition-colors hover:bg-surface-100">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
              <ImagePlus size={22} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-ink-900">Upload a cover image</span>
              <span className="mt-1 block text-xs text-ink-500">JPG, PNG, or WebP. Max 5MB.</span>
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              className="sr-only"
            />
          </label>
        )}

        {preview && (
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <label className="btn-secondary cursor-pointer text-xs">
              Replace image
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={disabled || uploading}
                className="sr-only"
              />
            </label>

            {uploading && (
              <span className="flex items-center gap-2 text-xs font-semibold text-ink-500">
                <Loader2 size={14} className="animate-spin" />
                Uploading
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
