# Smart ID Scanner

A complete vanilla JavaScript ID card scanner with camera integration, auto-capture, and smart detection features. No dependencies required!

## ✨ Features

-   📱 **Mobile-First Design** - Optimized for mobile devices with responsive UI
-   📷 **Camera Integration** - Direct camera access with environment-facing camera support
-   🎯 **Auto-Capture** - Intelligent ID card detection with automatic capture
-   🔍 **Smart Detection** - Advanced algorithms to detect ID cards in real-time
-   🖼️ **Image Processing** - Built-in compression and optimization
-   🎨 **Customizable UI** - Flexible theming and configuration options
-   📱 **Touch-Friendly** - Optimized for touch devices with haptic feedback
-   🌐 **Cross-Platform** - Works on all modern browsers and devices
-   📦 **Zero Dependencies** - Pure vanilla JavaScript, no external libraries

## 🚀 Installation

### NPM

```bash
npm install smart-id-scanner
```

### Yarn

```bash
yarn add smart-id-scanner
```

### CDN

```html
<script src="https://unpkg.com/smart-id-scanner@latest/dist/index.js"></script>
```

## 📖 Usage

### Basic Usage

```html
<!DOCTYPE html>
<html>
    <head>
        <title>ID Scanner Demo</title>
    </head>
    <body>
        <div id="scanner-container"></div>

        <script src="smart-id-scanner/dist/index.js"></script>
        <script>
            const scanner = new CardScanner('#scanner-container', {
                label: 'Upload ID Card',
                required: true,
                onFileChange: (file) => {
                    console.log('File uploaded:', file);
                },
                onSuccess: (message) => {
                    console.log('Success:', message);
                },
                onError: (error) => {
                    console.error('Error:', error);
                }
            });
        </script>
    </body>
</html>
```

### ES6 Module

```javascript
import CardScanner from 'smart-id-scanner';

const scanner = new CardScanner('#scanner-container', {
    enableAutoCapture: true,
    themeColor: '#1976d2'
});
```

### Advanced Configuration

```javascript
const scanner = new CardScanner('#scanner-container', {
    // Basic settings
    label: 'Upload ID Card',
    required: true,
    disabled: false,

    // Display options
    showLabel: true,
    showImage: true,
    showButton: true,
    showIcon: true,

    // Camera features
    enableGallery: true,
    enableAutoCapture: true,

    // Styling
    themeColor: '#1976d2',

    // File handling
    maxFileSize: 100000, // 100KB
    compressionOptions: {
        maxSizeMB: 0.05,
        maxWidthOrHeight: 1280,
        useWebWorker: true
    },

    // Callbacks
    onFileChange: (file) => {
        console.log('File changed:', file);
    },
    onCancel: () => {
        console.log('Upload cancelled');
    },
    onError: (error) => {
        console.error('Error occurred:', error);
    },
    onSuccess: (message) => {
        console.log('Success:', message);
    }
});
```

## 🎛️ Configuration Options

| Option               | Type    | Default          | Description                               |
| -------------------- | ------- | ---------------- | ----------------------------------------- |
| `label`              | string  | 'Upload ID Card' | Label text for the scanner                |
| `required`           | boolean | false            | Whether the field is required             |
| `disabled`           | boolean | false            | Whether the scanner is disabled           |
| `showLabel`          | boolean | true             | Show/hide the label                       |
| `showImage`          | boolean | true             | Show/hide the uploaded image              |
| `showButton`         | boolean | true             | Show/hide the upload button               |
| `showIcon`           | boolean | true             | Show/hide the upload icon                 |
| `enableGallery`      | boolean | true             | Enable gallery file selection             |
| `enableAutoCapture`  | boolean | true             | Enable automatic ID detection and capture |
| `themeColor`         | string  | '#1976d2'        | Primary theme color                       |
| `maxFileSize`        | number  | 100000           | Maximum file size in bytes                |
| `compressionOptions` | object  | See below        | Image compression settings                |

### Compression Options

```javascript
compressionOptions: {
    maxSizeMB: 0.05,        // Maximum file size in MB
    maxWidthOrHeight: 1280, // Maximum width/height in pixels
    useWebWorker: true      // Use web worker for compression
}
```

## 🔧 API Methods

### Instance Methods

#### `getValue()`

Returns the current uploaded file data.

```javascript
const fileData = scanner.getValue();
// Returns: { file: 'base64string', name: 'filename.jpg', type: 'image/jpeg' }
```

#### `setValue(value)`

Sets the scanner value programmatically.

```javascript
scanner.setValue({
    file: 'base64string',
    name: 'id-card.jpg',
    type: 'image/jpeg'
});
```

#### `reset()`

Clears the current value and resets the scanner.

```javascript
scanner.reset();
```

#### `disable()`

Disables the scanner.

```javascript
scanner.disable();
```

#### `enable()`

Enables the scanner.

```javascript
scanner.enable();
```

#### `destroy()`

Destroys the scanner instance and cleans up resources.

```javascript
scanner.destroy();
```

## 📱 Mobile Features

### Camera Access

-   **Environment Camera**: Automatically uses the back camera on mobile devices
-   **Touch Controls**: Optimized touch interface for mobile devices
-   **Haptic Feedback**: Vibration feedback on supported devices
-   **Responsive Design**: Adapts to different screen sizes

### Auto-Capture

-   **Smart Detection**: Uses computer vision to detect ID cards
-   **Stability Check**: Ensures the card is stable before capture
-   **Countdown Timer**: Visual countdown before auto-capture
-   **Quality Assessment**: Analyzes image quality in real-time

## 🎨 Customization

### CSS Customization

The scanner includes comprehensive CSS that can be overridden:

```css
.card-scanner-button {
    background-color: #your-color;
    border-radius: 12px;
    font-weight: bold;
}

.card-scanner-overlay {
    border-color: #your-color;
    box-shadow: 0 0 20px rgba(your-color, 0.6);
}
```

### Theme Colors

```javascript
const scanner = new CardScanner('#container', {
    themeColor: '#ff6b6b' // Custom theme color
});
```

## 🌐 Browser Support

-   ✅ Chrome 60+
-   ✅ Firefox 55+
-   ✅ Safari 11+
-   ✅ Edge 79+
-   ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📦 Build & Development

### Install Dependencies

```bash
npm install
```

### Build Package

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Clean Build

```bash
npm run clean
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

-   Built with vanilla JavaScript for maximum compatibility
-   Inspired by modern mobile document scanning apps
-   Designed for accessibility and user experience

## 📞 Support

If you have any questions or need help, please:

1. Check the [documentation](https://github.com/ayushraval24/smart-id-scanner#readme)
2. Search [existing issues](https://github.com/ayushraval24/smart-id-scanner/issues)
3. Create a [new issue](https://github.com/ayushraval24/smart-id-scanner/issues/new)

---

Made with ❤️ by [Ayush Raval](https://github.com/ayushraval24)
