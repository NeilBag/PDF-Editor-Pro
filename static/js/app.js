// Global variables
let currentPdf = null;
let currentPages = [];
let selectedPage = 1;
let editMode = false;
let textBlocks = [];
let selectedTextBlock = null;

// DOM elements
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const pdfContainer = document.getElementById('pdfContainer');
const pagesList = document.getElementById('pagesList');
const loadingOverlay = document.getElementById('loadingOverlay');

// Tool buttons
const addTextBtn = document.getElementById('addTextBtn');
const editTextBtn = document.getElementById('editTextBtn');
const extractTextBtn = document.getElementById('extractTextBtn');
const ocrBtn = document.getElementById('ocrBtn');
const splitPdfBtn = document.getElementById('splitPdfBtn');
const mergePdfBtn = document.getElementById('mergePdfBtn');
const downloadBtn = document.getElementById('downloadBtn');
const convertToWordBtn = document.getElementById('convertToWordBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});

function setupEventListeners() {
    // File upload
    uploadBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileUpload);
    
    // Tool buttons
    addTextBtn.addEventListener('click', () => openModal('addTextModal'));
    editTextBtn.addEventListener('click', toggleEditMode);
    extractTextBtn.addEventListener('click', extractText);
    ocrBtn.addEventListener('click', performOCR);
    splitPdfBtn.addEventListener('click', () => openModal('splitModal'));
    downloadBtn.addEventListener('click', downloadCurrentPdf);
    convertToWordBtn.addEventListener('click', convertToWord);
    
    // Modal close on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Drag and drop
    setupDragAndDrop();
}

function setupDragAndDrop() {
    const dropZone = pdfContainer;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight(e) {
        dropZone.classList.add('drag-over');
    }
    
    function unhighlight(e) {
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFileUpload({ target: { files: files } });
        }
    }
}

async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/pdf') {
        showToast('Please select a PDF file', 'error');
        return;
    }
    
    showLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentPdf = result.filename;
            showToast('PDF uploaded successfully!', 'success');
            await loadPdfPreview(result.filename);
            enableTools();
        } else {
            showToast(result.error || 'Upload failed', 'error');
        }
    } catch (error) {
        showToast('Upload failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadPdfPreview(filename) {
    showLoading(true);
    
    try {
        // Add cache-busting parameter to ensure fresh preview
        const timestamp = new Date().getTime();
        const response = await fetch(`/preview/${filename}?t=${timestamp}`);
        const result = await response.json();
        
        if (result.success) {
            currentPages = result.pages;
            displayPdfPages(result.pages);
            updatePagesList(result.pages);
            
            // Log success for debugging
            console.log(`Preview loaded for ${filename} with ${result.pages.length} pages`);
        } else {
            showToast(result.error || 'Failed to load PDF preview', 'error');
            console.error('Preview failed:', result.error);
        }
    } catch (error) {
        showToast('Failed to load PDF: ' + error.message, 'error');
        console.error('Preview error:', error);
    } finally {
        showLoading(false);
    }
}

function displayPdfPages(pages) {
    pdfContainer.innerHTML = '';
    
    pages.forEach((page, index) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'pdf-page';
        
        if (page.image) {
            let pageContent = `
                <div class="page-number">Page ${page.page_num}</div>
                <img src="${page.image}" alt="Page ${page.page_num}" 
                     data-page="${page.page_num}" 
                     onclick="selectPage(${page.page_num})"
                     onload="handleImageLoad(this)">
            `;
            
            // Add indicator for image-based PDFs
            if (page.is_image_based) {
                pageContent += `
                    <div class="ocr-indicator">
                        <i class="fas fa-camera"></i> Image-based PDF
                    </div>
                `;
            }
            
            pageDiv.innerHTML = pageContent;
        } else {
            // Handle pages that failed to render
            pageDiv.innerHTML = `
                <div class="page-number">Page ${page.page_num}</div>
                <div class="page-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to render page</p>
                    <p class="error-detail">${page.error || 'Unknown error'}</p>
                </div>
            `;
        }
        
        pdfContainer.appendChild(pageDiv);
    });
    
    // If in edit mode, refresh text overlays after images load
    if (editMode) {
        setTimeout(() => {
            displayTextOverlays();
        }, 200);
    }
}

function handleImageLoad(img) {
    // Add a subtle animation to show the image has loaded
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
        img.style.opacity = '1';
    }, 50);
}

function showUpdatedIndicator(pageNum) {
    // Find the specific page and add an "updated" indicator
    const pageDiv = document.querySelector(`[data-page="${pageNum}"]`)?.closest('.pdf-page');
    if (pageDiv) {
        const indicator = document.createElement('div');
        indicator.className = 'updated-indicator';
        indicator.innerHTML = '<i class="fas fa-check"></i> Updated';
        
        // Position it relative to the page
        pageDiv.style.position = 'relative';
        pageDiv.appendChild(indicator);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (indicator.parentElement) {
                indicator.remove();
            }
        }, 3000);
    }
}

function updatePagesList(pages) {
    pagesList.innerHTML = '';
    
    pages.forEach(page => {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        pageItem.innerHTML = `Page ${page.page_num}`;
        pageItem.onclick = () => selectPage(page.page_num);
        pagesList.appendChild(pageItem);
    });
}

function selectPage(pageNum) {
    selectedPage = pageNum;
    
    // Update page list selection
    document.querySelectorAll('.page-item').forEach((item, index) => {
        item.classList.toggle('active', index + 1 === pageNum);
    });
    
    // Scroll to page
    const pageElement = document.querySelector(`[data-page="${pageNum}"]`);
    if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Update form inputs
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        pageInput.value = pageNum;
        pageInput.max = currentPages.length;
    }
}

function enableTools() {
    addTextBtn.disabled = false;
    editTextBtn.disabled = false;
    extractTextBtn.disabled = false;
    ocrBtn.disabled = false;
    splitPdfBtn.disabled = false;
    downloadBtn.disabled = false;
    convertToWordBtn.disabled = false;
}

// TEXT EDITING FUNCTIONALITY
async function toggleEditMode() {
    if (!currentPdf) return;
    
    editMode = !editMode;
    
    if (editMode) {
        editTextBtn.innerHTML = '<i class="fas fa-times"></i> Exit Edit';
        editTextBtn.style.background = '#e53e3e';
        showEditModeIndicator();
        await loadTextBlocks();
        displayTextOverlays();
    } else {
        editTextBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Text';
        editTextBtn.style.background = '';
        removeTextOverlays();
        selectedTextBlock = null;
    }
    
    document.body.classList.toggle('edit-mode', editMode);
}

function showEditModeIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'edit-mode-indicator';
    indicator.innerHTML = 'Click on any text to edit it';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 3000);
}

async function loadTextBlocks() {
    if (!currentPdf) return;
    
    showLoading(true);
    
    try {
        const response = await fetch(`/get_text_blocks/${currentPdf}`);
        const result = await response.json();
        
        if (result.success) {
            textBlocks = result.pages_blocks;
        } else {
            showToast(result.error || 'Failed to load text blocks', 'error');
        }
    } catch (error) {
        showToast('Failed to load text blocks: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayTextOverlays() {
    removeTextOverlays();
    
    const pdfPages = document.querySelectorAll('.pdf-page');
    
    pdfPages.forEach((pageDiv, pageIndex) => {
        const img = pageDiv.querySelector('img');
        if (!img || !textBlocks[pageIndex]) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'text-overlay';
        
        // Calculate scale factors based on actual image dimensions vs PDF dimensions
        const imgRect = img.getBoundingClientRect();
        const imgWidth = img.offsetWidth;
        const imgHeight = img.offsetHeight;
        
        // Get the maximum coordinates from text blocks to determine PDF dimensions
        let maxX = 0, maxY = 0;
        textBlocks[pageIndex].blocks.forEach(block => {
            maxX = Math.max(maxX, block.bbox[2]);
            maxY = Math.max(maxY, block.bbox[3]);
        });
        
        const scaleX = imgWidth / maxX;
        const scaleY = imgHeight / maxY;
        
        textBlocks[pageIndex].blocks.forEach((block, blockIndex) => {
            if (!block.text.trim()) return;
            
            const textDiv = document.createElement('div');
            textDiv.className = 'text-block';
            textDiv.style.left = (block.bbox[0] * scaleX) + 'px';
            textDiv.style.top = (block.bbox[1] * scaleY) + 'px';
            textDiv.style.width = ((block.bbox[2] - block.bbox[0]) * scaleX) + 'px';
            textDiv.style.height = ((block.bbox[3] - block.bbox[1]) * scaleY) + 'px';
            textDiv.title = block.text; // Show text on hover
            
            textDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                selectTextBlock(pageIndex + 1, blockIndex, block);
            });
            
            overlay.appendChild(textDiv);
        });
        
        pageDiv.appendChild(overlay);
    });
}

function removeTextOverlays() {
    document.querySelectorAll('.text-overlay').forEach(overlay => {
        overlay.remove();
    });
}

function selectTextBlock(pageNum, blockIndex, block) {
    if (!editMode) return;
    
    // Remove previous selection
    document.querySelectorAll('.text-block.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select current block
    event.target.classList.add('selected');
    
    selectedTextBlock = {
        pageNum: pageNum,
        blockIndex: blockIndex,
        block: block
    };
    
    // Open edit modal
    openEditTextModal(block, pageNum);
}

function openEditTextModal(block, pageNum) {
    document.getElementById('originalText').value = block.text;
    document.getElementById('newTextInput').value = block.text;
    document.getElementById('editPageNum').textContent = pageNum;
    
    // Display font information
    displayFontInfo(block);
    
    // Store the original block data for later use
    selectedTextBlock.originalFontInfo = {
        font: block.font,
        size: block.size,
        flags: block.flags,
        color: block.color
    };
    
    openModal('editTextModal');
}

function displayFontInfo(block) {
    // Display font name
    const fontName = block.font || 'Unknown';
    document.getElementById('fontName').textContent = fontName;
    
    // Display font size
    const fontSize = block.size || 12;
    document.getElementById('fontSize').textContent = Math.round(fontSize);
    
    // Determine font style based on flags
    let fontStyle = 'Regular';
    if (block.flags) {
        const flags = block.flags;
        const styles = [];
        
        if (flags & (1 << 4)) styles.push('Bold');
        if (flags & (1 << 6)) styles.push('Italic');
        if (flags & (1 << 2)) styles.push('Underline');
        
        if (styles.length > 0) {
            fontStyle = styles.join(', ');
        }
    }
    
    document.getElementById('fontStyle').textContent = fontStyle;
}

async function updateText() {
    if (!selectedTextBlock) return;
    
    const newText = document.getElementById('newTextInput').value;
    const originalText = document.getElementById('originalText').value;
    
    if (newText === originalText) {
        closeModal('editTextModal');
        return;
    }
    
    showLoading(true);
    closeModal('editTextModal');
    
    try {
        const preserveFormatting = document.getElementById('preserveFormatting').checked;
        
        const requestBody = {
            filename: currentPdf,
            page_num: selectedTextBlock.pageNum,
            old_text: originalText,
            new_text: newText,
            bbox: selectedTextBlock.block.bbox,
            preserve_formatting: preserveFormatting
        };
        
        // Include font information if preserving formatting
        if (preserveFormatting && selectedTextBlock.originalFontInfo) {
            requestBody.font_info = selectedTextBlock.originalFontInfo;
        }
        
        const response = await fetch('/edit_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update current PDF reference
            currentPdf = result.modified_filename;
            const message = preserveFormatting ? 
                'Text updated with original formatting preserved!' : 
                'Text updated successfully!';
            showToast(message, 'success');
            
            // Store the edited page number for indicator
            const editedPageNum = selectedTextBlock.pageNum;
            
            // Force reload the PDF preview with the edited content
            await loadPdfPreview(currentPdf);
            
            // Show updated indicator on the edited page
            setTimeout(() => {
                showUpdatedIndicator(editedPageNum);
            }, 300);
            
            // If in edit mode, refresh the text blocks for the new file
            if (editMode) {
                // Reset edit mode state
                editMode = false;
                editTextBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Text';
                editTextBtn.style.background = '';
                removeTextOverlays();
                selectedTextBlock = null;
                document.body.classList.remove('edit-mode');
                
                // Re-enter edit mode with updated content
                setTimeout(async () => {
                    await toggleEditMode();
                }, 500); // Small delay to ensure preview is loaded
            }
        } else {
            showToast(result.error || 'Failed to update text', 'error');
        }
    } catch (error) {
        showToast('Failed to update text: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteText() {
    if (!selectedTextBlock) return;
    
    showLoading(true);
    closeModal('editTextModal');
    
    try {
        const response = await fetch('/edit_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: currentPdf,
                page_num: selectedTextBlock.pageNum,
                old_text: selectedTextBlock.block.text,
                new_text: '', // Empty string to delete
                bbox: selectedTextBlock.block.bbox,
                preserve_formatting: false // Not relevant for deletion
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update current PDF reference
            currentPdf = result.modified_filename;
            showToast('Text deleted successfully!', 'success');
            
            // Store the edited page number for indicator
            const editedPageNum = selectedTextBlock.pageNum;
            
            // Force reload the PDF preview with the edited content
            await loadPdfPreview(currentPdf);
            
            // Show updated indicator on the edited page
            setTimeout(() => {
                showUpdatedIndicator(editedPageNum);
            }, 300);
            
            // If in edit mode, refresh the text blocks for the new file
            if (editMode) {
                // Reset edit mode state
                editMode = false;
                editTextBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Text';
                editTextBtn.style.background = '';
                removeTextOverlays();
                selectedTextBlock = null;
                document.body.classList.remove('edit-mode');
                
                // Re-enter edit mode with updated content
                setTimeout(async () => {
                    await toggleEditMode();
                }, 500); // Small delay to ensure preview is loaded
            }
        } else {
            showToast(result.error || 'Failed to delete text', 'error');
        }
    } catch (error) {
        showToast('Failed to delete text: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// OTHER PDF OPERATIONS
async function addText() {
    const text = document.getElementById('textInput').value;
    const page = parseInt(document.getElementById('pageInput').value);
    const fontSize = parseInt(document.getElementById('fontSizeInput').value);
    const x = parseInt(document.getElementById('xInput').value);
    const y = parseInt(document.getElementById('yInput').value);
    
    if (!text.trim()) {
        showToast('Please enter text to add', 'warning');
        return;
    }
    
    showLoading(true);
    closeModal('addTextModal');
    
    try {
        const response = await fetch('/add_text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: currentPdf,
                page_num: page,
                text: text,
                x: x,
                y: y,
                font_size: fontSize
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Update current PDF reference
            currentPdf = result.modified_filename;
            showToast('Text added successfully!', 'success');
            
            // Force reload the PDF preview with the new text
            await loadPdfPreview(currentPdf);
            
            // Clear form
            document.getElementById('textInput').value = '';
            
            // If in edit mode, refresh the text blocks for the new file
            if (editMode) {
                // Reset and refresh edit mode
                editMode = false;
                editTextBtn.innerHTML = '<i class="fas fa-edit"></i> Edit Text';
                editTextBtn.style.background = '';
                removeTextOverlays();
                selectedTextBlock = null;
                document.body.classList.remove('edit-mode');
                
                // Re-enter edit mode with updated content
                setTimeout(async () => {
                    await toggleEditMode();
                }, 500);
            }
        } else {
            showToast(result.error || 'Failed to add text', 'error');
        }
    } catch (error) {
        showToast('Failed to add text: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function extractText() {
    if (!currentPdf) return;
    
    showLoading(true);
    
    try {
        // First try regular text extraction
        const response = await fetch(`/extract_text/${currentPdf}`);
        const result = await response.json();
        
        if (result.success) {
            // Check if any pages have meaningful text (more than just whitespace)
            const hasText = result.pages_text.some(page => 
                page.text && page.text.trim().length > 10
            );
            
            if (!hasText) {
                // Try basic OCR/image handling if no text found
                showToast('No text found. Checking for image-based content...', 'info');
                const ocrResponse = await fetch(`/ocr_text/${currentPdf}`);
                const ocrResult = await ocrResponse.json();
                
                if (ocrResult.success) {
                    displayExtractedText(ocrResult.pages_text, false);
                    openModal('textModal');
                    if (ocrResult.message) {
                        showToast(ocrResult.message, 'info');
                    }
                } else {
                    showToast(ocrResult.error || 'Text extraction failed', 'error');
                }
            } else {
                displayExtractedText(result.pages_text);
                openModal('textModal');
            }
        } else {
            showToast(result.error || 'Failed to extract text', 'error');
        }
    } catch (error) {
        showToast('Failed to extract text: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function displayExtractedText(pagesText, isOcr = false) {
    const container = document.getElementById('extractedText');
    container.innerHTML = '';
    
    if (isOcr) {
        const ocrNotice = document.createElement('div');
        ocrNotice.className = 'ocr-notice';
        ocrNotice.innerHTML = `
            <i class="fas fa-robot"></i>
            <span>Text extracted using OCR (Optical Character Recognition). Accuracy may vary.</span>
        `;
        container.appendChild(ocrNotice);
    }
    
    pagesText.forEach(page => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'text-page';
        
        let methodIndicator = '';
        if (page.method === 'ocr') {
            methodIndicator = '<span class="method-indicator ocr">OCR</span>';
        } else if (page.method === 'ocr_failed') {
            methodIndicator = '<span class="method-indicator error">OCR Failed</span>';
        }
        
        pageDiv.innerHTML = `
            <h4>Page ${page.page_num} ${methodIndicator}</h4>
            <pre>${page.text || 'No text found on this page'}</pre>
        `;
        container.appendChild(pageDiv);
    });
}

async function performOCR() {
    if (!currentPdf) return;
    
    showLoading(true);
    showToast('Checking document for text content...', 'info');
    
    try {
        const response = await fetch(`/ocr_text/${currentPdf}`);
        const result = await response.json();
        
        if (result.success) {
            displayExtractedText(result.pages_text, result.ocr_used || false);
            openModal('textModal');
            
            if (result.message) {
                showToast(result.message, 'info');
            } else {
                showToast('Text extraction completed!', 'success');
            }
        } else {
            showToast(result.error || 'Text extraction failed', 'error');
        }
    } catch (error) {
        showToast('Text extraction failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function splitPdf() {
    const startPage = parseInt(document.getElementById('startPageInput').value);
    const endPage = parseInt(document.getElementById('endPageInput').value);
    
    if (startPage < 1 || startPage > currentPages.length) {
        showToast('Invalid start page', 'warning');
        return;
    }
    
    if (endPage && (endPage < startPage || endPage > currentPages.length)) {
        showToast('Invalid end page', 'warning');
        return;
    }
    
    showLoading(true);
    closeModal('splitModal');
    
    try {
        const response = await fetch('/split_pdf', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename: currentPdf,
                start_page: startPage,
                end_page: endPage
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('PDF split successfully!', 'success');
            // Optionally load the split PDF
            currentPdf = result.split_filename;
            await loadPdfPreview(currentPdf);
        } else {
            showToast(result.error || 'Failed to split PDF', 'error');
        }
    } catch (error) {
        showToast('Failed to split PDF: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function downloadCurrentPdf() {
    if (!currentPdf) return;
    
    const link = document.createElement('a');
    link.href = `/download/${currentPdf}`;
    link.download = currentPdf;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Download started!', 'success');
}

async function convertToWord() {
    if (!currentPdf) return;
    
    showLoading(true);
    showToast('Converting PDF to Word... This may take a moment.', 'info');
    
    try {
        const response = await fetch(`/convert_to_word/${currentPdf}`);
        const result = await response.json();
        
        if (result.success) {
            showToast(`PDF converted successfully! Processed ${result.pages_processed} pages.`, 'success');
            
            // Automatically download the Word document
            const link = document.createElement('a');
            link.href = `/download/${result.word_filename}`;
            link.download = result.word_filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            showToast('Word document download started!', 'success');
        } else {
            showToast(result.error || 'PDF to Word conversion failed', 'error');
        }
    } catch (error) {
        showToast('PDF to Word conversion failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function copyText() {
    const textContent = document.getElementById('extractedText').innerText;
    navigator.clipboard.writeText(textContent).then(() => {
        showToast('Text copied to clipboard!', 'success');
    }).catch(() => {
        showToast('Failed to copy text', 'error');
    });
}

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    
    // Set default values for split modal
    if (modalId === 'splitModal' && currentPages.length > 0) {
        document.getElementById('startPageInput').max = currentPages.length;
        document.getElementById('endPageInput').max = currentPages.length;
        document.getElementById('endPageInput').value = currentPages.length;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
}

// Utility functions
function showLoading(show) {
    loadingOverlay.classList.toggle('active', show);
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 
                 'fa-exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    document.getElementById('toastContainer').appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'o':
                e.preventDefault();
                fileInput.click();
                break;
            case 's':
                e.preventDefault();
                if (currentPdf) downloadCurrentPdf();
                break;
        }
    }
    
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            closeModal(modal.id);
        });
    }
});