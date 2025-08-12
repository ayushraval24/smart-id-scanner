/**
 * CardScanner - Vanilla JavaScript ID Card Scanner with Auto-Capture
 * A complete solution for ID card scanning with camera integration
 *
 * @version 1.0.0
 * @author Your Name
 */

class CardScanner {
    constructor(container, options = {}) {
        // Default configuration
        this.config = {
            showLabel: true,
            label: 'Upload ID Card',
            required: false,
            disabled: false,
            showImage: true,
            isHover: false,
            hoverValue: null,
            showButton: true,
            labelInsideButton: false,
            showIcon: true,
            enableGallery: true,
            enableAutoCapture: true,
            themeColor: '#1976d2',
            maxFileSize: 100000, // 100KB
            compressionOptions: {
                maxSizeMB: 0.05,
                maxWidthOrHeight: 1280,
                useWebWorker: true
            },
            onFileChange: null, // callback function
            onCancel: null, // callback function
            onError: null, // callback function
            onSuccess: null, // callback function
            ...options
        };

        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            throw new Error('Container element not found');
        }

        // State management
        this.state = {
            value: null,
            anchorEl: null,
            dropdownAnchorEl: null,
            dialogOpen: false,
            cameraOpen: false,
            countdown: null,
            feedback: null,
            capturedImage: null,
            showPreview: false,
            isMobile: false,
            isAnalyzing: false,
            isReady: false,
            stream: null
        };

        // Camera related refs
        this.videoRef = null;
        this.canvasRef = null;
        this.fileInputRef = null;
        this.countdownTimeoutRef = null;
        this.detectionIntervalRef = null;
        this.stableFramesRef = 0;
        this.lastCaptureTimeRef = 0;
        this.autoCapturePendingRef = false;
        this.requiredStableFrames = 3;

        // Guidance text
        this.baseGuidance =
            'Position your ID card within the green frame. Make sure all corners are visible and text is clear.';
        this.dynamicGuidance = '';

        this.init();
    }

    init() {
        this.injectStyles();
        this.detectMobile();
        this.setupEventListeners();
        this.render();
    }

    injectStyles() {
        if (document.getElementById('card-scanner-styles')) return;

        const styleSheet = document.createElement('style');
        styleSheet.id = 'card-scanner-styles';
        styleSheet.textContent = this.getStyles();
        document.head.appendChild(styleSheet);
    }

    getStyles() {
        return `
            .card-scanner {
                width: 100%;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            }

            .card-scanner-label {
                color: black;
                margin-bottom: 8px;
                font-size: 14px;
                font-weight: 500;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .card-scanner-required {
                color: red;
            }

            .card-scanner-button {
                width: 100%;
                padding: 12px 16px;
                border: 1px solid ${this.config.themeColor};
                background-color: white;
                color: ${this.config.themeColor};
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .card-scanner-button:hover:not(:disabled) {
                background-color: #f1f1f1;
            }

            .card-scanner-button:disabled {
                background-color: white;
                border-color: rgba(0, 0, 0, 0.26);
                cursor: not-allowed;
                opacity: 0.6;
            }

            .card-scanner-image-container {
                position: relative;
                margin-top: 5px;
            }

            .card-scanner-image {
                width: 100%;
                height: auto;
                cursor: pointer;
                border-radius: 4px;
            }

            .card-scanner-remove {
                position: absolute;
                top: -10px;
                right: -10px;
                background: white;
                border: 2px solid #ff4444;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 12px;
                color: #ff4444;
                font-weight: bold;
            }

            .card-scanner-dropdown {
                position: absolute;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.15);
                min-width: 200px;
                z-index: 1000;
                overflow: hidden;
            }

            .card-scanner-dropdown-option {
                padding: 12px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.2s ease;
            }

            .card-scanner-dropdown-option:hover {
                background-color: #f5f5f5;
            }

            .card-scanner-dropdown-option:first-child {
                border-bottom: 1px solid #f0f0f0;
            }

            .card-scanner-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 9998;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }

            .card-scanner-dialog-content {
                background: white;
                border-radius: 8px;
                max-width: 90vw;
                max-height: 90vh;
                position: relative;
                overflow: hidden;
            }

            .card-scanner-dialog-close {
                position: absolute;
                top: 8px;
                right: 8px;
                background: white;
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                cursor: pointer;
                font-size: 18px;
                z-index: 1;
            }

            .card-scanner-camera-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.9);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            .card-scanner-video-container {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .card-scanner-video {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            .card-scanner-overlay {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 85%;
                max-width: 350px;
                aspect-ratio: 1.6;
                border: 3px solid #00ff00;
                border-radius: 12px;
                background: transparent;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.3);
                z-index: 1;
                transition: all 0.3s ease;
            }

            .card-scanner-overlay.analyzing {
                border-color: #ffaa00;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(255, 170, 0, 0.3), 0 0 15px #ffaa00;
            }

            .card-scanner-overlay.ready {
                border-color: #00ff00;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7), inset 0 0 25px rgba(0, 255, 0, 0.4), 0 0 25px #00ff00;
            }

            .card-scanner-guidance {
                position: absolute;
                top: 8%;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                text-align: center;
                padding: 16px 20px;
                background-color: rgba(0, 0, 0, 0.8);
                border-radius: 12px;
                font-size: 13px;
                font-weight: 500;
                width: 90%;
                max-width: 320px;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
                line-height: 1.4;
            }

            .card-scanner-controls {
                position: absolute;
                bottom: 60px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .card-scanner-capture-button {
                width: 75px;
                height: 75px;
                border-radius: 50%;
                border: 4px solid white;
                background-color: transparent;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                transition: all 0.3s ease;
            }

            .card-scanner-capture-button:active {
                transform: scale(0.92);
            }

            .card-scanner-capture-button.active {
                background-color: #00aa00;
                border-color: #00ff00;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
            }

            .card-scanner-capture-inner {
                width: 55px;
                height: 55px;
                border-radius: 50%;
                background-color: white;
                transition: all 0.3s ease;
            }

            .card-scanner-countdown {
                position: absolute;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 64px;
                font-weight: bold;
                color: #fff;
                text-shadow: 0 0 30px rgba(255,255,255,0.9);
                pointer-events: none;
                opacity: 0;
                transition: all 0.4s ease;
            }

            .card-scanner-countdown.show {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1.1);
            }

            .card-scanner-feedback {
                position: absolute;
                top: 18%;
                left: 5%;
                right: 5%;
                text-align: center;
                color: #fff;
                font-size: 14px;
                font-weight: 600;
                padding: 12px 16px;
                border-radius: 10px;
                backdrop-filter: blur(15px);
                z-index: 10;
                opacity: 0;
                transform: translateY(-30px);
                transition: all 0.4s ease;
            }

            .card-scanner-feedback.show {
                opacity: 1;
                transform: translateY(0);
            }

            .card-scanner-feedback.success {
                background-color: rgba(34, 197, 94, 0.9);
                border: 2px solid rgba(34, 197, 94, 0.8);
            }

            .card-scanner-feedback.warning {
                background-color: rgba(251, 146, 60, 0.9);
                border: 2px solid rgba(251, 146, 60, 0.8);
            }

            .card-scanner-feedback.error {
                background-color: rgba(239, 68, 68, 0.9);
                border: 2px solid rgba(239, 68, 68, 0.8);
            }

            .card-scanner-feedback.info {
                background-color: rgba(59, 130, 246, 0.9);
                border: 2px solid rgba(59, 130, 246, 0.8);
            }

            .card-scanner-close-button {
                position: absolute;
                top: 40px;
                right: 20px;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 2;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background-color: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(10px);
                border: none;
            }

            .card-scanner-preview {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.95);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }

            .card-scanner-preview-title {
                position: absolute;
                top: 40px;
                left: 50%;
                transform: translateX(-50%);
                color: white;
                font-size: 20px;
                font-weight: bold;
                text-align: center;
            }

            .card-scanner-preview-image {
                width: 90%;
                max-width: 400px;
                aspect-ratio: 1.6;
                background-color: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                margin-bottom: 40px;
            }

            .card-scanner-preview-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            .card-scanner-preview-buttons {
                display: flex;
                gap: 20px;
                width: 100%;
                max-width: 400px;
            }

            .card-scanner-preview-button {
                flex: 1;
                padding: 15px 20px;
                font-size: 16px;
                font-weight: bold;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .card-scanner-preview-button.retake {
                border: 2px solid white;
                background-color: transparent;
                color: white;
            }

            .card-scanner-preview-button.retake:hover {
                background-color: rgba(255,255,255,0.1);
            }

            .card-scanner-preview-button.upload {
                border: none;
                background-color: #22c55e;
                color: white;
                box-shadow: 0 4px 15px rgba(34, 197, 94, 0.4);
            }

            .card-scanner-preview-button.upload:hover {
                background-color: #16a34a;
                transform: translateY(-1px);
            }

            .card-scanner-hidden {
                position: absolute;
                opacity: 0;
                pointer-events: none;
                width: 1px;
                height: 1px;
            }

            /* Responsive styles */
            @media (max-width: 480px) {
                .card-scanner-guidance {
                    width: 95%;
                    max-width: 260px;
                    font-size: 12px;
                    padding: 12px 16px;
                }
                
                .card-scanner-capture-button {
                    width: 65px;
                    height: 65px;
                }
                
                .card-scanner-capture-inner {
                    width: 45px;
                    height: 45px;
                }
                
                .card-scanner-overlay {
                    width: 80%;
                    max-width: 280px;
                }
                
                .card-scanner-controls {
                    bottom: 40px;
                }
            }

            @media (max-width: 360px) {
                .card-scanner-guidance {
                    width: 95%;
                    max-width: 240px;
                    font-size: 11px;
                    padding: 10px 14px;
                }
                
                .card-scanner-overlay {
                    width: 82%;
                    max-width: 260px;
                }
            }

            @media (min-width: 768px) {
                .card-scanner-guidance {
                    max-width: 320px;
                    font-size: 14px;
                }
                
                .card-scanner-overlay {
                    max-width: 320px;
                }
            }
        `;
    }

    detectMobile() {
        const checkMobile = () => {
            const userAgent = navigator.userAgent;
            const isMobileDevice =
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                window.innerWidth <= 768;
            this.state.isMobile = isMobileDevice;
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
    }

    setupEventListeners() {
        // Camera event listeners
        this.handleCountdown = (event) => {
            if (this.countdownTimeoutRef) {
                clearTimeout(this.countdownTimeoutRef);
                this.countdownTimeoutRef = null;
            }

            this.state.countdown = event.detail.count;
            this.updateCountdownDisplay();

            this.countdownTimeoutRef = setTimeout(() => {
                this.state.countdown = null;
                this.updateCountdownDisplay();
                this.countdownTimeoutRef = null;
            }, 1000);
        };

        this.handleHideCountdown = () => {
            if (this.countdownTimeoutRef) {
                clearTimeout(this.countdownTimeoutRef);
                this.countdownTimeoutRef = null;
            }
            this.state.countdown = null;
            this.updateCountdownDisplay();
        };

        this.handleFeedback = (event) => {
            this.state.feedback = { message: event.detail.message, type: event.detail.type };
            this.updateFeedbackDisplay();
            setTimeout(() => {
                this.state.feedback = null;
                this.updateFeedbackDisplay();
            }, 3000);
        };

        window.addEventListener('showCountdown', this.handleCountdown);
        window.addEventListener('hideCountdown', this.handleHideCountdown);
        window.addEventListener('showCameraFeedback', this.handleFeedback);
    }

    render() {
        this.container.innerHTML = '';
        this.container.className = 'card-scanner';

        // Create main structure
        if (this.config.showLabel) {
            this.renderLabel();
        }

        this.renderUploadButton();
        this.renderImage();
        this.createHiddenElements();
    }

    renderLabel() {
        const labelContainer = document.createElement('div');
        labelContainer.className = 'card-scanner-label';

        const labelText = document.createElement('span');
        labelText.textContent = this.config.label;

        if (this.config.required) {
            const required = document.createElement('span');
            required.className = 'card-scanner-required';
            required.textContent = '*';
            labelText.appendChild(required);
        }

        labelContainer.appendChild(labelText);

        if (this.config.isHover && this.config.hoverValue) {
            // Add hover icon if needed
            const hoverIcon = document.createElement('span');
            hoverIcon.textContent = 'ℹ️';
            hoverIcon.style.cursor = 'pointer';
            hoverIcon.title = this.config.hoverValue;
            labelContainer.appendChild(hoverIcon);
        }

        this.container.appendChild(labelContainer);
    }

    renderUploadButton() {
        if (!this.config.showButton && this.state.value?.file) return;

        const button = document.createElement('button');
        button.className = 'card-scanner-button';
        button.disabled = this.config.disabled;

        if (this.config.labelInsideButton) {
            button.textContent = this.config.label;
        } else if (this.config.showIcon) {
            button.innerHTML = '📁 Choose File';
        } else {
            button.textContent = 'Upload';
        }

        if (this.state.isMobile && this.config.enableGallery) {
            button.addEventListener('click', (e) => this.handleDropdownToggle(e));
        } else {
            button.addEventListener('click', () => this.handleChooseFromGallery());
        }

        this.container.appendChild(button);
    }

    renderImage() {
        if (!this.state.value?.file || !this.config.showImage) return;

        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-scanner-image-container';

        const img = document.createElement('img');
        img.className = 'card-scanner-image';
        img.src = `data:image/png;base64,${this.state.value.file}`;
        img.alt = this.config.label;
        img.addEventListener('click', () => this.openDialog());

        const removeButton = document.createElement('div');
        removeButton.className = 'card-scanner-remove';
        removeButton.textContent = '✕';
        removeButton.addEventListener('click', () => this.handleRemoveFile());

        imageContainer.appendChild(img);
        imageContainer.appendChild(removeButton);
        this.container.appendChild(imageContainer);
    }

    createHiddenElements() {
        // Create hidden file input
        this.fileInputRef = document.createElement('input');
        this.fileInputRef.type = 'file';
        this.fileInputRef.accept = 'image/*';
        this.fileInputRef.className = 'card-scanner-hidden';
        this.fileInputRef.addEventListener('change', (e) => this.handleFileChange(e));
        this.container.appendChild(this.fileInputRef);

        // Create hidden video and canvas for camera
        this.videoRef = document.createElement('video');
        this.videoRef.autoplay = true;
        this.videoRef.playsInline = true;
        this.videoRef.muted = true;
        this.videoRef.className = 'card-scanner-hidden';

        this.canvasRef = document.createElement('canvas');
        this.canvasRef.className = 'card-scanner-hidden';

        this.container.appendChild(this.videoRef);
        this.container.appendChild(this.canvasRef);
    }

    handleDropdownToggle(event) {
        if (this.state.dropdownAnchorEl) {
            this.closeDropdown();
            return;
        }

        const dropdown = document.createElement('div');
        dropdown.className = 'card-scanner-dropdown';

        const rect = event.target.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + 5}px`;
        dropdown.style.left = `${rect.left}px`;

        const takePhotoOption = document.createElement('div');
        takePhotoOption.className = 'card-scanner-dropdown-option';
        takePhotoOption.textContent = 'Take Photo';
        takePhotoOption.addEventListener('click', () => {
            this.closeDropdown();
            this.handleTakePhoto();
        });

        const galleryOption = document.createElement('div');
        galleryOption.className = 'card-scanner-dropdown-option';
        galleryOption.textContent = 'Choose from Gallery';
        galleryOption.addEventListener('click', () => {
            this.closeDropdown();
            this.handleChooseFromGallery();
        });

        dropdown.appendChild(takePhotoOption);
        dropdown.appendChild(galleryOption);

        document.body.appendChild(dropdown);
        this.state.dropdownAnchorEl = dropdown;

        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick.bind(this), { once: true });
        }, 0);
    }

    handleOutsideClick(event) {
        if (this.state.dropdownAnchorEl && !this.state.dropdownAnchorEl.contains(event.target)) {
            this.closeDropdown();
        }
    }

    closeDropdown() {
        if (this.state.dropdownAnchorEl) {
            this.state.dropdownAnchorEl.remove();
            this.state.dropdownAnchorEl = null;
        }
    }

    async handleTakePhoto() {
        this.state.cameraOpen = true;
        this.renderCamera();

        try {
            await this.startCamera();
        } catch (error) {
            this.showFeedback('Camera access failed. Please check permissions.', 'error');
            this.config.onError?.(error);
        }
    }

    handleChooseFromGallery() {
        this.fileInputRef.click();
    }

    async handleFileChange(event) {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await this.handleImageUpload(file);
            } catch (error) {
                this.config.onError?.(error);
            }
        }
        // Reset input value
        event.target.value = '';
    }

    async handleImageUpload(file) {
        try {
            let processedFile = file;

            if (file.size > this.config.maxFileSize) {
                // Simple compression by resizing
                processedFile = await this.compressImage(file);
            }

            const processedData = await this.processImage(processedFile);
            this.state.value = processedData;
            this.config.onFileChange?.(processedData);
            this.config.onSuccess?.('File uploaded successfully');
            this.render();
        } catch (error) {
            this.config.onError?.(error);
        }
    }

    async compressImage(file) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const maxWidth = this.config.compressionOptions.maxWidthOrHeight;
                const maxHeight = this.config.compressionOptions.maxWidthOrHeight;

                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        });
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    0.8
                );
            };

            img.src = URL.createObjectURL(file);
        });
    }

    async processImage(file) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve({
                    file: base64,
                    name: file.name,
                    type: file.type
                });
            };
            reader.readAsDataURL(file);
        });
    }

    handleRemoveFile() {
        this.state.value = null;
        this.config.onCancel?.();
        this.config.onFileChange?.(null);
        this.render();
    }

    openDialog() {
        if (!this.state.value?.file) return;

        const dialog = document.createElement('div');
        dialog.className = 'card-scanner-dialog';

        const content = document.createElement('div');
        content.className = 'card-scanner-dialog-content';

        const closeBtn = document.createElement('button');
        closeBtn.className = 'card-scanner-dialog-close';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', () => {
            dialog.remove();
        });

        const img = document.createElement('img');
        img.src = `data:image/png;base64,${this.state.value.file}`;
        img.alt = this.config.label;
        img.style.width = '100%';
        img.style.height = 'auto';

        content.appendChild(closeBtn);
        content.appendChild(img);
        dialog.appendChild(content);

        // Close on backdrop click
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.remove();
            }
        });

        document.body.appendChild(dialog);
    }

    renderCamera() {
        if (!this.state.cameraOpen) return;

        const cameraOverlay = document.createElement('div');
        cameraOverlay.className = 'card-scanner-camera-overlay';

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'card-scanner-close-button';
        closeBtn.textContent = '✕';
        closeBtn.addEventListener('click', () => this.handleCloseCamera());

        // Video container
        const videoContainer = document.createElement('div');
        videoContainer.className = 'card-scanner-video-container';

        // Video element
        this.videoRef.className = 'card-scanner-video';

        // Overlay frame
        const overlay = document.createElement('div');
        overlay.className = 'card-scanner-overlay';
        this.overlayElement = overlay;

        // Guidance text
        const guidance = document.createElement('div');
        guidance.className = 'card-scanner-guidance';
        guidance.textContent = this.baseGuidance;
        this.guidanceElement = guidance;

        // Countdown
        const countdown = document.createElement('div');
        countdown.className = 'card-scanner-countdown';
        this.countdownElement = countdown;

        // Feedback
        const feedback = document.createElement('div');
        feedback.className = 'card-scanner-feedback';
        this.feedbackElement = feedback;

        // Controls
        const controls = document.createElement('div');
        controls.className = 'card-scanner-controls';

        const captureButton = document.createElement('div');
        captureButton.className = 'card-scanner-capture-button';
        captureButton.addEventListener('click', () => this.handleManualCapture());

        const captureInner = document.createElement('div');
        captureInner.className = 'card-scanner-capture-inner';

        captureButton.appendChild(captureInner);
        controls.appendChild(captureButton);

        this.captureButtonElement = captureButton;

        // Assemble camera overlay
        videoContainer.appendChild(this.videoRef);
        videoContainer.appendChild(overlay);
        videoContainer.appendChild(guidance);
        videoContainer.appendChild(countdown);
        videoContainer.appendChild(feedback);
        videoContainer.appendChild(controls);

        cameraOverlay.appendChild(closeBtn);
        cameraOverlay.appendChild(videoContainer);
        cameraOverlay.appendChild(this.canvasRef);

        document.body.appendChild(cameraOverlay);
        this.cameraOverlayElement = cameraOverlay;
    }

    async startCamera() {
        try {
            if (this.state.stream) {
                this.state.stream.getTracks().forEach((track) => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 }
                }
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoRef.srcObject = mediaStream;
            this.state.stream = mediaStream;

            this.videoRef.addEventListener('loadedmetadata', () => {
                this.canvasRef.width = this.videoRef.videoWidth;
                this.canvasRef.height = this.videoRef.videoHeight;

                if (this.config.enableAutoCapture) {
                    setTimeout(() => this.startDetection(), 2000);
                }
            });
        } catch (error) {
            throw error;
        }
    }

    stopCamera() {
        if (this.state.stream) {
            this.state.stream.getTracks().forEach((track) => track.stop());
            this.state.stream = null;
        }
        this.stopDetection();
    }

    startDetection() {
        if (!this.config.enableAutoCapture) return;

        this.stopDetection();

        if (!this.videoRef.videoWidth || !this.videoRef.videoHeight) {
            return;
        }

        this.detectionIntervalRef = setInterval(() => {
            this.checkForIDCard();
        }, 300);
    }

    stopDetection() {
        if (this.detectionIntervalRef) {
            clearInterval(this.detectionIntervalRef);
            this.detectionIntervalRef = null;
        }
        this.resetDetectionState();
    }

    resetDetectionState() {
        this.stableFramesRef = 0;
        this.autoCapturePendingRef = false;
        this.state.isAnalyzing = false;
        this.state.isReady = false;
        this.dynamicGuidance = '';
        this.updateOverlayState();
    }

    checkForIDCard() {
        const video = this.videoRef;
        const canvas = this.canvasRef;

        if (!video || !canvas || this.autoCapturePendingRef) {
            return;
        }

        if (!video.videoWidth || !video.videoHeight) {
            return;
        }

        try {
            const context = canvas.getContext('2d');
            if (!context) return;

            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const detectionResult = this.smartIDDetection(context, canvas);

            if (detectionResult.cardDetected) {
                this.stableFramesRef++;
                this.state.isAnalyzing = true;
                this.dynamicGuidance = `ID detected! Hold steady... (${
                    this.requiredStableFrames - this.stableFramesRef
                } more frames)`;

                if (this.stableFramesRef >= this.requiredStableFrames) {
                    this.triggerAutoCapture();
                }
            } else {
                if (this.stableFramesRef > 0) {
                    this.resetDetectionState();
                }
                this.dynamicGuidance = detectionResult.guidance || '';
            }

            this.updateGuidanceText();
            this.updateOverlayState();
        } catch (error) {
            this.resetDetectionState();
        }
    }

    smartIDDetection(context, canvas) {
        const overlayX = Math.floor(canvas.width * 0.1);
        const overlayY = Math.floor(canvas.height * 0.3);
        const overlayWidth = Math.floor(canvas.width * 0.8);
        const overlayHeight = Math.floor(overlayWidth / 1.6);

        if (overlayWidth <= 0 || overlayHeight <= 0) {
            return {
                cardDetected: false,
                quality: 'Invalid area',
                guidance: 'Camera not ready',
                detectionScore: 0
            };
        }

        try {
            const imageData = context.getImageData(overlayX, overlayY, overlayWidth, overlayHeight);
            const data = imageData.data;

            // Simplified ID detection based on image characteristics
            let idScore = 0;
            let guidance = '';

            // Check for rectangular patterns and text-like structures
            const textScore = this.analyzeTextPatterns(data, overlayWidth, overlayHeight);
            const colorScore = this.detectOfficialColors(data, overlayWidth, overlayHeight);
            const layoutScore = this.analyzeIDLayout(data, overlayWidth, overlayHeight);

            idScore = (textScore + colorScore + layoutScore) / 3;

            const isIDCard = idScore >= 50; // Simplified threshold

            if (isIDCard) {
                guidance = 'ID card detected! Hold steady for capture...';
            } else if (textScore < 30) {
                guidance = 'Ensure ID text and details are clear';
            } else {
                guidance = 'Adjust position for clearer ID features';
            }

            return {
                cardDetected: isIDCard,
                quality: isIDCard ? 'ID detected' : 'Not an ID card',
                guidance,
                detectionScore: idScore
            };
        } catch (error) {
            return {
                cardDetected: false,
                quality: 'Detection error',
                guidance: 'Please try again',
                detectionScore: 0
            };
        }
    }

    analyzeTextPatterns(data, width, height) {
        let horizontalLines = 0;
        let strongContrast = 0;

        for (let y = 0; y < height - 2; y += 2) {
            let lineContrast = 0;

            for (let x = 0; x < width - 2; x += 2) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;

                const rightIdx = idx + 8;
                if (rightIdx < data.length) {
                    const rightBrightness = (data[rightIdx] + data[rightIdx + 1] + data[rightIdx + 2]) / 3;
                    const contrast = Math.abs(brightness - rightBrightness);

                    if (contrast > 50) {
                        lineContrast++;
                        strongContrast++;
                    }
                }
            }

            if (lineContrast > width / 20) {
                horizontalLines++;
            }
        }

        return Math.min((horizontalLines / 10) * 100, 100);
    }

    detectOfficialColors(data, width, height) {
        let officialColorPixels = 0;
        let totalSamples = 0;

        for (let i = 0; i < data.length; i += 16) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            totalSamples++;

            // Check for common ID card colors (blues, reds, official colors)
            if ((b > r && b > g && b > 100) || (r > 150 && g < 100 && b < 100)) {
                officialColorPixels++;
            }
        }

        return Math.min((officialColorPixels / totalSamples) * 200, 100);
    }

    analyzeIDLayout(data, width, height) {
        let leftActivity = 0;
        let rightActivity = 0;

        const midWidth = Math.floor(width / 2);

        for (let y = 0; y < height; y += 4) {
            for (let x = 0; x < width; x += 4) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const activity = Math.abs(brightness - 128);

                if (x < midWidth) {
                    leftActivity += activity;
                } else {
                    rightActivity += activity;
                }
            }
        }

        return Math.min((leftActivity + rightActivity) / 2000, 100);
    }

    async triggerAutoCapture() {
        if (this.autoCapturePendingRef) return;

        const now = Date.now();
        if (now - this.lastCaptureTimeRef < 3000) {
            return;
        }

        this.autoCapturePendingRef = true;
        this.state.isReady = true;
        this.dynamicGuidance = 'Perfect! Auto-capturing...';
        this.updateGuidanceText();
        this.updateOverlayState();

        const countdownSuccess = await this.showCountdownWithDetection(3);

        if (!countdownSuccess) {
            this.autoCapturePendingRef = false;
            this.resetDetectionState();
            window.dispatchEvent(new CustomEvent('hideCountdown'));

            if (this.state.stream && this.config.enableAutoCapture) {
                setTimeout(() => this.startDetection(), 100);
            }
            return;
        }

        this.stopDetection();

        try {
            const capturedFile = await this.captureImage();
            if (capturedFile) {
                this.handleCapturedImage(capturedFile);
            }
        } catch (error) {
            this.showFeedback('Auto-capture failed', 'error');
        } finally {
            this.lastCaptureTimeRef = Date.now();
            this.autoCapturePendingRef = false;
            this.resetDetectionState();
        }
    }

    showCountdownWithDetection(seconds) {
        return new Promise((resolve) => {
            let count = seconds;
            let detectionInterval;
            let countdownTimeout;
            let isCancelled = false;
            let failedDetections = 0;
            const maxFailedDetections = 3;

            detectionInterval = setInterval(() => {
                const video = this.videoRef;
                const canvas = this.canvasRef;

                if (!video || !canvas || isCancelled) {
                    clearInterval(detectionInterval);
                    resolve(false);
                    return;
                }

                try {
                    const context = canvas.getContext('2d');
                    if (!context) return;

                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const detectionResult = this.smartIDDetection(context, canvas);

                    if (!detectionResult.cardDetected) {
                        failedDetections++;

                        if (failedDetections >= maxFailedDetections) {
                            isCancelled = true;
                            clearInterval(detectionInterval);
                            if (countdownTimeout) {
                                clearTimeout(countdownTimeout);
                            }
                            window.dispatchEvent(new CustomEvent('hideCountdown'));
                            resolve(false);
                        }
                    } else {
                        failedDetections = 0;
                    }
                } catch (error) {
                    failedDetections++;
                    if (failedDetections >= maxFailedDetections) {
                        isCancelled = true;
                        clearInterval(detectionInterval);
                        if (countdownTimeout) {
                            clearTimeout(countdownTimeout);
                        }
                        window.dispatchEvent(new CustomEvent('hideCountdown'));
                        resolve(false);
                    }
                }
            }, 300);

            const countdown = () => {
                if (isCancelled) {
                    clearInterval(detectionInterval);
                    resolve(false);
                    return;
                }

                if (count > 0) {
                    window.dispatchEvent(
                        new CustomEvent('showCountdown', {
                            detail: { count }
                        })
                    );

                    countdownTimeout = setTimeout(() => {
                        count--;
                        if (!isCancelled) {
                            countdown();
                        }
                    }, 1000);
                } else {
                    clearInterval(detectionInterval);
                    resolve(true);
                }
            };

            countdown();
        });
    }

    async captureImage() {
        return new Promise((resolve) => {
            if (!this.videoRef || !this.canvasRef) {
                resolve(null);
                return;
            }

            const canvas = this.canvasRef;
            const video = this.videoRef;
            const context = canvas.getContext('2d');

            if (!context) {
                resolve(null);
                return;
            }

            // Vibrate if supported
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }

            // Simplified capture - just get the overlay area
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Calculate overlay area (center 85% width, aspect ratio 1.6)
            const overlayWidth = videoWidth * 0.85;
            const overlayHeight = overlayWidth / 1.6;
            const overlayX = (videoWidth - overlayWidth) / 2;
            const overlayY = (videoHeight - overlayHeight) / 2;

            // Create cropped canvas
            const croppedCanvas = document.createElement('canvas');
            croppedCanvas.width = overlayWidth;
            croppedCanvas.height = overlayHeight;
            const croppedCtx = croppedCanvas.getContext('2d');

            if (croppedCtx) {
                croppedCtx.drawImage(
                    video,
                    overlayX,
                    overlayY,
                    overlayWidth,
                    overlayHeight,
                    0,
                    0,
                    overlayWidth,
                    overlayHeight
                );

                croppedCanvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                            resolve(file);
                        } else {
                            resolve(null);
                        }
                    },
                    'image/jpeg',
                    0.92
                );
            } else {
                resolve(null);
            }
        });
    }

    async handleManualCapture() {
        try {
            const capturedFile = await this.captureImage();
            if (capturedFile) {
                this.handleCapturedImage(capturedFile);
            }
        } catch (error) {
            this.showFeedback('Capture failed', 'error');
        }
    }

    handleCapturedImage(file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result;
            this.state.capturedImage = base64;
            this.state.showPreview = true;
            this.handleCloseCamera();
            this.renderPreview();
        };
        reader.readAsDataURL(file);
    }

    handleCloseCamera() {
        this.state.cameraOpen = false;
        this.stopCamera();

        if (this.cameraOverlayElement) {
            this.cameraOverlayElement.remove();
            this.cameraOverlayElement = null;
        }
    }

    renderPreview() {
        if (!this.state.showPreview || !this.state.capturedImage) return;

        const preview = document.createElement('div');
        preview.className = 'card-scanner-preview';

        const title = document.createElement('div');
        title.className = 'card-scanner-preview-title';
        title.textContent = 'ID Card Captured';

        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-scanner-preview-image';

        const img = document.createElement('img');
        img.src = this.state.capturedImage;
        img.alt = 'Captured ID';

        imageContainer.appendChild(img);

        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'card-scanner-preview-buttons';

        const retakeBtn = document.createElement('button');
        retakeBtn.className = 'card-scanner-preview-button retake';
        retakeBtn.textContent = 'Retake';
        retakeBtn.addEventListener('click', () => this.handleRetake());

        const uploadBtn = document.createElement('button');
        uploadBtn.className = 'card-scanner-preview-button upload';
        uploadBtn.textContent = 'Upload ID';
        uploadBtn.addEventListener('click', () => this.handleUploadCaptured());

        buttonContainer.appendChild(retakeBtn);
        buttonContainer.appendChild(uploadBtn);

        preview.appendChild(title);
        preview.appendChild(imageContainer);
        preview.appendChild(buttonContainer);

        document.body.appendChild(preview);
        this.previewElement = preview;
    }

    handleRetake() {
        this.state.capturedImage = null;
        this.state.showPreview = false;

        if (this.previewElement) {
            this.previewElement.remove();
            this.previewElement = null;
        }

        setTimeout(() => {
            this.handleTakePhoto();
        }, 100);
    }

    async handleUploadCaptured() {
        if (!this.state.capturedImage) return;

        try {
            const response = await fetch(this.state.capturedImage);
            const blob = await response.blob();
            const file = new File([blob], 'captured-id.jpg', { type: 'image/jpeg' });

            await this.handleImageUpload(file);

            this.state.capturedImage = null;
            this.state.showPreview = false;

            if (this.previewElement) {
                this.previewElement.remove();
                this.previewElement = null;
            }

            this.showFeedback('ID uploaded successfully!', 'success');
        } catch (error) {
            this.showFeedback('Upload failed', 'error');
            this.config.onError?.(error);
        }
    }

    showFeedback(message, type) {
        window.dispatchEvent(
            new CustomEvent('showCameraFeedback', {
                detail: { message, type }
            })
        );
    }

    updateCountdownDisplay() {
        if (this.countdownElement) {
            if (this.state.countdown) {
                this.countdownElement.textContent = this.state.countdown;
                this.countdownElement.classList.add('show');
            } else {
                this.countdownElement.classList.remove('show');
            }
        }
    }

    updateFeedbackDisplay() {
        if (this.feedbackElement) {
            if (this.state.feedback) {
                this.feedbackElement.textContent = this.state.feedback.message;
                this.feedbackElement.className = `card-scanner-feedback show ${this.state.feedback.type}`;
            } else {
                this.feedbackElement.className = 'card-scanner-feedback';
            }
        }
    }

    updateGuidanceText() {
        if (this.guidanceElement) {
            this.guidanceElement.textContent = this.dynamicGuidance || this.baseGuidance;
        }
    }

    updateOverlayState() {
        if (this.overlayElement) {
            this.overlayElement.className = 'card-scanner-overlay';
            if (this.state.isAnalyzing) {
                this.overlayElement.classList.add('analyzing');
            }
            if (this.state.isReady) {
                this.overlayElement.classList.add('ready');
            }
        }

        if (this.captureButtonElement) {
            if (this.state.isReady) {
                this.captureButtonElement.classList.add('active');
            } else {
                this.captureButtonElement.classList.remove('active');
            }
        }
    }

    // Public methods
    getValue() {
        return this.state.value;
    }

    setValue(value) {
        this.state.value = value;
        this.render();
    }

    reset() {
        this.state.value = null;
        this.render();
    }

    disable() {
        this.config.disabled = true;
        this.render();
    }

    enable() {
        this.config.disabled = false;
        this.render();
    }

    destroy() {
        // Clean up event listeners
        window.removeEventListener('showCountdown', this.handleCountdown);
        window.removeEventListener('hideCountdown', this.handleHideCountdown);
        window.removeEventListener('showCameraFeedback', this.handleFeedback);

        // Stop camera and detection
        this.stopCamera();

        // Clean up timeouts
        if (this.countdownTimeoutRef) {
            clearTimeout(this.countdownTimeoutRef);
        }

        // Remove DOM elements
        if (this.cameraOverlayElement) {
            this.cameraOverlayElement.remove();
        }
        if (this.previewElement) {
            this.previewElement.remove();
        }
        if (this.state.dropdownAnchorEl) {
            this.state.dropdownAnchorEl.remove();
        }

        // Clear container
        this.container.innerHTML = '';
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardScanner;
}

if (typeof window !== 'undefined') {
    window.CardScanner = CardScanner;
}

// AMD support
if (typeof define === 'function' && define.amd) {
    define([], () => CardScanner);
}
