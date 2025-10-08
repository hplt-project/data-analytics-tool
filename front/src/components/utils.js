// import jsPDF from "jspdf";
// import * as htmlToImage from "html-to-image";

// export async function exportMultipleChartsToPdf(pdfName, offLoading) {
//   const doc = new jsPDF("p", "px", "a4", true); // (1)

//   const elements = document.getElementsByClassName("custom-chart"); // (2)

//   await creatPdf({ doc, elements }); // (3-5)

//   offLoading();

//   doc.save(`${pdfName}.pdf`); // (6)
// }
// async function ensurePngDataUrl(dataUrlOrBlobUrl) {
//   // If it's already a PNG DataURL -> return
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:image/png;base64,')) {
//     return dataUrlOrBlobUrl;
//   }

//   // If it's a blob: URL -> fetch it, then convert to PNG
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('blob:')) {
//     const blob = await (await fetch(dataUrlOrBlobUrl)).blob();
//     const imgBitmap = await createImageBitmap(blob);
//     const canvas = document.createElement('canvas');
//     canvas.width = imgBitmap.width;
//     canvas.height = imgBitmap.height;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(imgBitmap, 0, 0);
//     return canvas.toDataURL('image/png');
//   }

//   // If it's a data: URL (svg, jpeg, etc.), draw onto canvas then export PNG
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:')) {
//     const img = await dataUrlToImage(dataUrlOrBlobUrl);
//     const canvas = document.createElement('canvas');
//     canvas.width = img.naturalWidth || img.width;
//     canvas.height = img.naturalHeight || img.height;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0);
//     return canvas.toDataURL('image/png');
//   }

//   throw new Error('normalize: unsupported image source for PNG conversion');
// }

// function dataUrlToImage(dataUrl) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous'; // helps when the dataURL was created from CORS-safe sources
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = dataUrl;
//   });
// }

// async function creatPdf({ doc, elements }) {
//   const padding = 20;
//   const marginTop = 30;
//   let top = marginTop;

//   for (let i = 0; i < elements.length; i++) {
//     const el = elements.item(i);

//     let source;
//     try {
//       if (document.fonts?.ready) { await document.fonts.ready; }
//       const canvas = await htmlToImage.toCanvas(el, {
//         pixelRatio: 1.5,
//         cacheBust: true,
//         skipFonts: false,
//       });
//       source = canvas.toDataURL('image/png');
//     } catch (e1) {
//       try {
//         source = await htmlToImage.toPng(el, {
//           pixelRatio: 1.5,
//           cacheBust: true,
//           skipFonts: true,
//         });
//       } catch (e2) {
//         // last resort: jpeg
//         source = await htmlToImage.toJpeg(el, {
//           pixelRatio: 1.5,
//           cacheBust: true,
//           skipFonts: true,
//           quality: 0.95,
//         });
//       }
//     }

//     // Normalize (handles blob:, svg, jpeg, etc.)
//     const imgData = await ensurePngDataUrl(source);
//     let elHeight = el.offsetHeight;
//     let elWidth = el.offsetWidth;

//     const pageWidth = doc.internal.pageSize.getWidth();

//     if (elWidth > pageWidth) {
//       const ratio = pageWidth / elWidth;
//       elHeight = elHeight * ratio - padding * 2;
//       elWidth = elWidth * ratio - padding * 2;
//     }

//     const pageHeight = doc.internal.pageSize.getHeight();

//     if (top + elHeight > pageHeight - 30) {
//       doc.addPage();
//       top = marginTop;
//     }
//     if (i == 0) {
//       doc.addImage(
//         imgData,
//         "PNG",
//         padding,
//         5,
//         elWidth,
//         elHeight + 12,
//         `image${i}`,
//         "FAST"
//       );
//     } else if (i == 1) {
//       doc.addImage(
//         imgData,
//         "PNG",
//         padding,
//         top - 15,
//         elWidth,
//         elHeight + 32,
//         `image${i}`,
//         "FAST"
//       );
//     } else if (i == elements.length - 1) {
//       doc.addImage(
//         imgData,
//         "PNG",
//         padding,
//         top - 15,
//         elWidth,
//         elHeight + 26,
//         `image${i}`,
//         "FAST"
//       );
//     } else {
//       doc.addImage(
//         imgData,
//         "PNG",
//         padding,
//         top - 5,
//         elWidth,
//         elHeight + 28,
//         `image${i}`,
//         "FAST"
//       );
//     }

//     top += elHeight + marginTop + 5;
//   }
// }


//////////////////////77
// import jsPDF from "jspdf";
// import * as domtoimage from "dom-to-image-more";

// /** Keep your helpers if you want; dom-to-image-more.toPng already returns a PNG dataURL */
// async function ensurePngDataUrl(dataUrlOrBlobUrl) {
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:image/png;base64,')) {
//     return dataUrlOrBlobUrl;
//   }
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:')) {
//     // convert any non-png dataURL to PNG via canvas
//     const img = await dataUrlToImage(dataUrlOrBlobUrl);
//     const c = document.createElement('canvas');
//     c.width = img.naturalWidth || img.width;
//     c.height = img.naturalHeight || img.height;
//     c.getContext('2d').drawImage(img, 0, 0);
//     return c.toDataURL('image/png');
//   }
//   throw new Error('normalize: unsupported image source for PNG conversion');
// }

// function dataUrlToImage(dataUrl) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = dataUrl;
//   });
// }

// export async function exportMultipleChartsToPdf(pdfName, offLoading) {
//   const doc = new jsPDF("p", "px", "a4", true);

//   const elements = document.getElementsByClassName("custom-chart");

//   await createPdf_domToImage({ doc, elements });

//   offLoading?.();
//   doc.save(`${pdfName}.pdf`);
// }

// async function createPdf_domToImage({ doc, elements }) {
//   const padding = 20;
//   const marginTop = 30;
//   let top = marginTop;

//   // Wait for fonts to settle so layout numbers are stable
//   if (document.fonts?.ready) {
//     try { await document.fonts.ready; } catch { }
//   }

//   const pageW = doc.internal.pageSize.getWidth();
//   const pageH = doc.internal.pageSize.getHeight();
//   const availW = Math.max(1, pageW - padding * 2);

//   for (let i = 0; i < elements.length; i++) {
//     const el = elements.item(i);
//     if (!el) continue;

//     // measure source
//     const srcW = Math.max(1, el.offsetWidth);
//     const srcH = Math.max(1, el.offsetHeight);

//     // render DOM → PNG (dataURL)
//     let imgData;
//     try {
//       imgData = await domtoimage.toPng(el, {
//         // helps with FF stability
//         cacheBust: true,
//         bgcolor: "#ffffff",                 // force solid bg (no transparent “blank”)
//         width: srcW,
//         height: srcH,
//         style: { width: `${srcW}px`, height: `${srcH}px` },
//         // Optional: tiny clone-only CSS to avoid title wrapping/squeezing
//         // (dom-to-image-more supports 'style' but not onclone; inject via <style> on the element itself if needed)
//       });
//     } catch {
//       // fallback to JPEG then normalize to PNG for jsPDF
//       const jpeg = await domtoimage.toJpeg(el, {
//         quality: 0.95,
//         cacheBust: true,
//         width: srcW,
//         height: srcH,
//         style: { width: `${srcW}px`, height: `${srcH}px` },
//         bgcolor: "#ffffff",
//       });
//       imgData = await ensurePngDataUrl(jpeg);
//     }

//     // scale to page safely (no subtract-after-scale)
//     const scale = Math.min(1, availW / srcW);
//     const drawW = Math.max(1, Math.round(srcW * scale));
//     const drawH = Math.max(1, Math.round(srcH * scale));

//     // page break
//     if (top + drawH > pageH - 30) {
//       doc.addPage();
//       top = marginTop;
//     }

//     // y offsets: keep your existing logic
//     const y =
//       i === 0 ? 5 :
//         i === 1 ? top - 15 :
//           i === elements.length - 1 ? top - 15 :
//             top - 5;

//     const extraH =
//       i === 0 ? 12 :
//         i === 1 ? 32 :
//           i === elements.length - 1 ? 26 :
//             28;

//     doc.addImage(imgData, "PNG", padding, y, drawW, drawH + extraH, `image${i}`, "FAST");
//     top += drawH + marginTop + 5;
//   }
// }

/// GOOOD

// pdfExport.js
import jsPDF from "jspdf";
import * as domtoimage from "dom-to-image-more";

/**
 * Export all .custom-chart elements to a multi-page PDF.
 * - Uses dom-to-image-more for better Firefox stability.
 * - Preserves aspect ratio (no height stretching).
 * - Forces white background so PDF pages aren’t transparent/blank.
 */
export async function exportMultipleChartsToPdf(pdfName, offLoading) {
  const doc = new jsPDF("p", "px", "a4", true);

  const elements = document.getElementsByClassName("custom-chart");

  await createPdf_domToImage({ doc, elements });

  offLoading?.();
  doc.save(`${pdfName}.pdf`);
}

/* ----------------- helpers (same API you had) ----------------- */

async function ensurePngDataUrl(dataUrlOrBlobUrl) {
  // If it's already a PNG DataURL → return
  if (
    typeof dataUrlOrBlobUrl === "string" &&
    dataUrlOrBlobUrl.startsWith("data:image/png;base64,")
  ) {
    return dataUrlOrBlobUrl;
  }

  // If it's a blob: URL → fetch it, then convert to PNG
  if (
    typeof dataUrlOrBlobUrl === "string" &&
    dataUrlOrBlobUrl.startsWith("blob:")
  ) {
    const blob = await (await fetch(dataUrlOrBlobUrl)).blob();
    const imgBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = imgBitmap.width;
    canvas.height = imgBitmap.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(imgBitmap, 0, 0);
    return canvas.toDataURL("image/png");
  }

  // If it's a data: URL (svg, jpeg, etc.), draw onto canvas then export PNG
  if (
    typeof dataUrlOrBlobUrl === "string" &&
    dataUrlOrBlobUrl.startsWith("data:")
  ) {
    const img = await dataUrlToImage(dataUrlOrBlobUrl);
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
  }

  throw new Error("normalize: unsupported image source for PNG conversion");
}

function dataUrlToImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // helps when the dataURL was created from CORS-safe sources
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/* ----------------- main renderer (dom-to-image-more) ----------------- */

async function createPdf_domToImage({ doc, elements }) {
  const padding = 20; // left/right margin when placing image
  const marginTop = 30;
  let top = marginTop;

  // Wait for fonts before snapshot so measurements are stable
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch { }
  }

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const availW = Math.max(1, pageW - padding * 2); // safe usable width

  for (let i = 0; i < elements.length; i++) {
    const el = elements.item(i);
    if (!el) continue;

    // Measure source element
    const srcW = Math.max(1, el.offsetWidth);
    const srcH = Math.max(1, el.offsetHeight);

    // Render DOM → PNG (dataURL)
    let imgData;
    try {
      imgData = await domtoimage.toPng(el, {
        cacheBust: true,
        bgcolor: "#ffffff", // solid background avoids “blank-looking” transparent pages
        width: srcW,
        height: srcH,
        style: { width: `${srcW}px`, height: `${srcH}px` },
      });
    } catch {
      // Fallback to JPEG, then normalize back to PNG for jsPDF
      const jpeg = await domtoimage.toJpeg(el, {
        quality: 0.95,
        cacheBust: true,
        width: srcW,
        height: srcH,
        style: { width: `${srcW}px`, height: `${srcH}px` },
        bgcolor: "#ffffff",
      });
      imgData = await ensurePngDataUrl(jpeg);
    }

    // Ensure we hand jsPDF a valid PNG data URL
    imgData = await ensurePngDataUrl(imgData);

    // --- Preserve aspect ratio; compute draw sizes once ---
    const scale = Math.min(1, availW / srcW); // never upscale above 100%
    const drawW = Math.max(1, Math.round(srcW * scale));
    const drawH = Math.max(1, Math.round(srcH * scale)); // <-- no height stretching

    // Page break if needed
    if (top + drawH > pageH - 30) {
      doc.addPage();
      top = marginTop;
    }

    // Your existing Y-offset logic (we’ll add spacing via top, not by stretching height)
    const y =
      i === 0
        ? 5
        : i === 1
          ? top - 15
          : i === elements.length - 1
            ? top - 15
            : top - 5;

    // Optional extra spacing (applied after drawing, not by altering image height)
    const extraSpacing =
      i === 0 ? 12 : i === 1 ? 32 : i === elements.length - 1 ? 26 : 28;

    // Draw with preserved aspect ratio
    doc.addImage(imgData, "PNG", padding, y, drawW, drawH, `image${i}`, "FAST");

    // Advance cursor for next element (use spacing here, not in image height)
    top += drawH + marginTop + 5 + extraSpacing;
  }
}


///////////////////////////

// import jsPDF from "jspdf";
// import * as htmlToImage from "html-to-image";
// import html2canvas from "html2canvas";

// const isFirefox = () =>
//   typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);

// export async function exportMultipleChartsToPdf(pdfName, offLoading) {
//   const doc = new jsPDF("p", "px", "a4", true);

//   const elements = document.getElementsByClassName("custom-chart");

//   await creatPdf({ doc, elements });

//   offLoading?.();
//   doc.save(`${pdfName}.pdf`);
// }

// // ---------- your helpers (unchanged) ----------
// async function ensurePngDataUrl(dataUrlOrBlobUrl) {
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:image/png;base64,')) {
//     return dataUrlOrBlobUrl;
//   }
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('blob:')) {
//     const blob = await (await fetch(dataUrlOrBlobUrl)).blob();
//     const imgBitmap = await createImageBitmap(blob);
//     const canvas = document.createElement('canvas');
//     canvas.width = imgBitmap.width;
//     canvas.height = imgBitmap.height;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(imgBitmap, 0, 0);
//     return canvas.toDataURL('image/png');
//   }
//   if (typeof dataUrlOrBlobUrl === 'string' && dataUrlOrBlobUrl.startsWith('data:')) {
//     const img = await dataUrlToImage(dataUrlOrBlobUrl);
//     const canvas = document.createElement('canvas');
//     canvas.width = img.naturalWidth || img.width;
//     canvas.height = img.naturalHeight || img.height;
//     const ctx = canvas.getContext('2d');
//     ctx.drawImage(img, 0, 0);
//     return canvas.toDataURL('image/png');
//   }
//   throw new Error('normalize: unsupported image source for PNG conversion');
// }

// function dataUrlToImage(dataUrl) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = 'anonymous';
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = dataUrl;
//   });
// }

// // ---------- adapted renderer with safe sizing ----------
// async function creatPdf({ doc, elements }) {
//   const padding = 20;         // left/right margin when placing image
//   const marginTop = 30;
//   let top = marginTop;

//   if (document.fonts?.ready) { try { await document.fonts.ready; } catch { } }

//   const pageW = doc.internal.pageSize.getWidth();
//   const pageH = doc.internal.pageSize.getHeight();
//   const availW = Math.max(1, pageW - padding * 2);  // safe available width

//   for (let i = 0; i < elements.length; i++) {
//     const el = elements.item(i);
//     if (!el) continue;

//     // Measure source size
//     const srcW = Math.max(1, el.offsetWidth);
//     const srcH = Math.max(1, el.offsetHeight);

//     // ----- render to a canvas (FF vs others) -----
//     let source;
//     try {
//       if (isFirefox()) {
//         // FF path: ensure solid background + foreignObjectRendering
//         const ff = getComputedStyle(document.body).fontFamily || "Roboto, Inter, Arial, sans-serif";
//         const canvas = await html2canvas(el, {
//           scale: 1.5,
//           useCORS: true,
//           backgroundColor: "#ffffff",     // <-- IMPORTANT: no transparent canvas in PDF
//           logging: false,
//           foreignObjectRendering: true,
//           imageTimeout: 0,
//           removeContainer: true,
//           width: srcW,
//           height: srcH,
//           onclone: (docClone) => {
//             const s = docClone.createElement("style");
//             s.textContent = `
//               .custom-chart, .custom-chart * {
//                 font-family: ${ff} !important;
//                 -webkit-font-smoothing: antialiased;
//                 -moz-osx-font-smoothing: grayscale;
//               }
//               .custom-chart .chart-title,
//               .custom-chart h1, .custom-chart h2, .custom-chart h3 {
//                 white-space: nowrap;
//                 text-rendering: optimizeLegibility;
//               }
//             `;
//             docClone.head.appendChild(s);
//             const root = docClone.body.querySelector(".custom-chart");
//             if (root) {
//               const r = root.getBoundingClientRect();
//               root.style.width = `${Math.round(r.width)}px`;
//               root.style.height = `${Math.round(r.height)}px`;
//               root.style.maxWidth = "none";
//               root.style.boxSizing = "border-box";
//             }
//           },
//         });
//         source = canvas.toDataURL("image/png", 1.0);
//       } else {
//         // non-FF: html-to-image → canvas
//         const canvas = await htmlToImage.toCanvas(el, {
//           pixelRatio: 1.5,
//           cacheBust: true,
//           width: srcW,
//           height: srcH,
//           style: { width: `${srcW}px`, height: `${srcH}px` },
//           useCORS: true,
//           fetchRequestInit: { mode: "cors", credentials: "omit" },
//         });
//         source = canvas.toDataURL("image/png", 1.0);
//       }
//     } catch (e1) {
//       try {
//         source = await htmlToImage.toPng(el, { pixelRatio: 1.5, cacheBust: true });
//       } catch {
//         source = await htmlToImage.toJpeg(el, { pixelRatio: 1.5, cacheBust: true, quality: 0.95 });
//       }
//     }

//     // Normalize to valid PNG data URL (guards “wrong PNG signature”)
//     const imgData = await ensurePngDataUrl(source);

//     // ----- safe scaling (NO subtract after scale) -----
//     const scale = Math.min(1, availW / srcW); // ≤ 1
//     let drawW = Math.max(1, Math.round(srcW * scale));
//     let drawH = Math.max(1, Math.round(srcH * scale));

//     // page break if needed
//     if (top + drawH > pageH - 30) {
//       doc.addPage();
//       top = marginTop;
//     }

//     // Final sanity guard (prevents blank writes)
//     if (!Number.isFinite(drawW) || !Number.isFinite(drawH) || drawW <= 0 || drawH <= 0) {
//       // eslint-disable-next-line no-console
//       console.warn("Skip image with invalid size", { drawW, drawH, srcW, srcH });
//       continue;
//     }

//     // Y tweak logic preserved
//     const y =
//       i === 0 ? 5 :
//         i === 1 ? top - 15 :
//           i === elements.length - 1 ? top - 15 :
//             top - 5;

//     const extraH =
//       i === 0 ? 12 :
//         i === 1 ? 32 :
//           i === elements.length - 1 ? 26 :
//             28;

//     // Optional: quick visibility check
//     // console.debug("img head:", imgData.slice(0, 30)); // should start with data:image/png;base64,

//     doc.addImage(imgData, "PNG", padding, y, drawW, drawH + extraH, `image${i}`, "FAST");

//     top += drawH + marginTop + 5;
//   }
// }
