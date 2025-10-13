
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
        quality: 2,
        cacheBust: true,
        bgcolor: "#ffffff", // solid background avoids “blank-looking” transparent pages
        width: srcW,
        height: srcH,
        style: { width: `${srcW}px`, height: `${srcH}px` },
      });
    } catch {
      // Fallback to JPEG, then normalize back to PNG for jsPDF
      const jpeg = await domtoimage.toJpeg(el, {
        quality: 2,
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
    // const extraSpacing =
    //   i === 0 ? 12 : i === 1 ? 32 : i === elements.length - 1 ? 26 : 28;

    // Draw with preserved aspect ratio
    doc.addImage(imgData, "PNG", padding, y, drawW, drawH, `image${i}`, "SLOW");

    // Advance cursor for next element (use spacing here, not in image height)
    top += drawH + marginTop;
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


// // pdfExport.js
// import jsPDF from "jspdf";
// import * as domtoimage from "dom-to-image-more";

// /**
//  * Tweak these two to taste:
//  * - RENDER_SCALE: how many device pixels to render per CSS pixel (2–3 is typical)
//  * - GAP: vertical space between stacked charts in the PDF (px, in PDF units because we use "px")
//  */
// const RENDER_SCALE = 2; // ↑ increase for sharper output (and larger files)
// const GAP = 16;         // consistent spacing between charts

// export async function exportMultipleChartsToPdf(pdfName, offLoading) {
//   // Keep your ctor shape; jsPDF "px" unit is fine. We rely on higher source bitmap.
//   const doc = new jsPDF("p", "px", "a4", true);

//   const elements = document.getElementsByClassName("custom-chart");

//   await createPdf_domToImage({ doc, elements });

//   offLoading?.();
//   doc.save(`${pdfName}.pdf`);
// }

// /* ---------- helpers (same API you had) ---------- */

// async function ensurePngDataUrl(dataUrlOrBlobUrl) {
//   // If it's already a PNG DataURL → return
//   if (
//     typeof dataUrlOrBlobUrl === "string" &&
//     dataUrlOrBlobUrl.startsWith("data:image/png;base64,")
//   ) {
//     return dataUrlOrBlobUrl;
//   }

//   // If it's a blob: URL → fetch it, then convert to PNG
//   if (
//     typeof dataUrlOrBlobUrl === "string" &&
//     dataUrlOrBlobUrl.startsWith("blob:")
//   ) {
//     const blob = await (await fetch(dataUrlOrBlobUrl)).blob();
//     const imgBitmap = await createImageBitmap(blob);
//     const canvas = document.createElement("canvas");
//     canvas.width = imgBitmap.width;
//     canvas.height = imgBitmap.height;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(imgBitmap, 0, 0);
//     return canvas.toDataURL("image/png");
//   }

//   // If it's a data: URL (svg, jpeg, etc.), draw onto canvas then export PNG
//   if (
//     typeof dataUrlOrBlobUrl === "string" &&
//     dataUrlOrBlobUrl.startsWith("data:")
//   ) {
//     const img = await dataUrlToImage(dataUrlOrBlobUrl);
//     const canvas = document.createElement("canvas");
//     canvas.width = img.naturalWidth || img.width;
//     canvas.height = img.naturalHeight || img.height;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(img, 0, 0);
//     return canvas.toDataURL("image/png");
//   }

//   throw new Error("normalize: unsupported image source for PNG conversion");
// }

// function dataUrlToImage(dataUrl) {
//   return new Promise((resolve, reject) => {
//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.onload = () => resolve(img);
//     img.onerror = reject;
//     img.src = dataUrl;
//   });
// }

// /* ---------- main renderer (dom-to-image-more), hi-DPI + tight spacing ---------- */

// async function createPdf_domToImage({ doc, elements }) {
//   const marginTop = 30;
//   const paddingX = 20; // left/right margin when placing image
//   let top = marginTop;

//   // Wait for fonts before snapshot so text metrics are stable
//   if (document.fonts?.ready) {
//     try { await document.fonts.ready; } catch { }
//   }

//   const pageW = doc.internal.pageSize.getWidth();
//   const pageH = doc.internal.pageSize.getHeight();
//   const availW = Math.max(1, pageW - paddingX * 2);

//   for (let i = 0; i < elements.length; i++) {
//     const el = elements.item(i);
//     if (!el) continue;

//     // 1) Measure the element at CSS size
//     const srcW = Math.max(1, el.offsetWidth);
//     const srcH = Math.max(1, el.offsetHeight);

//     // 2) Render at higher resolution to improve sharpness
//     const renderW = Math.max(1, Math.round(srcW * RENDER_SCALE));
//     const renderH = Math.max(1, Math.round(srcH * RENDER_SCALE));

//     // 3) Snapshot DOM → PNG (dataURL) at hi-DPI; white background avoids “blank-looking” transparent pages
//     let imgData;
//     try {
//       imgData = await domtoimage.toPng(el, {
//         cacheBust: true,
//         bgcolor: "#ffffff",
//         width: renderW,
//         height: renderH,
//         // Render the clone at hi-DPI too, so everything (text, SVG) gets more pixels
//         style: { width: `${renderW}px`, height: `${renderH}px` },
//       });
//     } catch {
//       // Fallback to JPEG, then normalize to PNG
//       const jpeg = await domtoimage.toJpeg(el, {
//         quality: 0.98, // quality only affects JPEG path
//         cacheBust: true,
//         width: renderW,
//         height: renderH,
//         style: { width: `${renderW}px`, height: `${renderH}px` },
//         bgcolor: "#ffffff",
//       });
//       imgData = await ensurePngDataUrl(jpeg);
//     }

//     // Ensure we hand jsPDF a valid PNG data URL
//     imgData = await ensurePngDataUrl(imgData);

//     // 4) Compute the drawn size on the PDF (keep aspect ratio)
//     //    Note: use *CSS* size (srcW/srcH) for scaling relative to page width.
//     const scale = Math.min(1, availW / srcW); // don’t upscale beyond CSS width on the page
//     const drawW = Math.max(1, Math.round(srcW * scale));
//     // drawH honors the original aspect ratio based on CSS size
//     const drawH = Math.max(1, Math.round((srcH * drawW) / srcW));

//     // 5) Page break if it won’t fit
//     if (top + drawH > pageH - marginTop) {
//       doc.addPage();
//       top = marginTop;
//     }

//     // 6) Place image (use SLOW compression for better quality)
//     doc.addImage(imgData, "PNG", paddingX, top, drawW, drawH, `image${i}`, "SLOW");

//     // 7) Advance cursor by image height + constant GAP
//     top += drawH + GAP;
//   }
// }
