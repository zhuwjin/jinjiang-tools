'use client';

import React, { useCallback, useState } from 'react';
import { Upload, File, X } from 'lucide-react';
import clsx from 'clsx';
import styles from './FileUpload.module.css';

interface FileUploadProps {
    onFilesSelected: (files: File[]) => void;
    accept?: string;
    multiple?: boolean;
    maxSize?: number; // in bytes
}

export function FileUpload({
    onFilesSelected,
    accept = 'application/pdf',
    multiple = false,
    maxSize = Infinity // No limit
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const validateFiles = useCallback((files: File[]): File[] => {
        const validFiles: File[] = [];
        setError(null);

        for (const file of files) {
            if (accept && !file.type.match(accept.replace('*', '.*'))) {
                setError(`文件类型不支持: ${file.name}`);
                continue;
            }
            if (maxSize !== Infinity && file.size > maxSize) {
                setError(`文件过大: ${file.name} (最大 ${maxSize / 1024 / 1024}MB)`);
                continue;
            }
            validFiles.push(file);
        }
        return validFiles;
    }, [accept, maxSize]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = validateFiles(droppedFiles);

        if (validFiles.length > 0) {
            onFilesSelected(validFiles);
        }
    }, [onFilesSelected, validateFiles]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            const validFiles = validateFiles(selectedFiles);

            if (validFiles.length > 0) {
                onFilesSelected(validFiles);
            }
        }
    }, [onFilesSelected, validateFiles]);

    return (
        <div className={styles.container}>
            <div
                className={clsx(styles.dropzone, isDragging && styles.dragging, error && styles.error)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className={styles.input}
                    onChange={handleFileInput}
                    accept={accept}
                    multiple={multiple}
                    id="file-upload"
                />
                <label htmlFor="file-upload" className={styles.label}>
                    <div className={styles.iconWrapper}>
                        <Upload size={32} />
                    </div>
                    <div className={styles.text}>
                        <span className={styles.primaryText}>点击上传</span>
                        <span className={styles.secondaryText}>或拖拽文件到这里</span>
                    </div>
                    <div className={styles.meta}>
                        {accept === 'application/pdf' ? 'PDF' : '文件'} {maxSize === Infinity ? '' : `最大 ${maxSize / 1024 / 1024}MB`}
                    </div>
                </label>
            </div>
            {error && (
                <div className={styles.errorMessage}>
                    <X size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
}
