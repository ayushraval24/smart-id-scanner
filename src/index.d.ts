export interface CompressionOptions {
    maxSizeMB: number;
    maxWidthOrHeight: number;
    useWebWorker: boolean;
}

export interface FileData {
    file: string;
    name: string;
    type: string;
}

export interface CardScannerConfig {
    showLabel?: boolean;
    label?: string;
    required?: boolean;
    disabled?: boolean;
    showImage?: boolean;
    isHover?: boolean;
    hoverValue?: string;
    showButton?: boolean;
    labelInsideButton?: boolean;
    showIcon?: boolean;
    enableGallery?: boolean;
    enableAutoCapture?: boolean;
    themeColor?: string;
    maxFileSize?: number;
    compressionOptions?: CompressionOptions;
    onFileChange?: (file: FileData | null) => void;
    onCancel?: () => void;
    onError?: (error: any) => void;
    onSuccess?: (message: string) => void;
}

export interface DetectionResult {
    cardDetected: boolean;
    quality: string;
    guidance: string;
    detectionScore: number;
}

export declare class CardScanner {
    constructor(container: string | HTMLElement, options?: CardScannerConfig);

    /**
     * Get the current uploaded file data
     */
    getValue(): FileData | null;

    /**
     * Set the scanner value programmatically
     */
    setValue(value: FileData): void;

    /**
     * Clear the current value and reset the scanner
     */
    reset(): void;

    /**
     * Disable the scanner
     */
    disable(): void;

    /**
     * Enable the scanner
     */
    enable(): void;

    /**
     * Destroy the scanner instance and clean up resources
     */
    destroy(): void;
}

export default CardScanner;
