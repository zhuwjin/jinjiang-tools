import { PDFDocument } from 'pdf-lib';

interface PageReference {
    file: File;
    pageIndex: number; // 1-based index from UI, needs to be converted to 0-based for pdf-lib
}

export async function mergePDFs(pageRefs: PageReference[]): Promise<Blob> {
    const newPdfDoc = await PDFDocument.create();

    // Cache loaded PDFs to avoid reloading the same file multiple times
    const loadedPdfs = new Map<File, PDFDocument>();

    for (const ref of pageRefs) {
        let srcPdfDoc = loadedPdfs.get(ref.file);

        if (!srcPdfDoc) {
            const arrayBuffer = await ref.file.arrayBuffer();
            srcPdfDoc = await PDFDocument.load(arrayBuffer);
            loadedPdfs.set(ref.file, srcPdfDoc);
        }

        // Copy the page
        // pdf-lib uses 0-based indexing, UI uses 1-based
        const [copiedPage] = await newPdfDoc.copyPages(srcPdfDoc, [ref.pageIndex - 1]);
        newPdfDoc.addPage(copiedPage);
    }

    const pdfBytes = await newPdfDoc.save();
    return new Blob([pdfBytes as any], { type: 'application/pdf' });
}
