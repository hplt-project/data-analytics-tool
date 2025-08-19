import jsPDF from "jspdf";
import * as htmlToImage from "html-to-image";

export async function exportMultipleChartsToPdf(pdfName, offLoading) {
  const doc = new jsPDF("p", "px", "a4", true); // (1)

  const elements = document.getElementsByClassName("custom-chart"); // (2)

  await creatPdf({ doc, elements }); // (3-5)

  offLoading();

  doc.save(`${pdfName}.pdf`); // (6)
}

async function creatPdf({ doc, elements }) {
  const padding = 20;
  const marginTop = 30;
  let top = marginTop;

  for (let i = 0; i < elements.length; i++) {
    const el = elements.item(i);

    const imgData = await htmlToImage.toPng(el, { pixelRatio: 1.5 });

    let elHeight = el.offsetHeight;
    let elWidth = el.offsetWidth;

    const pageWidth = doc.internal.pageSize.getWidth();

    if (elWidth > pageWidth) {
      const ratio = pageWidth / elWidth;
      elHeight = elHeight * ratio - padding * 2;
      elWidth = elWidth * ratio - padding * 2;
    }

    const pageHeight = doc.internal.pageSize.getHeight();

    if (top + elHeight > pageHeight - 30) {
      doc.addPage();
      top = marginTop;
    }
    if (i == 0) {
      doc.addImage(
        imgData,
        "PNG",
        padding,
        5,
        elWidth,
        elHeight + 12,
        `image${i}`,
        "FAST"
      );
    } else if (i == 1) {
      doc.addImage(
        imgData,
        "PNG",
        padding,
        top - 15,
        elWidth,
        elHeight + 32,
        `image${i}`,
        "FAST"
      );
    } else if (i == elements.length - 1) {
      doc.addImage(
        imgData,
        "PNG",
        padding,
        top - 15,
        elWidth,
        elHeight + 26,
        `image${i}`,
        "FAST"
      );
    } else {
      doc.addImage(
        imgData,
        "PNG",
        padding,
        top - 5,
        elWidth,
        elHeight + 28,
        `image${i}`,
        "FAST"
      );
    }

    top += elHeight + marginTop + 5;
  }
}
