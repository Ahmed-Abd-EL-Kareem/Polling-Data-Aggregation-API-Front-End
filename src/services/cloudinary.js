/**
 * Direct browser upload to Cloudinary (unsigned upload preset).
 * Cloud name ≠ upload preset name — both come from the Cloudinary dashboard.
 */
export async function uploadImageToCloudinary(file, { onProgress } = {}) {
  const cloudName = (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
  const uploadPreset = (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();

  if (
    !cloudName ||
    !uploadPreset ||
    cloudName === 'your_cloud_name' ||
    uploadPreset === 'your_unsigned_preset_name'
  ) {
    throw new Error('CLOUDINARY_CONFIG');
  }

  // Common mistake: using preset name as cloud name (Cloudinary often returns 401).
  if (cloudName === uploadPreset) {
    throw new Error('CLOUDINARY_CLOUD_EQUALS_PRESET');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const xhr = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
    xhr.open('POST', url);
    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable || !onProgress) return;
      onProgress(Math.round((evt.loaded * 100) / evt.total));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText || '{}');
        if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
          resolve(data.secure_url);
          return;
        }
        const msg =
          data?.error?.message ||
          data?.error ||
          `Cloudinary error (${xhr.status})`;
        const err = new Error('CLOUDINARY_HTTP');
        err.status = xhr.status;
        err.cloudinaryMessage = typeof msg === 'string' ? msg : JSON.stringify(msg);
        reject(err);
      } catch (e) {
        reject(new Error('CLOUDINARY_PARSE'));
      }
    };
    xhr.onerror = () => reject(new Error('CLOUDINARY_NETWORK'));
    xhr.send(formData);
  });
}
