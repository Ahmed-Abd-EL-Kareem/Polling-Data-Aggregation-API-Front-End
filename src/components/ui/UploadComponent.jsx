import React, { useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImageToCloudinary } from '../../services/cloudinary';
import { Button } from './Button';
import { cn } from '../../utils/cn';

export function UploadComponent({ value, onChange, className }) {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  const resetPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed.');
      return;
    }

    resetPreview();
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setError(null);
    setIsUploading(true);
    setProgress(0);

    try {
      const url = await uploadImageToCloudinary(file, {
        onProgress: (p) => setProgress(p),
      });
      onChange?.(url);
      toast.success('Image uploaded');
    } catch (err) {
      console.error(err);
      if (err?.message === 'CLOUDINARY_CONFIG') {
        setError(
          'Set VITE_CLOUDINARY_CLOUD_NAME (cloud name from dashboard) and VITE_CLOUDINARY_UPLOAD_PRESET in .env.local'
        );
        toast.error('Cloudinary is not configured');
      } else if (err?.message === 'CLOUDINARY_CLOUD_EQUALS_PRESET') {
        setError(
          'Cloud name and upload preset must differ. Use Cloud name from the dashboard top bar (e.g. ab12cd34), not the preset name.'
        );
        toast.error('Wrong Cloud name in .env.local');
      } else if (err?.message === 'CLOUDINARY_HTTP') {
        const detail = err.cloudinaryMessage || '';
        const hint =
          err.status === 401
            ? ' Check Cloud name (short id) and unsigned preset name in Cloudinary.'
            : '';
        setError(`${detail}${hint}`);
        toast.error(err.status === 401 ? 'Cloudinary rejected upload (401)' : 'Upload failed');
      } else if (err?.message === 'CLOUDINARY_NETWORK') {
        setError('Network error — check connection.');
        toast.error('Network error');
      } else {
        setError(err?.message || 'Upload failed.');
        toast.error('Upload failed');
      }
      onChange?.('');
    } finally {
      setIsUploading(false);
    }
  };

  const clear = () => {
    onChange?.('');
    resetPreview();
    setProgress(0);
    setError(null);
  };

  const displaySrc = value || preview;

  return (
    <div className={cn('w-full', className)}>
      {!displaySrc && (
        <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 p-8 transition-colors hover:bg-surface-container-low/50">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 z-10 cursor-pointer opacity-0"
            disabled={isUploading}
          />
          <UploadCloud className="mb-4 h-10 w-10 text-on-surface-variant" />
          <p className="text-sm font-medium text-on-surface">Click or drag image to upload</p>
          <p className="mt-1 text-xs text-on-surface-variant">PNG, JPG, WebP — direct to Cloudinary</p>
          {isUploading && (
            <div className="mt-4 w-full max-w-xs">
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                <div
                  className="h-full bg-primary transition-[width] duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-on-surface-variant">{progress}%</p>
            </div>
          )}
          {error && <p className="mt-3 text-xs text-error">{error}</p>}
        </div>
      )}

      {displaySrc && (
        <div className="group relative h-52 w-full overflow-hidden rounded-xl border border-outline-variant/20">
          <img src={displaySrc} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
            <Button type="button" variant="destructive" size="sm" onClick={clear}>
              <X className="me-2 h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
