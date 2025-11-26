import { PDFDocument } from 'pdf-lib';

interface CompressionSettings {
    quality: number; // 0.1 to 1.0
    dpi: number; // e.g., 72, 150, 300
}

export async function compressPDF(
    file: File,
    settings: CompressionSettings,
    onProgress: (progress: number) => void
): Promise<Blob> {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs`;

    // Load the PDF document using pdfjs to render pages
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    // Create a new PDF document
    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
        onProgress((i / numPages) * 50); // First 50% is rendering

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: settings.dpi / 72 });

        // Create a canvas to render the page
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (!context) throw new Error('Could not get canvas context');

        await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas,
        }).promise;

        // Convert canvas to JPEG blob with specified quality
        const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.quality);

        // Embed the JPEG into the new PDF
        const jpegImage = await newPdfDoc.embedJpg(jpegDataUrl);

        // Add a page to the new PDF
        const newPage = newPdfDoc.addPage([jpegImage.width, jpegImage.height]);

        // Draw the image onto the page
        newPage.drawImage(jpegImage, {
            x: 0,
            y: 0,
            width: jpegImage.width,
            height: jpegImage.height,
        });

        onProgress(50 + (i / numPages) * 50); // Second 50% is rebuilding
    }

    const pdfBytes = await newPdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
}
