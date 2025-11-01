// MergePDF - Merge PDFs and Images
let selectedFiles = [];
let fileCounter = 0;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeDropZone();
    initializeFileInput();
});

// Initialize drag and drop zone
function initializeDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    // Handle dropped files
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
        handleFiles(files);
    }
}

// Initialize file input
function initializeFileInput() {
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
}

// Handle selected files
function handleFiles(files) {
    Array.from(files).forEach(file => {
        // Validate file type
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showAlert('error', `File "${file.name}" is not a supported type. Please upload PDFs or images.`);
            return;
        }

        // Validate file size (max 50MB)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            showAlert('error', `File "${file.name}" is too large. Maximum file size is 50MB.`);
            return;
        }

        // Add file to list
        addFile(file);
    });
}

// Add file to the list
function addFile(file) {
    const fileObj = {
        id: fileCounter++,
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        order: selectedFiles.length
    };
    
    selectedFiles.push(fileObj);
    updateFileList();
    showAlert('success', `Added "${file.name}"`);
}

// Remove file from list
function removeFile(id) {
    selectedFiles = selectedFiles.filter(f => f.id !== id);
    updateFileList();
}

// Move file up in order
function moveFileUp(id) {
    const index = selectedFiles.findIndex(f => f.id === id);
    if (index > 0) {
        [selectedFiles[index], selectedFiles[index - 1]] = [selectedFiles[index - 1], selectedFiles[index]];
        updateFileList();
    }
}

// Move file down in order
function moveFileDown(id) {
    const index = selectedFiles.findIndex(f => f.id === id);
    if (index < selectedFiles.length - 1) {
        [selectedFiles[index], selectedFiles[index + 1]] = [selectedFiles[index + 1], selectedFiles[index]];
        updateFileList();
    }
}

// Update file list display
function updateFileList() {
    const fileListContainer = document.getElementById('fileListContainer');
    const fileList = document.getElementById('fileList');
    
    if (selectedFiles.length === 0) {
        fileListContainer.classList.remove('show');
        return;
    }

    fileListContainer.classList.add('show');
    fileList.innerHTML = '';

    selectedFiles.forEach((fileObj, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <div class="file-info">
                <div class="file-icon-wrapper">
                    <i class="${getFileIcon(fileObj.type)}"></i>
                </div>
                <div class="file-details">
                    <h4>${fileObj.name}</h4>
                    <span>${formatFileSize(fileObj.size)} • ${fileObj.type.includes('pdf') ? 'PDF' : 'Image'}</span>
                </div>
            </div>
            <div class="file-actions">
                <button class="btn-action" onclick="moveFileUp(${fileObj.id})" ${index === 0 ? 'disabled' : ''} title="Move Up">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="btn-action" onclick="moveFileDown(${fileObj.id})" ${index === selectedFiles.length - 1 ? 'disabled' : ''} title="Move Down">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="btn-action btn-remove" onclick="removeFile(${fileObj.id})" title="Remove">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        fileList.appendChild(fileItem);
    });
}

// Get icon for file type
function getFileIcon(type) {
    if (type.includes('pdf')) {
        return 'fas fa-file-pdf';
    }
    return 'fas fa-image';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Merge files
async function mergeFiles() {
    if (selectedFiles.length === 0) {
        showAlert('error', 'Please select at least one file to merge.');
        return;
    }

    const mergeBtn = document.getElementById('mergeBtn');
    const originalText = mergeBtn.innerHTML;
    mergeBtn.disabled = true;
    mergeBtn.innerHTML = '<span class="spinner"></span> Merging files...';

    try {
        // Create a new PDF document
        const mergedPdf = await PDFLib.PDFDocument.create();

        // Process each file in order
        for (const fileObj of selectedFiles) {
            if (fileObj.type === 'application/pdf') {
                // Handle PDF file
                await addPdfToMerged(mergedPdf, fileObj.file);
            } else {
                // Handle image file
                await addImageToMerged(mergedPdf, fileObj.file);
            }
        }

        // Save the merged PDF
        const pdfBytes = await mergedPdf.save();
        
        // Generate filename
        mergeBtn.innerHTML = '<span class="spinner"></span> Generating filename...';
        const generatedName = await generateFilename(selectedFiles);
        
        // Download with generated name
        await downloadMergedPdf(pdfBytes, selectedFiles, generatedName);

        showAlert('success', `Successfully merged ${selectedFiles.length} file(s)! Saved as "${generatedName}"`);
        
        // Reset after successful merge
        setTimeout(() => {
            selectedFiles = [];
            updateFileList();
            document.getElementById('fileInput').value = '';
        }, 2000);

    } catch (error) {
        console.error('Error merging files:', error);
        showAlert('error', `Error merging files: ${error.message}`);
    } finally {
        mergeBtn.disabled = false;
        mergeBtn.innerHTML = originalText;
    }
}

// Add PDF to merged document
async function addPdfToMerged(mergedPdf, pdfFile) {
    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await PDFLib.PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        
        pages.forEach((page) => {
            mergedPdf.addPage(page);
        });
    } catch (error) {
        console.error('Error adding PDF:', error);
        throw new Error(`Failed to add PDF "${pdfFile.name}": ${error.message}`);
    }
}

// Add image to merged document
async function addImageToMerged(mergedPdf, imageFile) {
    try {
        const arrayBuffer = await imageFile.arrayBuffer();
        let pdfImage;
        
        // Load image based on type
        if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
            pdfImage = await mergedPdf.embedJpg(arrayBuffer);
        } else if (imageFile.type === 'image/png') {
            pdfImage = await mergedPdf.embedPng(arrayBuffer);
        } else {
            // For other image types, try to convert to JPEG first
            const img = new Image();
            const imageUrl = URL.createObjectURL(imageFile);
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // Create canvas to convert to JPEG
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    canvas.toBlob(async (blob) => {
                        const arrayBuffer = await blob.arrayBuffer();
                        pdfImage = await mergedPdf.embedJpg(arrayBuffer);
                        URL.revokeObjectURL(imageUrl);
                        resolve();
                    }, 'image/jpeg');
                };
                img.onerror = reject;
                img.src = imageUrl;
            });
        }

        // Get image dimensions
        const imageDims = pdfImage.scale(1);
        
        // Add a new page with the image
        const page = mergedPdf.addPage([imageDims.width, imageDims.height]);
        page.drawImage(pdfImage, {
            x: 0,
            y: 0,
            width: imageDims.width,
            height: imageDims.height,
        });
    } catch (error) {
        console.error('Error adding image:', error);
        throw new Error(`Failed to add image "${imageFile.name}": ${error.message}`);
    }
}

// Initialize PDF.js worker
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Stop words for NLP processing
const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
    'had', 'what', 'said', 'each', 'which', 'their', 'time', 'would',
    'about', 'if', 'up', 'out', 'many', 'then', 'them', 'these', 'so',
    'some', 'her', 'would', 'make', 'like', 'into', 'him', 'has', 'two',
    'more', 'go', 'no', 'way', 'could', 'my', 'than', 'first', 'been',
    'call', 'who', 'oil', 'its', 'now', 'find', 'long', 'down', 'day',
    'did', 'get', 'come', 'made', 'may', 'part', 'file', 'document',
    'pdf', 'page', 'pages', 'merged', 'merge'
]);

// Extract text from PDF using PDF.js
async function extractTextFromPdf(pdfFile) {
    try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 3); // Limit to first 3 pages for performance
        
        for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
        }
        
        return fullText.trim();
    } catch (error) {
        console.warn('Could not extract text from PDF:', error);
        return '';
    }
}

// Tokenize and clean text
function tokenize(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word))
        .filter(word => !/^\d+$/.test(word)); // Remove pure numbers
}

// Extract meaningful words from filename
function extractWordsFromFilename(filename) {
    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Split by common delimiters
    const words = nameWithoutExt
        .split(/[\s_\-\.]+/)
        .map(word => word.toLowerCase())
        .filter(word => word.length > 2 && !STOP_WORDS.has(word))
        .filter(word => !/^\d+$/.test(word));
    
    return words;
}

// Calculate TF-IDF scores for terms
function calculateTFIDF(allTexts, filenames) {
    const termFrequencies = {};
    const documentFrequencies = {};
    const totalDocuments = allTexts.length + filenames.length;
    
    // Process PDF texts
    allTexts.forEach((text, docIndex) => {
        const tokens = tokenize(text);
        const docTerms = {};
        
        tokens.forEach(term => {
            docTerms[term] = (docTerms[term] || 0) + 1;
        });
        
        Object.keys(docTerms).forEach(term => {
            if (!termFrequencies[term]) termFrequencies[term] = {};
            termFrequencies[term][`text_${docIndex}`] = docTerms[term];
            documentFrequencies[term] = (documentFrequencies[term] || 0) + 1;
        });
    });
    
    // Process filenames (give them higher weight)
    filenames.forEach((filename, docIndex) => {
        const words = extractWordsFromFilename(filename);
        words.forEach(term => {
            if (!termFrequencies[term]) termFrequencies[term] = {};
            termFrequencies[term][`file_${docIndex}`] = (termFrequencies[term][`file_${docIndex}`] || 0) + 3; // Weight filenames higher
            documentFrequencies[term] = (documentFrequencies[term] || 0) + 1;
        });
    });
    
    // Calculate TF-IDF scores
    const scores = {};
    Object.keys(termFrequencies).forEach(term => {
        const tf = Object.values(termFrequencies[term]).reduce((sum, val) => sum + val, 0);
        const df = documentFrequencies[term];
        const idf = Math.log(totalDocuments / df);
        scores[term] = tf * idf;
    });
    
    return scores;
}

// Generate filename using NLP
async function generateFilename(files) {
    try {
        const texts = [];
        const filenames = files.map(f => f.name); // Collect all filenames
        
        // Extract text from PDFs (limit to first 5 to avoid performance issues)
        const pdfFilesToProcess = files
            .filter(f => f.type === 'application/pdf')
            .slice(0, 5);
        
        for (const fileObj of pdfFilesToProcess) {
            const text = await extractTextFromPdf(fileObj.file);
            if (text) texts.push(text);
        }
        
        // If we couldn't extract text, just use filenames
        if (texts.length === 0 && filenames.length > 0) {
            // Extract words from all filenames
            const allWords = filenames.flatMap(name => extractWordsFromFilename(name));
            const wordCounts = {};
            allWords.forEach(word => {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            });
            
            // Get most common words
            const sortedWords = Object.entries(wordCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(entry => entry[0]);
            
            if (sortedWords.length > 0) {
                return sortedWords.join('_') + '.pdf';
            }
        }
        
        // Use TF-IDF if we have text
        if (texts.length > 0 || filenames.length > 0) {
            const scores = calculateTFIDF(texts, filenames);
            const sortedTerms = Object.entries(scores)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4) // Take top 4 terms
                .map(entry => entry[0]);
            
            if (sortedTerms.length > 0) {
                // Capitalize first letter of each word and join
                const filename = sortedTerms
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join('_');
                
                // Limit filename length
                if (filename.length > 50) {
                    return filename.substring(0, 50) + '.pdf';
                }
                return filename + '.pdf';
            }
        }
        
        // Fallback to merged.pdf
        return 'merged.pdf';
    } catch (error) {
        console.warn('Error generating filename:', error);
        return 'merged.pdf';
    }
}

// Download merged PDF
async function downloadMergedPdf(pdfBytes, files, filename) {
    // Generate filename if not provided
    if (!filename) {
        filename = await generateFilename(files);
    }
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Show alert message
function showAlert(type, message) {
    const alertContainer = document.getElementById('alert-container');
    
    // Remove existing alerts
    alertContainer.innerHTML = '';
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} show`;
    alert.innerHTML = `
        <strong>${type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Info'}:</strong> ${message}
    `;
    
    alertContainer.appendChild(alert);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            alert.remove();
        }, 300);
    }, 5000);
}

