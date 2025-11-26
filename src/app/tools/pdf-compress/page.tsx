'use client';

import React, { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Download, RefreshCw, Settings2 } from 'lucide-react';
import styles from './compression.module.css';
import { compressPDF } from '@/utils/compress-pdf';

export default function PdfCompressPage() {
    const [file, setFile] = useState<File | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [compressedPdf, setCompressedPdf] = useState<Blob | null>(null);
    const [settings, setSettings] = useState({
        quality: 0.7,
        dpi: 150,
    });

    const handleFileSelect = (files: File[]) => {
        if (files.length > 0) {
            setFile(files[0]);
            setCompressedPdf(null);
            setProgress(0);
        }
    };

    const handleCompress = async () => {
        if (!file) return;

        setIsCompressing(true);
        setProgress(0);

        try {
            const result = await compressPDF(file, settings, (p) => setProgress(p));
            setCompressedPdf(result);
        } catch (error) {
            console.error('Compression failed:', error);
            alert('压缩失败，请重试。');
        } finally {
            setIsCompressing(false);
        }
    };

    const handleDownload = () => {
        if (!compressedPdf || !file) return;
        const url = URL.createObjectURL(compressedPdf);
        const a = document.createElement('a');
        a.href = url;
        a.download = `compressed_${file.name}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setFile(null);
        setCompressedPdf(null);
        setProgress(0);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>PDF 压缩</h1>
                <p className={styles.description}>
                    减小 PDF 文件大小。
                </p>
            </header>

            {!file ? (
                <Card className={styles.uploadCard}>
                    <FileUpload onFilesSelected={handleFileSelect} accept="application/pdf" />
                </Card>
            ) : (
                <div className={styles.workspace}>
                    <Card className={styles.previewCard}>
                        <div className={styles.fileInfo}>
                            <div className={styles.fileName}>{file.name}</div>
                            <div className={styles.fileSize}>
                                原始大小: {(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                        </div>

                        <div className={styles.controls}>
                            <div className={styles.settingsGroup}>
                                <label className={styles.label}>
                                    <Settings2 size={16} />
                                    压缩等级
                                </label>
                                <select
                                    className={styles.select}
                                    value={settings.quality}
                                    onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                                >
                                    <option value="0.9">低压缩 (高质量)</option>
                                    <option value="0.7">中等压缩 (平衡)</option>
                                    <option value="0.5">高压缩 (低质量)</option>
                                </select>
                            </div>

                            <div className={styles.settingsGroup}>
                                <label className={styles.label}>
                                    DPI (分辨率)
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        className={styles.select}
                                        value={settings.dpi}
                                        onChange={(e) => setSettings({ ...settings, dpi: parseInt(e.target.value) || 72 })}
                                        min="1"
                                        style={{ flex: 1 }}
                                    />
                                    <span style={{ alignSelf: 'center', color: 'var(--muted-foreground)' }}>DPI</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                    常用: 72 (屏幕), 150 (电子书), 300 (打印)
                                </div>
                            </div>

                            <Button
                                onClick={handleCompress}
                                isLoading={isCompressing}
                                className={styles.compressBtn}
                            >
                                {isCompressing ? `正在压缩 ${Math.round(progress)}%` : (compressedPdf ? '重新压缩' : '开始压缩')}
                            </Button>
                        </div>

                        {compressedPdf && (
                            <div className={styles.result} style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                                <div className={styles.successMessage}>
                                    压缩完成!
                                </div>
                                <div className={styles.resultStats}>
                                    <span>新大小: {(compressedPdf.size / 1024 / 1024).toFixed(2)} MB</span>
                                    {compressedPdf.size > file.size ? (
                                        <span className={styles.growth}>
                                            +{Math.round((compressedPdf.size / file.size - 1) * 100)}%
                                        </span>
                                    ) : (
                                        <span className={styles.savings}>
                                            -{Math.round((1 - compressedPdf.size / file.size) * 100)}%
                                        </span>
                                    )}
                                </div>
                                <div className={styles.actions}>
                                    <Button onClick={handleDownload} variant="primary">
                                        <Download size={18} /> 下载
                                    </Button>
                                    <Button onClick={handleReset} variant="outline">
                                        <RefreshCw size={18} /> 压缩另一个文件
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}
