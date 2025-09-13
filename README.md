# PDF Editor Pro

A modern, full-featured PDF editor web application built with Flask and vanilla JavaScript. This application provides comprehensive PDF editing capabilities with a sleek, responsive user interface and advanced text manipulation features.

## 🎯 Features

### Core Functionality
- **PDF Upload & Preview**: Drag-and-drop or click to upload PDF files with instant high-resolution preview
- **Interactive Text Editing**: Select and edit existing text directly within PDF pages
- **Smart Text Addition**: Click-to-position text placement with visual feedback
- **Advanced Text Extraction**: Extract all text content from PDF pages with intelligent fallback methods
- **PDF Splitting**: Split PDFs by page range to create smaller documents
- **PDF Merging**: Combine multiple PDF files into a single document
- **Intelligent Download**: Save edited PDFs with descriptive filenames

### User Interface
- **Modern Glassmorphism Design**: Clean, gradient-based UI with backdrop blur effects
- **Fully Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive PDF Viewer**: Click on pages to select them, visual text overlays for editing
- **Real-time Feedback**: Toast notifications, loading indicators, and progress messages
- **Keyboard Shortcuts**: Ctrl+O to upload, Ctrl+S to download, Escape to close modals
- **Visual Text Selection**: Hover effects and selection highlighting for precise editing

### Advanced Technical Features
- **High-Quality Rendering**: PDF pages rendered at 1.5x resolution for crisp display
- **Intelligent Text Detection**: Automatic detection of text blocks with precise positioning
- **Coordinate System Conversion**: Seamless conversion between screen and PDF coordinate systems
- **Multi-folder File Management**: Automatic handling of uploaded and processed files
- **Session State Management**: Maintains current PDF state across all operations
- **Comprehensive Error Handling**: Graceful error recovery with detailed user feedback
- **File Security**: UUID-based unique filenames and proper validation

## 🚀 Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)
- Modern web browser (Chrome 60+, Firefox 55+, Safari 12+, Edge 79+)

### Quick Start

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**:
   ```bash
   python app.py
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5000`

## 📦 Dependencies

### Backend (Python)
- **Flask 2.3.3**: Lightweight web framework for the REST API
- **Flask-CORS 4.0.0**: Cross-origin resource sharing support
- **PyPDF2 3.0.1**: PDF manipulation and processing (splitting, merging)
- **PyMuPDF 1.23.5**: High-performance PDF rendering and text extraction
- **ReportLab 4.0.4**: PDF generation and advanced text insertion
- **Pillow 10.0.0**: Image processing and format conversion
- **Werkzeug 2.3.7**: Secure filename handling and utilities

### Frontend
- **Vanilla JavaScript**: No external frameworks for maximum performance
- **CSS3**: Modern styling with flexbox, grid, and animations
- **Font Awesome 6.0.0**: Professional icon library
- **HTML5**: Semantic markup with drag-and-drop API

## 🏗️ Project Structure

```
pdf-editor-pro/
├── app.py                    # Main Flask application with all endpoints
├── requirements.txt          # Python dependencies
├── test_endpoints.py         # Endpoint testing utility
├── README.md                # Comprehensive documentation
├── templates/
│   └── index.html           # Single-page application template
├── static/
│   ├── css/
│   │   └── style.css        # Modern CSS with glassmorphism effects
│   └── js/
│       └── app.js           # Complete frontend application logic
├── uploads/                 # Original uploaded PDF files (auto-created)
├── processed/               # Modified PDF files (auto-created)
└── static/temp/             # Temporary processing files (auto-created)
```

## 🎮 Usage Guide

### PDF Upload
1. **Drag & Drop**: Simply drag a PDF file onto the interface
2. **Click Upload**: Use the "Upload PDF" button to browse and select files
3. **Automatic Processing**: Files are validated, renamed with UUIDs, and processed
4. **Instant Preview**: High-resolution page thumbnails appear immediately

### Interactive Text Editing
1. **Enter Edit Mode**: Click the "Edit Text" button (turns red when active)
2. **Visual Overlays**: Transparent rectangles appear over all selectable text
3. **Select Text**: Click any text area to open the edit modal
4. **Edit Options**:
   - **Update**: Modify the text content
   - **Delete**: Remove the text completely
   - **Cancel**: Exit without changes
5. **Auto-Refresh**: PDF updates automatically with your changes
6. **Exit Edit Mode**: Click "Exit Edit" to return to normal view

### Smart Text Addition
1. **Open Modal**: Click "Add Text" to open the text addition dialog
2. **Click Positioning**: Click anywhere on a PDF page to set text position
3. **Visual Feedback**: Red dot appears showing exact placement
4. **Configure Text**:
   - Enter your text content
   - Adjust font size (8-72pt)
   - Select text color with color picker
   - Fine-tune X/Y coordinates manually
5. **Apply Changes**: Text appears exactly where you clicked

### Text Extraction
1. **Extract All Text**: Click "Extract Text" to get all text content
2. **Page Organization**: Text is organized by page with clear headers
3. **Copy Functionality**: Use "Copy All" to copy text to clipboard
4. **Fallback Methods**: Automatic fallback for difficult-to-extract PDFs

### PDF Operations
- **Split PDFs**: Specify page ranges to create smaller documents
- **Merge PDFs**: Combine multiple files (feature ready for implementation)
- **Download**: Save processed PDFs with descriptive filenames

## 🔧 Technical Implementation

### Backend Architecture

#### Flask Application Structure
```python
# Main application with CORS support
app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'
MAX_CONTENT_LENGTH = 16MB
```

#### Key Endpoints

**File Upload (`POST /upload`)**
- Validates PDF file type and size
- Generates UUID-based unique filenames
- Stores files in secure upload directory
- Returns success status and filename

**PDF Preview (`GET /preview/<filename>`)**
- Renders PDF pages at 1.5x resolution using PyMuPDF
- Converts pages to base64-encoded PNG images
- Returns page data with dimensions for scaling
- Handles both upload and processed folders

**Text Extraction (`GET /extract_text/<filename>`)**
- Uses PyMuPDF's advanced text extraction
- Fallback methods for problematic PDFs
- Returns structured text data by page
- Comprehensive error handling

**Text Block Detection (`GET /get_text_blocks/<filename>`)**
- Extracts text with precise bounding box coordinates
- Multiple extraction methods (dict, rawdict, simple)
- Handles edge cases and malformed PDFs
- Returns detailed text positioning data

**Text Addition (`POST /add_text`)**
- Coordinate system conversion (screen to PDF)
- Advanced text positioning with textbox insertion
- Font and color customization
- Automatic file versioning

**Text Editing (`POST /edit_text`)**
- Precise text replacement using bounding boxes
- White rectangle overlay to cover old text
- New text insertion at exact coordinates
- Maintains original formatting context

### Frontend Architecture

#### Modern JavaScript Implementation
```javascript
// Global state management
let currentPdf = null;
let currentPages = [];
let editMode = false;
let textBlocks = [];
let selectedTextBlock = null;

// Event-driven architecture
document.addEventListener('DOMContentLoaded', setupEventListeners);
```

#### Key Features

**Drag & Drop Upload**
- HTML5 drag-and-drop API implementation
- Visual feedback with hover states
- Automatic file type validation
- Progress indicators and error handling

**Interactive Text Editing**
- Dynamic overlay system for text selection
- Precise coordinate calculation and scaling
- Real-time visual feedback with hover effects
- Modal-based editing interface

**Click-to-Position Text Addition**
- Mouse event coordinate capture
- Coordinate scaling between display and PDF dimensions
- Visual click indicators with animations
- Real-time position updates in form fields

**Responsive Design System**
- CSS Grid and Flexbox layouts
- Mobile-first responsive breakpoints
- Touch-friendly interface elements
- Adaptive typography and spacing

### CSS Architecture

#### Modern Styling Approach
```css
/* Glassmorphism effects */
backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.95);

/* Smooth animations */
transition: all 0.3s ease;
transform: translateY(-2px);

/* Responsive design */
@media (max-width: 768px) { /* Mobile styles */ }
```

#### Design System
- **Color Palette**: Gradient-based with consistent opacity levels
- **Typography**: Segoe UI font stack for cross-platform consistency
- **Spacing**: 8px grid system for consistent layouts
- **Animations**: Smooth transitions and hover effects
- **Icons**: Font Awesome 6.0 for professional iconography

## 🔌 API Reference

### REST Endpoints

| Method | Endpoint | Description | Parameters |
|--------|----------|-------------|------------|
| `GET` | `/` | Main application page | None |
| `POST` | `/upload` | Upload PDF file | `file`: PDF file |
| `GET` | `/preview/<filename>` | Get page previews | `filename`: PDF filename |
| `GET` | `/extract_text/<filename>` | Extract all text | `filename`: PDF filename |
| `GET` | `/get_text_blocks/<filename>` | Get text with positions | `filename`: PDF filename |
| `POST` | `/add_text` | Add text to PDF | `filename`, `page_num`, `text`, `x`, `y`, `font_size`, `color` |
| `POST` | `/edit_text` | Edit existing text | `filename`, `page_num`, `old_text`, `new_text`, `bbox` |
| `POST` | `/split_pdf` | Split PDF by pages | `filename`, `start_page`, `end_page` |
| `GET` | `/download/<filename>` | Download processed PDF | `filename`: PDF filename |

### Response Formats

**Success Response**
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation completed successfully"
}
```

**Error Response**
```json
{
  "success": false,
  "error": "Detailed error message",
  "code": "ERROR_CODE"
}
```

## 🛡️ Security Features

### File Security
- **Type Validation**: Only PDF files accepted
- **Size Limits**: 16MB maximum file size
- **UUID Filenames**: Prevents filename conflicts and directory traversal
- **Isolated Directories**: Separate folders for uploads and processed files
- **Secure File Handling**: Werkzeug's secure_filename() for sanitization

### Input Validation
- **Parameter Validation**: All API inputs validated and sanitized
- **Coordinate Bounds**: Text positioning within page boundaries
- **File Existence Checks**: Verification before file operations
- **Error Sanitization**: No sensitive information in error messages

## 🚀 Performance Optimizations

### Backend Optimizations
- **Efficient PDF Processing**: PyMuPDF for high-performance operations
- **Memory Management**: Proper file handle cleanup and garbage collection
- **Caching Strategy**: Session-based state management
- **Error Recovery**: Graceful handling of corrupted or problematic PDFs

### Frontend Optimizations
- **Lazy Loading**: Images loaded on demand
- **Event Delegation**: Efficient event handling for dynamic content
- **Debounced Operations**: Prevents excessive API calls
- **Optimized Rendering**: CSS transforms for smooth animations

## 🧪 Testing

### Endpoint Testing
Use the included test utility:
```bash
python test_endpoints.py
```

### Manual Testing Checklist
- [ ] PDF upload (drag & drop and click)
- [ ] Page preview rendering
- [ ] Text extraction functionality
- [ ] Text editing (select, update, delete)
- [ ] Text addition with click positioning
- [ ] PDF splitting operations
- [ ] File download functionality
- [ ] Error handling and recovery
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

## 🔧 Troubleshooting

### Common Issues

**Import Errors**
```bash
# Install all dependencies
pip install -r requirements.txt

# Verify PyMuPDF installation
python -c "import fitz; print('PyMuPDF working')"
```

**File Not Found Errors**
- Check that uploaded files exist in `uploads/` directory
- Verify file permissions for read/write access
- Ensure processed files are saved to `processed/` directory

**Text Editing Issues**
- Confirm PDF contains extractable text (not just images)
- Check browser console for JavaScript errors
- Verify text block coordinates are within page bounds

**Performance Issues**
- Large PDFs (>10MB) may process slowly
- Consider splitting large documents first
- Check available system memory for processing

### Development Mode

**Debug Configuration**
```python
# Enable detailed logging
app.run(debug=True, host='0.0.0.0', port=5000)
```

**Production Deployment**
```python
# Disable debug mode
app.run(debug=False)

# Use production WSGI server
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

## 🚀 Future Enhancements

### Planned Features
- **Advanced OCR**: Tesseract integration for scanned documents
- **Image Insertion**: Add images to PDF pages
- **Form Field Editing**: Interactive PDF form manipulation
- **Digital Signatures**: Electronic signature capabilities
- **Annotation Tools**: Highlighting, comments, and markup
- **Batch Processing**: Multiple file operations
- **Cloud Storage**: Integration with cloud storage providers
- **Real-time Collaboration**: Multi-user editing capabilities

### Technical Improvements
- **WebSocket Integration**: Real-time updates and progress
- **Progressive Web App**: Offline functionality and app-like experience
- **Advanced Caching**: Redis-based caching for improved performance
- **Microservices Architecture**: Scalable service-oriented design
- **Container Deployment**: Docker and Kubernetes support

## 📄 License

This project is provided as-is for educational and development purposes. Feel free to modify, distribute, and use in your own projects.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests, report bugs, or suggest new features.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ using Flask, PyMuPDF, and modern web technologies**