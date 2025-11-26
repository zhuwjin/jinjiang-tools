'use client';

import React, { useState, useRef } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Download, Trash2 } from 'lucide-react';
import styles from './merge.module.css';
import { mergePDFs } from '@/utils/merge-pdf';

interface PageItem {
    id: string;
    fileIndex: number;
    pageIndex: number; // 1-based
    thumbnail: string;
}

interface UploadedFile {
    file: File;
    color: string; // Visual indicator for which file a page belongs to
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];

export default function PdfMergePage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isMerging, setIsMerging] = useState(false);
    const [mergedPdf, setMergedPdf] = useState<Blob | null>(null);

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const generateThumbnails = async (newFiles: File[], startIndex: number) => {
        setIsProcessing(true);
        const newPages: PageItem[] = [];

        try {
            // Dynamically import pdfjs-dist
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs`;

            for (let i = 0; i < newFiles.length; i++) {
                const file = newFiles[i];
                const fileIndex = startIndex + i;
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

                for (let j = 1; j <= pdf.numPages; j++) {
                    const page = await pdf.getPage(j);
                    const viewport = page.getViewport({ scale: 0.2 }); // Thumbnail scale
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    if (context) {
                        await page.render({ canvasContext: context, viewport, canvas }).promise;
                        newPages.push({
                            id: `${fileIndex}-${j}-${Date.now()}`,
                            fileIndex: fileIndex,
                            pageIndex: j,
                            thumbnail: canvas.toDataURL(),
                        });
                    }
                }
            }
            setPages(prev => [...prev, ...newPages]);
        } catch (error) {
            console.error('Error generating thumbnails:', error);
            alert('读取 PDF 文件出错。');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileSelect = (selectedFiles: File[]) => {
        const newUploadedFiles = selectedFiles.map((file, index) => ({
            file,
            color: COLORS[(files.length + index) % COLORS.length]
        }));

        setFiles(prev => [...prev, ...newUploadedFiles]);
        generateThumbnails(selectedFiles, files.length);
        setMergedPdf(null);
    };

    const handleDragStart = (e: React.DragEvent, position: number) => {
        dragItem.current = position;
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, position: number) => {
        dragOverItem.current = position;
        e.preventDefault();
    };

    const handleDragEnd = () => {
        if (dragItem.current !== null && dragOverItem.current !== null) {
            const copyPages = [...pages];
            const dragContent = copyPages[dragItem.current];
            copyPages.splice(dragItem.current, 1);
            copyPages.splice(dragOverItem.current, 0, dragContent);
            setPages(copyPages);
        }
        dragItem.current = null;
        dragOverItem.current = null;
    };

    const handleRemovePage = (index: number) => {
        const newPages = [...pages];
        newPages.splice(index, 1);
        setPages(newPages);
    };

    const handleMerge = async () => {
        if (pages.length === 0) return;
        setIsMerging(true);
        try {
            const pageRefs = pages.map(p => ({
                file: files[p.fileIndex].file,
                pageIndex: p.pageIndex
            }));

            const result = await mergePDFs(pageRefs);
            setMergedPdf(result);
        } catch (error) {
            console.error('Merge failed:', error);
            alert('合并失败。');
        } finally {
            setIsMerging(false);
        }
    };

    const handleDownload = () => {
        if (!mergedPdf) return;
        const url = URL.createObjectURL(mergedPdf);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>PDF 合并</h1>
                <p className={styles.description}>
                    合并多个 PDF 文件并调整页面顺序。
                </p>
            </header>

            <div className={styles.actions}>
                <div className={styles.uploadWrapper}>
                    <FileUpload onFilesSelected={handleFileSelect} multiple={true} accept="application/pdf" />
                </div>
            </div>

            {files.length > 0 && (
                <div className={styles.workspace}>
                    <div className={styles.toolbar}>
                        <div className={styles.stats}>
                            {files.length} 个文件, {pages.length} 页
                        </div>
                        <div className={styles.mainActions}>
                            <Button
                                onClick={handleMerge}
                                disabled={isProcessing || pages.length === 0}
                                isLoading={isMerging}
                            >
                                合并页面
                            </Button>
                            {mergedPdf && (
                                <Button onClick={handleDownload} variant="secondary">
                                    <Download size={18} /> 下载
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className={styles.grid}>
                        {pages.map((page, index) => (
                            <div
                                key={page.id}
                                className={styles.pageCard}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragEnter={(e) => handleDragEnter(e, index)}
                                onDragEnd={handleDragEnd}
                                onDragOver={(e) => e.preventDefault()}
                                style={{ borderColor: files[page.fileIndex]?.color || 'var(--border)' }}
                            >
                                <div className={styles.pagePreview}>
                                    <img src={page.thumbnail} alt={`Page ${page.pageIndex}`} />
                                </div>
                                <div className={styles.pageInfo}>
                                    <span className={styles.pageNumber}>P{page.pageIndex}</span>
                                    <button
                                        className={styles.removeBtn}
                                        onClick={() => handleRemovePage(index)}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div
                                    className={styles.fileIndicator}
                                    style={{ backgroundColor: files[page.fileIndex]?.color }}
                                    title={files[page.fileIndex]?.file.name}
                                />
                            </div>
                        ))}

                        {isProcessing && (
                            <div className={styles.loadingCard}>
                                <div className={styles.spinner} />
                                <span>处理中...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
