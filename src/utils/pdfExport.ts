import { jsPDF } from 'jspdf';
import { SHEET_H, SHEET_W } from '../types/cad';

function svgToPngDataUrl(
  svgEl: SVGSVGElement,
  outW: number,
  outH: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const svgClone = svgEl.cloneNode(true) as SVGSVGElement;
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svgClone.setAttribute('width', String(outW));
      svgClone.setAttribute('height', String(outH));
      svgClone.style.width = `${outW}px`;
      svgClone.style.height = `${outH}px`;

      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgClone);

      const bytes = new TextEncoder().encode(svgStr);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) {
        bin += String.fromCharCode(bytes[i]);
      }
      const svgBase64 = 'data:image/svg+xml;base64,' + btoa(bin);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = outW;
          canvas.height = outH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Contexto 2D indisponível para rasterização.'));
            return;
          }
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outW, outH);
          ctx.drawImage(img, 0, 0, outW, outH);
          resolve(canvas.toDataURL('image/png'));
        } catch (canvasErr) {
          reject(canvasErr);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = svgBase64;
    } catch (err) {
      reject(err);
    }
  });
}

export async function exportCadDrawingToPdf(
  svgEl: SVGSVGElement,
  partName: string
): Promise<void> {
  const safeName = (partName.trim() || 'desenho-tecnico')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/gi, '-');

  const pngDataUrl = await svgToPngDataUrl(svgEl, SHEET_W * 2, SHEET_H * 2);

  const pdf = new jsPDF({
    unit: 'mm',
    format: 'a4',
    orientation: 'landscape',
  });

  pdf.addImage(pngDataUrl, 'PNG', 0, 0, 297, 210);
  pdf.save(`${safeName}.pdf`);
}
