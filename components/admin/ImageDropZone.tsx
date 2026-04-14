'use client'

import { useCallback, useState, useRef } from 'react';
import { Upload, X, Plus, Loader2 } from 'lucide-react';
import { useToast } from './Toast';

interface ImageDropZoneProps {
    currentImage?: string;
    currentImages?: string[];
    onFile?: (file: File | null) => void;
    onFiles?: (files: File[]) => void;
    onRemoveExisting?: (index: number) => void;
    label?: string;
    multiple?: boolean;
    maxFiles?: number;
}

export default function ImageDropZone({
    currentImage,
    currentImages = [],
    onFile,
    onFiles,
    onRemoveExisting,
    label = 'Image',
    multiple = false,
    maxFiles = 5
}: ImageDropZoneProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [dragging, setDragging] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const toast = useToast();

    const MAX_INPUT_SIZE = 25 * 1024 * 1024;

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () => {
                const MAX = 1920;
                let { width, height } = img;
                if (width > MAX || height > MAX) {
                    if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                    else { width = Math.round(width * MAX / height); height = MAX; }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    URL.revokeObjectURL(url);
                    if (blob && blob.size < file.size) {
                        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                    } else {
                        resolve(file);
                    }
                }, 'image/jpeg', 0.85);
            };
            img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
            img.src = url;
        });
    };

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files) return;

        const droppedFiles: File[] = [];
        const rejectedFiles: string[] = [];

        Array.from(files).forEach(file => {
            if (!file.type.startsWith('image/')) return;
            if (file.size > MAX_INPUT_SIZE) {
                rejectedFiles.push(file.name);
            } else {
                droppedFiles.push(file);
            }
        });

        if (rejectedFiles.length > 0) {
            toast.error('File too large', `${rejectedFiles.join(', ')} exceeds 25MB limit.`);
        }

        if (droppedFiles.length === 0) return;

        setIsCompressing(true);

        try {
            const compressedFiles = await Promise.all(droppedFiles.map(async (file) => {
                try {
                    if (file.size > 1024 * 1024) return await compressImage(file);
                    return file;
                } catch {
                    return file;
                }
            }));

            if (multiple) {
                const totalCurrent = (currentImages?.length || 0) + selectedFiles.length;
                const remaining = maxFiles - totalCurrent;

                if (remaining <= 0) {
                    toast.error('Limit Reached', `Maximum ${maxFiles} images allowed.`);
                    setIsCompressing(false);
                    return;
                }

                const filesToAdd = compressedFiles.slice(0, remaining);
                if (filesToAdd.length < compressedFiles.length) {
                    toast.success('Partial Upload', `Added ${filesToAdd.length} images. Limit is ${maxFiles}.`);
                }

                setSelectedFiles(prev => {
                    const updated = [...prev, ...filesToAdd];
                    if (onFiles) onFiles(updated);
                    return updated;
                });

                const readers = filesToAdd.map(file => {
                    return new Promise<string>((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.readAsDataURL(file);
                    });
                });

                Promise.all(readers).then(newPreviews => {
                    setPreviews(prev => [...prev, ...newPreviews]);
                    setIsCompressing(false);
                });
            } else {
                const file = compressedFiles[0];
                setSelectedFiles([file]);
                if (onFile) onFile(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews([reader.result as string]);
                    setIsCompressing(false);
                };
                reader.readAsDataURL(file);
            }
        } catch (err) {
            console.error(err);
            toast.error('Error processing images');
            setIsCompressing(false);
        }

        if (inputRef.current) inputRef.current.value = '';
    }, [multiple, onFile, onFiles, maxFiles, currentImages, selectedFiles, toast]);

    const removeNewFile = (index: number) => {
        setSelectedFiles(prev => {
            const updated = prev.filter((_, i) => i !== index);
            if (onFiles) onFiles(updated);
            return updated;
        });
        setPreviews(prev => prev.filter((_, i) => i !== index));
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleContainerClick = () => {
        inputRef.current?.click();
    };

    const existingCount = multiple ? (currentImages?.length || 0) : (currentImage ? 1 : 0);
    const newCount = previews.length;
    const totalCount = existingCount + newCount;
    const hasImages = totalCount > 0;

    return (
        <div>
            <label className="admin-label flex justify-between">
                <span>{label}</span>
                {multiple && <span className="text-xs text-gray-400">{totalCount} / {maxFiles}</span>}
            </label>

            <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault(); setDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={`transition-all duration-200 border-2 border-dashed rounded-xl relative ${dragging ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'}`}
                style={{ minHeight: '160px' }}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />

                {isCompressing ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 rounded-xl">
                        <Loader2 size={32} className="text-emerald-500 animate-spin mb-2" />
                        <p className="text-sm font-medium text-emerald-600">Compressing...</p>
                    </div>
                ) : !hasImages ? (
                    <div
                        onClick={handleContainerClick}
                        className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-6"
                    >
                        <Upload size={32} className="text-gray-400 mb-3" />
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {multiple ? 'Drop images here' : 'Drop image here'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">or click to browse</p>
                    </div>
                ) : (
                    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {multiple && currentImages?.map((src, idx) => (
                            <div key={`existing-${idx}`} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm ring-1 ring-black/5">
                                <img src={src} alt="Existing" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                {onRemoveExisting && (
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onRemoveExisting(idx); }}
                                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                                <div className="absolute bottom-1 left-2 px-1.5 py-0.5 bg-black/50 text-white text-[10px] rounded backdrop-blur-sm">Existing</div>
                            </div>
                        ))}

                        {previews.map((src, idx) => (
                            <div key={`new-${idx}`} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-200 shadow-sm ring-1 ring-emerald-500/30">
                                <img src={src} alt="New" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); removeNewFile(idx); }}
                                    className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                                >
                                    <X size={12} />
                                </button>
                                <div className="absolute bottom-1 left-2 px-1.5 py-0.5 bg-emerald-500 text-white text-[10px] rounded font-medium shadow-sm">New</div>
                            </div>
                        ))}

                        {multiple && totalCount < maxFiles && (
                            <button
                                type="button"
                                onClick={handleContainerClick}
                                className="aspect-video rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-white dark:hover:bg-slate-700 transition-all bg-transparent"
                            >
                                <Plus size={24} />
                                <span className="text-xs font-medium mt-1">Add</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
            {multiple && (
                <p className="text-xs text-gray-400 mt-2">
                    Start with existing images, adding new ones will merge them.
                </p>
            )}
        </div>
    );
}
