// src/lib/exportMultipleChartsToPdf.js
// NOTE: No top-level DOM libs imported here

/**
 * Export all .custom-chart elements to a multi-page PDF (client-only).
 */
export async function exportMultipleChartsToPdf(pdfName, offLoading) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('exportMultipleChartsToPdf must run in the browser.');
  }

  // Lazy-load browser-only deps so SSR never evaluates them
  const [{ default: JsPDF }, mod] = await Promise.all([
    import('jspdf'),
    import('dom-to-image-more'),
  ]);
  const domtoimage = mod.default || mod;

  const doc = new JsPDF('p', 'px', 'a4', true);
  const elements = /** @type {HTMLCollectionOf<HTMLElement>} */ (
    document.getElementsByClassName('custom-chart')
  );

  await createPdf_domToImage({ doc, elements, domtoimage });

  if (typeof offLoading === 'function') offLoading();
  doc.save(`${pdfName}.pdf`);
}

/* ----------------- helpers ----------------- */

async function ensurePngDataUrl(dataUrlOrBlobUrl) {
  if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:image/png;base64,')) {
    return dataUrlOrBlobUrl;
  }

  if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('blob:')) {
    const blob = await (await fetch(dataUrlOrBlobUrl)).blob();
    const imgBitmap = await createImageBitmap(blob);
    const canvas = document.createElement('canvas');
    canvas.width = imgBitmap.width;
    canvas.height = imgBitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgBitmap, 0, 0);
    return canvas.toDataURL('image/png');
  }

  if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:')) {
    const img = await dataUrlToImage(dataUrlOrBlobUrl);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  }

  throw new Error('normalize: unsupported image source for PNG conversion');
}

function dataUrlToImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function createPdf_domToImage({ doc, elements, domtoimage }) {
  const padding = 20;
  const marginTop = 30;
  let top = marginTop;

  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch { }
  }

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const availW = Math.max(1, pageW - padding * 2);

  for (let i = 0; i < elements.length; i++) {
    const el = elements.item(i);
    if (!el) continue;

    const srcW = Math.max(1, el.offsetWidth);
    const srcH = Math.max(1, el.offsetHeight);

    let imgData;
    try {
      imgData = await domtoimage.toPng(el, {
        quality: 2,
        cacheBust: true,
        bgcolor: '#ffffff',
        width: srcW,
        height: srcH,
        style: { width: `${srcW}px`, height: `${srcH}px` },
      });
    } catch {
      const jpeg = await domtoimage.toJpeg(el, {
        quality: 2,
        cacheBust: true,
        width: srcW,
        height: srcH,
        style: { width: `${srcW}px`, height: `${srcH}px` },
        bgcolor: '#ffffff',
      });
      imgData = await ensurePngDataUrl(jpeg);
    }

    imgData = await ensurePngDataUrl(imgData);

    const scale = Math.min(1, availW / srcW);
    const drawW = Math.max(1, Math.round(srcW * scale));
    const drawH = Math.max(1, Math.round(srcH * scale));

    if (top + drawH > pageH - 30) {
      doc.addPage();
      top = marginTop;
    }

    const y = i === 0 ? 5 : i === 1 ? top - 15 : i === elements.length - 1 ? top - 15 : top - 5;
    doc.addImage(imgData, 'PNG', padding, y, drawW, drawH, `image${i}`, 'SLOW');

    top += drawH + marginTop;
  }
}
