// DOM Elements
const urlInput = document.getElementById('urlInput');
const clearBtn = document.getElementById('clearBtn');
const infoBtn = document.getElementById('infoBtn');
const pasteBtn = document.getElementById('pasteBtn');
const downloadBtn = document.getElementById('downloadBtn');
const videoInfo = document.getElementById('videoInfo');
const thumbnail = document.getElementById('thumbnail');
const videoTitle = document.getElementById('videoTitle');
const uploader = document.getElementById('uploader');
const duration = document.getElementById('duration');
const filesize = document.getElementById('filesize');
const videoDescription = document.getElementById('videoDescription');
const formatBtns = document.querySelectorAll('.format-btn');
const qualitySelect = document.getElementById('qualitySelect');
const qualityGroup = document.getElementById('qualityGroup');
const progressContainer = document.getElementById('progressContainer');
const progressText = document.getElementById('progressText');
const progressPercent = document.getElementById('progressPercent');
const progressFill = document.getElementById('progressFill');
const progressSpeed = document.getElementById('progressSpeed');
const progressEta = document.getElementById('progressEta');
const themeToggle = document.getElementById('themeToggle');
const historyBtn = document.getElementById('historyBtn');
const historyCount = document.getElementById('historyCount');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const loadingOverlay = document.getElementById('loadingOverlay');
const notificationContainer = document.getElementById('notificationContainer');

// State
let selectedFormat = 'video';
let currentDownloadId = null;
let progressInterval = null;
let downloadHistory = loadHistory();
let termsAccepted = checkTermsAcceptance();

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeHistory();
    checkAndShowTermsAgreement();
    setupEventListeners();
});

// Terms Agreement Functions
function checkTermsAcceptance() {
    try {
        return localStorage.getItem('termsAccepted') === 'true';
    } catch (e) {
        return false;
    }
}

function checkAndShowTermsAgreement() {
    if (!termsAccepted) {
        showTermsAgreementModal();
    } else {
        // Show welcome message only if terms already accepted
        setTimeout(() => showWelcomeMessage(), 1000);
    }
}

function showTermsAgreementModal() {
    const modal = document.getElementById('termsAgreementModal');
    const agreeCheckbox = document.getElementById('agreeCheckbox');
    const acceptBtn = document.getElementById('acceptBtn');
    const declineBtn = document.getElementById('declineBtn');
    
    modal.classList.add('active');
    
    // Disable all interactive elements on the page
    disablePageInteraction();
    
    // Enable accept button when checkbox is checked
    agreeCheckbox.addEventListener('change', () => {
        acceptBtn.disabled = !agreeCheckbox.checked;
    });
    
    // Accept button handler
    acceptBtn.addEventListener('click', () => {
        if (agreeCheckbox.checked) {
            acceptTerms();
        }
    });
    
    // Decline button handler
    declineBtn.addEventListener('click', () => {
        declineTerms();
    });
}

function acceptTerms() {
    try {
        localStorage.setItem('termsAccepted', 'true');
        localStorage.setItem('termsAcceptedDate', new Date().toISOString());
        termsAccepted = true;
        
        const modal = document.getElementById('termsAgreementModal');
        modal.classList.remove('active');
        
        enablePageInteraction();
        showNotification('✓ Terms accepted. Welcome to JAV Downloader Pro!', 'success');
        
        setTimeout(() => showWelcomeMessage(), 500);
    } catch (e) {
        showNotification('Error saving agreement. Please try again.', 'error');
    }
}

function declineTerms() {
    showNotification('You must accept the Terms of Service to use this site.', 'warning');
    
    // Show confirmation
    setTimeout(() => {
        if (confirm('Are you sure you want to decline? You will not be able to use this service.')) {
            // Redirect to a goodbye page or close
            document.body.innerHTML = `
                <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; padding: 20px;">
                    <div>
                        <h1 style="font-size: 48px; margin-bottom: 20px;">😔</h1>
                        <h2>Terms Declined</h2>
                        <p style="color: #666; margin: 20px 0;">You must accept our Terms of Service and Privacy Policy to use JAV Downloader Pro.</p>
                        <p><a href="/" style="color: #4A90E2; text-decoration: underline;">Return to site</a></p>
                    </div>
                </div>
            `;
        }
    }, 300);
}

function disablePageInteraction() {
    // Disable all buttons and inputs
    const elements = document.querySelectorAll('button, input, select, a');
    elements.forEach(el => {
        if (!el.closest('#termsAgreementModal')) {
            el.style.pointerEvents = 'none';
            el.style.opacity = '0.5';
        }
    });
}

function enablePageInteraction() {
    // Re-enable all buttons and inputs
    const elements = document.querySelectorAll('button, input, select, a');
    elements.forEach(el => {
        el.style.pointerEvents = '';
        el.style.opacity = '';
    });
}

// Theme Management
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showNotification(`${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`, 'info');
}

// History Management
function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem('downloadHistory')) || [];
    } catch (e) {
        return [];
    }
}

function saveHistory() {
    try {
        localStorage.setItem('downloadHistory', JSON.stringify(downloadHistory));
        updateHistoryCount();
    } catch (e) {
        console.error('Failed to save history:', e);
    }
}

function addToHistory(item) {
    const historyItem = {
        id: Date.now(),
        url: item.url,
        title: item.title || 'Unknown',
        format: item.format || 'video',
        quality: item.quality || 'best',
        timestamp: new Date().toISOString(),
        thumbnail: item.thumbnail || ''
    };
    
    downloadHistory.unshift(historyItem);
    
    // Keep only last 50 items
    if (downloadHistory.length > 50) {
        downloadHistory = downloadHistory.slice(0, 50);
    }
    
    saveHistory();
}

function updateHistoryCount() {
    historyCount.textContent = downloadHistory.length;
    historyCount.style.display = downloadHistory.length > 0 ? 'block' : 'none';
}

function initializeHistory() {
    updateHistoryCount();
}

function showHistory() {
    renderHistory();
    historyModal.classList.add('active');
}

function closeHistory() {
    historyModal.classList.remove('active');
}

function renderHistory() {
    if (downloadHistory.length === 0) {
        historyList.innerHTML = '<p class="empty-state">No download history yet</p>';
        return;
    }
    
    historyList.innerHTML = downloadHistory.map(item => `
        <div class="history-item" data-id="${item.id}">
            <div class="history-info">
                <h4>${escapeHtml(item.title)}</h4>
                <div class="history-meta">
                    ${item.format} • ${item.quality} • ${formatDate(item.timestamp)}
                </div>
            </div>
            <div class="history-actions">
                <button class="history-btn" onclick="redownloadFromHistory('${escapeHtml(item.url)}')">
                    ↻ Download Again
                </button>
            </div>
        </div>
    `).join('');
}

function clearHistory() {
    if (confirm('Are you sure you want to clear all download history?')) {
        downloadHistory = [];
        saveHistory();
        renderHistory();
        showNotification('History cleared', 'info');
    }
}

function redownloadFromHistory(url) {
    closeHistory();
    urlInput.value = url;
    fetchVideoInfo();
}

// Event Listeners Setup
function setupEventListeners() {
    // URL input handlers
    urlInput.addEventListener('input', handleUrlInput);
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            downloadBtn.click();
        }
    });
    
    // Clear button
    clearBtn.addEventListener('click', () => {
        urlInput.value = '';
        videoInfo.style.display = 'none';
        clearBtn.style.display = 'none';
        urlInput.focus();
    });
    
    // Paste button
    pasteBtn.addEventListener('click', handlePaste);
    
    // Info button
    infoBtn.addEventListener('click', fetchVideoInfo);
    
    // Download button
    downloadBtn.addEventListener('click', startDownload);
    
    // Format buttons
    formatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            formatBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedFormat = btn.dataset.format;
            
            // Show/hide quality options based on format
            const qualityGroup = document.getElementById('qualityGroup');
            const audioFormatGroup = document.getElementById('audioFormatGroup');
            
            if (selectedFormat === 'audio') {
                qualityGroup.style.display = 'none';
                audioFormatGroup.style.display = 'block';
            } else {
                qualityGroup.style.display = 'block';
                audioFormatGroup.style.display = 'none';
            }
        });
    });
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // History button
    historyBtn.addEventListener('click', showHistory);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Close modal on outside click
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            closeHistory();
        }
    });
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl+V or Cmd+V to paste
    if ((e.ctrlKey || e.metaKey) && e.key === 'v' && document.activeElement !== urlInput) {
        e.preventDefault();
        handlePaste();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && historyModal.classList.contains('active')) {
        closeHistory();
    }
    
    // Ctrl+D or Cmd+D to toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleTheme();
    }
    
    // Ctrl+H or Cmd+H to show history
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        showHistory();
    }
}

// URL Input Handler
function handleUrlInput() {
    const hasValue = urlInput.value.trim().length > 0;
    clearBtn.style.display = hasValue ? 'block' : 'none';
    
    if (!hasValue) {
        videoInfo.style.display = 'none';
    }
}

// Paste Handler
async function handlePaste() {
    try {
        const text = await navigator.clipboard.readText();
        urlInput.value = text;
        handleUrlInput();
        showNotification('URL pasted from clipboard', 'success');
        
        // Auto-fetch if it's a YouTube URL
        if (isValidYouTubeUrl(text)) {
            setTimeout(() => fetchVideoInfo(), 500);
        }
    } catch (err) {
        showNotification('Failed to read clipboard. Please paste manually.', 'error');
        urlInput.focus();
    }
}

// Fetch Video Info
async function fetchVideoInfo() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a YouTube URL', 'error');
        urlInput.focus();
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        showNotification('Please enter a valid YouTube URL', 'error');
        urlInput.select();
        return;
    }

    showLoading('Fetching video information...');
    infoBtn.disabled = true;

    try {
        const response = await fetch('/api/info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (response.ok) {
            displayVideoInfo(data);
            showNotification('Video information loaded', 'success');
        } else {
            throw new Error(data.error || 'Failed to fetch video info');
        }
    } catch (error) {
        showNotification(error.message, 'error');
        videoInfo.style.display = 'none';
    } finally {
        hideLoading();
        infoBtn.disabled = false;
    }
}

// Display Video Info
function displayVideoInfo(data) {
    thumbnail.src = data.thumbnail;
    videoTitle.textContent = data.title;
    uploader.textContent = data.uploader;
    duration.textContent = formatDuration(data.duration);
    
    if (data.filesize_approx && data.filesize_approx > 0) {
        filesize.textContent = ` • ~${formatFileSize(data.filesize_approx)}`;
        filesize.style.display = 'inline';
    } else {
        filesize.style.display = 'none';
    }
    
    if (data.description) {
        videoDescription.textContent = data.description;
        videoDescription.style.display = 'block';
    } else {
        videoDescription.style.display = 'none';
    }
    
    videoInfo.style.display = 'flex';
    
    // Store video info for history
    videoInfo.dataset.videoData = JSON.stringify(data);
}

// Start Download
async function startDownload() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Please enter a YouTube URL', 'error');
        urlInput.focus();
        return;
    }

    if (!isValidYouTubeUrl(url)) {
        showNotification('Please enter a valid YouTube URL', 'error');
        urlInput.select();
        return;
    }

    const quality = document.getElementById('qualitySelect').value;
    const audioFormat = document.getElementById('audioFormatSelect').value;

    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> <span class="btn-text">Starting...</span>';

    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                url,
                format: selectedFormat,
                quality,
                audioFormat
            })
        });

        const data = await response.json();

        if (response.ok) {
            currentDownloadId = data.download_id;
            progressContainer.style.display = 'block';
            progressText.textContent = 'Starting download...';
            progressPercent.textContent = '0%';
            progressFill.style.width = '0%';
            
            showNotification('Download started successfully', 'success');
            startProgressPolling();
            
            // Get video data from info card
            let videoData = {};
            try {
                videoData = JSON.parse(videoInfo.dataset.videoData || '{}');
            } catch (e) {}
            
            // Store download info for history (will be added when completed)
            window.pendingHistoryItem = {
                url,
                title: videoData.title || videoTitle.textContent,
                format: selectedFormat,
                quality: selectedFormat === 'video' ? quality : audioFormat,
                thumbnail: videoData.thumbnail || thumbnail.src
            };
        } else {
            throw new Error(data.error || 'Download failed');
        }
    } catch (error) {
        showNotification(error.message, 'error');
        resetDownloadButton();
    }
}

// Progress Polling
function startProgressPolling() {
    if (progressInterval) {
        clearInterval(progressInterval);
    }

    progressInterval = setInterval(async () => {
        if (!currentDownloadId) return;

        try {
            const response = await fetch(`/api/progress/${currentDownloadId}`);
            const data = await response.json();

            if (data.status === 'downloading') {
                progressText.textContent = 'Downloading...';
                progressPercent.textContent = data.percent;
                progressSpeed.textContent = `Speed: ${data.speed}`;
                progressEta.textContent = `ETA: ${data.eta}`;
                
                const percent = parseFloat(data.percent);
                progressFill.style.width = `${percent}%`;
            } else if (data.status === 'processing') {
                progressText.textContent = data.message || 'Processing...';
                progressPercent.textContent = '100%';
                progressFill.style.width = '100%';
                progressSpeed.textContent = '';
                progressEta.textContent = '';
            } else if (data.status === 'completed') {
                progressText.textContent = '✓ Download completed!';
                progressPercent.textContent = '100%';
                progressFill.style.width = '100%';
                progressSpeed.textContent = '';
                progressEta.textContent = '';
                
                showNotification('✓ Download completed successfully!', 'success');
                
                // Add to history
                if (window.pendingHistoryItem) {
                    addToHistory(window.pendingHistoryItem);
                    delete window.pendingHistoryItem;
                }
                
                clearInterval(progressInterval);
                resetDownloadButton();
                
                setTimeout(() => {
                    progressContainer.style.display = 'none';
                }, 5000);
            } else if (data.status === 'error') {
                progressText.textContent = '✗ Download failed';
                progressPercent.textContent = 'Error';
                
                showNotification(data.error || 'Download failed', 'error');
                
                clearInterval(progressInterval);
                resetDownloadButton();
            }
        } catch (error) {
            console.error('Error polling progress:', error);
        }
    }, 1000);
}

// Helper Functions
function resetDownloadButton() {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2v12m0 0l-4-4m4 4l4-4M4 16h12" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <span class="btn-text">Download</span>
        <span class="btn-shortcut">(Enter)</span>
    `;
}

function showLoading(message = 'Loading...') {
    loadingOverlay.querySelector('.loading-text').textContent = message;
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    
    notification.innerHTML = `
        <span style="font-size: 18px;">${icons[type]}</span>
        <span>${escapeHtml(message)}</span>
    `;
    
    notificationContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            notificationContainer.removeChild(notification);
        }, 300);
    }, 5000);
}

function isValidYouTubeUrl(url) {
    const patterns = [
        /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/,
        /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
        /^(https?:\/\/)?youtu\.be\/[\w-]+/
    ];
    
    return patterns.some(pattern => pattern.test(url));
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('Welcome to JAV Downloader Pro! 🎉', 'info');
    }, 1000);
}

// Global functions for onclick handlers
window.closeHistory = closeHistory;
window.clearHistory = clearHistory;
window.redownloadFromHistory = redownloadFromHistory;

window.showAbout = function() {
    alert('JAV Downloader Pro v1.0\n\nA fast, secure YouTube downloader with advanced features.\n\nKeyboard Shortcuts:\n• Ctrl/Cmd+V: Paste URL\n• Ctrl/Cmd+D: Toggle dark mode\n• Ctrl/Cmd+H: Show history\n• Enter: Start download\n• Escape: Close modals');
};

window.showShortcuts = function() {
    alert('Keyboard Shortcuts:\n\n• Ctrl/Cmd+V: Paste URL\n• Ctrl/Cmd+D: Toggle dark mode\n• Ctrl/Cmd+H: Show history\n• Enter: Start download\n• Escape: Close modals');
};

window.clearAllData = function() {
    if (confirm('This will clear all download history, settings, and terms acceptance. You will need to accept the terms again. Continue?')) {
        localStorage.clear();
        downloadHistory = [];
        updateHistoryCount();
        termsAccepted = false;
        showNotification('All data cleared. Please reload the page.', 'info');
        setTimeout(() => location.reload(), 2000);
    }
};

// Add slideOutRight animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

console.log('JAV Downloader Pro initialized successfully! 🚀');
console.log('Keyboard shortcuts available. Press Ctrl/Cmd+H for help.');
