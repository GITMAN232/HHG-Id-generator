/**
 * Resizes an image file or data URL to a maximum dimension (default 1024px)
 * to prevent high-res phone photos from degrading WebGL rendering performance.
 */
export async function optimizeImageDataUrl(
  inputUrl: string,
  maxDimension: number = 1024
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.naturalWidth || img.width;
      let height = img.naturalHeight || img.height;

      if (width <= maxDimension && height <= maxDimension) {
        resolve(inputUrl);
        return;
      }

      if (width > height) {
        if (width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        }
      } else {
        if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(inputUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      const optimizedUrl = canvas.toDataURL('image/jpeg', 0.88);
      resolve(optimizedUrl);
    };
    img.onerror = () => {
      resolve(inputUrl);
    };
    img.src = inputUrl;
  });
}
