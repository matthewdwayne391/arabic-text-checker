// DOM elements
const textInput = document.getElementById('textInput');
const checkBtn = document.getElementById('checkBtn');
const rephraseBtn = document.getElementById('rephraseBtn');
const smartCheckBtn = document.getElementById('smartCheckBtn');
const clearBtn = document.getElementById('clearBtn');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const loadingIndicator = document.getElementById('loadingIndicator');

// State
let currentText = '';
let currentMatches = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    focusTextInput();
});

// Set up all event listeners
function setupEventListeners() {
    checkBtn.addEventListener('click', handleCheckText);
    rephraseBtn.addEventListener('click', handleRephraseText);
    smartCheckBtn.addEventListener('click', handleSmartCheck);
    clearBtn.addEventListener('click', handleClearText);
    
    // Ctrl+Enter shortcut for quick checking
    textInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            handleCheckText();
        }
    });
    
    // Auto-resize textarea
    textInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

// Focus on text input
function focusTextInput() {
    textInput.focus();
}

// Handle text checking
async function handleCheckText() {
    const text = textInput.value.trim();
    
    if (!text) {
        showError('يرجى إدخال نص للتحقق منه');
        return;
    }
    
    if (text.length > 20000) {
        showError('النص طويل جداً. يرجى إدخال نص أقل من 20,000 حرف');
        return;
    }
    
    currentText = text;
    setLoading(true);
    
    try {
        const response = await fetch('/api/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'حدث خطأ أثناء التحقق من النص');
        }
        
        currentMatches = data.matches || [];
        displayResults(data);
        
    } catch (error) {
        console.error('Error checking text:', error);
        showError(error.message || 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
        setLoading(false);
    }
}

// Handle clear text
function handleClearText() {
    textInput.value = '';
    currentText = '';
    currentMatches = [];
    showWelcomeMessage();
    focusTextInput();
}

// Handle AI text rephrasing
async function handleRephraseText() {
    const text = textInput.value.trim();
    
    if (!text) {
        showError('يرجى إدخال نص لإعادة الصياغة');
        return;
    }
    
    if (text.length > 10000) {
        showError('النص طويل جداً. يرجى إدخال نص أقل من 10,000 حرف');
        return;
    }
    
    setLoading(true, 'rephrase');
    
    try {
        const response = await fetch('/api/rephrase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'حدث خطأ أثناء إعادة الصياغة');
        }
        
        displayRephraseResults(data);
        
    } catch (error) {
        console.error('Error rephrasing text:', error);
        showError(error.message || 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
        setLoading(false);
    }
}

// Handle AI smart check
async function handleSmartCheck() {
    const text = textInput.value.trim();
    
    if (!text) {
        showError('يرجى إدخال نص للتحقق الذكي');
        return;
    }
    
    if (text.length > 10000) {
        showError('النص طويل جداً. يرجى إدخال نص أقل من 10,000 حرف');
        return;
    }
    
    setLoading(true, 'smart-check');
    
    try {
        const response = await fetch('/api/smart-check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'حدث خطأ أثناء التحقق الذكي');
        }
        
        displaySmartCheckResults(data);
        
    } catch (error) {
        console.error('Error smart checking text:', error);
        showError(error.message || 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
        setLoading(false);
    }
}

// Set loading state
function setLoading(loading, type = 'check') {
    if (loading) {
        loadingIndicator.classList.remove('hidden');
        checkBtn.disabled = true;
        rephraseBtn.disabled = true;
        smartCheckBtn.disabled = true;
        
        if (type === 'rephrase') {
            rephraseBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إعادة الصياغة...';
            loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري إعادة الصياغة بالذكاء الاصطناعي...';
        } else if (type === 'smart-check') {
            smartCheckBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق الذكي...';
            loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق الذكي بالذكاء الاصطناعي...';
        } else {
            checkBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
            loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
        }
    } else {
        loadingIndicator.classList.add('hidden');
        checkBtn.disabled = false;
        rephraseBtn.disabled = false;
        smartCheckBtn.disabled = false;
        checkBtn.innerHTML = '<i class="fas fa-check"></i> تحقق من النص 47/';
        rephraseBtn.innerHTML = '<i class="fas fa-sync-alt"></i> أعد صياغة';
        smartCheckBtn.innerHTML = '<i class="fas fa-robot"></i> تحقق ذكي 95/';
        loadingIndicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
    }
}

// Display results
function displayResults(data) {
    const matches = data.matches || [];
    
    if (matches.length === 0) {
        showSuccessMessage('ممتاز! لم يتم العثور على أخطاء في النص.');
        return;
    }
    
    let html = `
        <div class="results-summary">
            <p><strong>تم العثور على ${matches.length} ${matches.length === 1 ? 'خطأ' : 'أخطاء'}</strong></p>
        </div>
    `;
    
    matches.forEach((match, index) => {
        html += createMatchHTML(match, index);
    });
    
    resultsContent.innerHTML = html;
    
    // Add event listeners for suggestion buttons
    addSuggestionListeners();
}

// Create HTML for a single match
function createMatchHTML(match, index) {
    const context = getMatchContext(match);
    const suggestions = match.replacements || [];
    
    let suggestionsHTML = '';
    if (suggestions.length > 0) {
        suggestionsHTML = `
            <div class="suggestions">
                ${suggestions.slice(0, 5).map((suggestion, i) => 
                    `<button class="suggestion-badge" 
                             onclick="applySuggestion(${index}, ${i})" 
                             title="انقر لتطبيق هذا التصحيح">
                        ${escapeHtml(suggestion.value)}
                     </button>`
                ).join('')}
            </div>
        `;
    }
    
    return `
        <div class="match-item" data-match-index="${index}">
            <div class="match-header">
                <span class="match-type">
                    ${getMatchTypeText(match.rule?.category?.id || 'UNKNOWN')}
                </span>
            </div>
            
            <div class="match-context">
                ${context}
            </div>
            
            <div class="match-message">
                <i class="fas fa-info-circle"></i>
                ${escapeHtml(match.message || 'خطأ محتمل')}
            </div>
            
            ${suggestionsHTML}
        </div>
    `;
}

// Get context around the error
function getMatchContext(match) {
    const start = Math.max(0, match.offset - 20);
    const end = Math.min(currentText.length, match.offset + match.length + 20);
    
    const before = currentText.substring(start, match.offset);
    const error = currentText.substring(match.offset, match.offset + match.length);
    const after = currentText.substring(match.offset + match.length, end);
    
    return `${escapeHtml(before)}<span class="match-error">${escapeHtml(error)}</span>${escapeHtml(after)}`;
}

// Apply suggestion
window.applySuggestion = function(matchIndex, suggestionIndex) {
    const match = currentMatches[matchIndex];
    const suggestion = match.replacements[suggestionIndex];
    
    if (!match || !suggestion) {
        console.error('Invalid match or suggestion index');
        return;
    }
    
    // Apply the suggestion to the text
    const newText = currentText.substring(0, match.offset) + 
                   suggestion.value + 
                   currentText.substring(match.offset + match.length);
    
    // Update the textarea
    textInput.value = newText;
    currentText = newText;
    
    // Show success feedback
    showTemporaryMessage('تم تطبيق التصحيح بنجاح!', 'success');
    
    // Automatically recheck the text
    setTimeout(() => {
        handleCheckText();
    }, 500);
};

// Get match type text in Arabic
function getMatchTypeText(categoryId) {
    const types = {
        'GRAMMAR': 'نحو',
        'SPELLING': 'إملاء',
        'PUNCTUATION': 'ترقيم',
        'TYPOGRAPHY': 'طباعة',
        'STYLE': 'أسلوب',
        'UNKNOWN': 'أخرى'
    };
    
    return types[categoryId] || 'أخرى';
}

// Show error message
function showError(message) {
    resultsContent.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            ${escapeHtml(message)}
        </div>
    `;
}

// Show success message
function showSuccessMessage(message) {
    resultsContent.innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle"></i>
            ${escapeHtml(message)}
        </div>
    `;
}

// Show welcome message
function showWelcomeMessage() {
    resultsContent.innerHTML = `
        <div class="welcome-message">
            <i class="fas fa-arrow-up"></i>
            أدخل نصاً في الحقل أعلاه واضغط "تحقق من النص" لبدء التصحيح
        </div>
    `;
}

// Show temporary message
function showTemporaryMessage(message, type = 'success') {
    const className = type === 'success' ? 'success-message' : 'error-message';
    const icon = type === 'success' ? 'check-circle' : 'exclamation-triangle';
    
    // Create temporary message element
    const messageEl = document.createElement('div');
    messageEl.className = `${className} temporary-message`;
    messageEl.innerHTML = `
        <i class="fas fa-${icon}"></i>
        ${escapeHtml(message)}
    `;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.left = '50%';
    messageEl.style.transform = 'translateX(-50%)';
    messageEl.style.zIndex = '9999';
    messageEl.style.minWidth = '300px';
    messageEl.style.textAlign = 'center';
    
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 3000);
}

// Display rephrase results
function displayRephraseResults(data) {
    const { original, rephrased } = data;
    
    let html = `
        <div class="rephrase-results">
            <h3 class="rephrase-title">
                <i class="fas fa-magic"></i>
                إعادة الصياغة بالذكاء الاصطناعي
            </h3>
            
            <div class="original-text-section">
                <h4><i class="fas fa-file-text"></i> النص الأصلي:</h4>
                <div class="text-display original-text">${escapeHtml(original)}</div>
            </div>
            
            <div class="rephrased-text-section">
                <h4><i class="fas fa-sparkles"></i> النص المُعاد صياغته:</h4>
                <div class="text-display rephrased-text">${escapeHtml(rephrased)}</div>
                <div class="rephrase-actions">
                    <button class="apply-rephrase-btn" onclick="applyRephrasedText('${escapeHtml(rephrased).replace(/'/g, '\\\'')}')" title="استبدال النص الأصلي بالنص المُعاد صياغته">
                        <i class="fas fa-check"></i>
                        استخدم النص الجديد
                    </button>
                    <button class="copy-rephrase-btn" onclick="copyToClipboard('${escapeHtml(rephrased).replace(/'/g, '\\\'')}')" title="نسخ النص المُعاد صياغته">
                        <i class="fas fa-copy"></i>
                        نسخ
                    </button>
                </div>
            </div>
        </div>
    `;
    
    resultsContent.innerHTML = html;
}

// Display smart check results
function displaySmartCheckResults(data) {
    const { original, corrected } = data;
    
    let html = `
        <div class="smart-check-results">
            <h3 class="smart-check-title">
                <i class="fas fa-robot"></i>
                التصحيح الذكي
            </h3>
            
            <div class="original-text-section">
                <h4><i class="fas fa-file-text"></i> النص الأصلي:</h4>
                <div class="text-display original-text">${escapeHtml(original)}</div>
            </div>
            
            <div class="corrected-text-section">
                <h4><i class="fas fa-check-circle"></i> النص المُصحح:</h4>
                <div class="text-display corrected-text">${escapeHtml(corrected)}</div>
                <div class="smart-check-actions">
                    <button class="apply-correction-btn" onclick="applyCorrectedText('${escapeHtml(corrected).replace(/'/g, '\\\'')}')" title="استبدال النص الأصلي بالنص المُصحح">
                        <i class="fas fa-check"></i>
                        استخدم النص المُصحح
                    </button>
                    <button class="copy-correction-btn" onclick="copyToClipboard('${escapeHtml(corrected).replace(/'/g, '\\\'')}')" title="نسخ النص المُصحح">
                        <i class="fas fa-copy"></i>
                        نسخ
                    </button>
                </div>
            </div>
        </div>
    `;
    
    resultsContent.innerHTML = html;
}

// Apply corrected text to input
window.applyCorrectedText = function(correctedText) {
    const cleanedText = correctedText.replace(/\\'/g, "'");
    textInput.value = cleanedText;
    showTemporaryMessage('تم استبدال النص بالنسخة المُصححة!', 'success');
    focusTextInput();
};

// Apply rephrased text to input
window.applyRephrasedText = function(rephrasedText) {
    const cleanedText = rephrasedText.replace(/\\'/g, "'");
    textInput.value = cleanedText;
    showTemporaryMessage('تم استبدال النص بالنسخة المُعاد صياغتها!', 'success');
    focusTextInput();
};

// Copy text to clipboard
window.copyToClipboard = function(text) {
    const cleanedText = text.replace(/\\'/g, "'");
    navigator.clipboard.writeText(cleanedText).then(() => {
        showTemporaryMessage('تم نسخ النص إلى الحافظة!', 'success');
    }).catch(() => {
        showTemporaryMessage('تعذر نسخ النص', 'error');
    });
};

// Add suggestion listeners (called after displaying results)
function addSuggestionListeners() {
    // Listeners are added via onclick attributes in the HTML
    // This function is kept for potential future enhancements
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add some keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key clears the current operation
    if (e.key === 'Escape') {
        if (!loadingIndicator.classList.contains('hidden')) {
            // Cancel current operation (if possible)
            setLoading(false);
        }
    }
    
    // F5 or Ctrl+R to refresh and clear
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        handleClearText();
    }
});

// Handle online/offline status
window.addEventListener('online', function() {
    showTemporaryMessage('تم استعادة الاتصال بالإنترنت', 'success');
});

window.addEventListener('offline', function() {
    showTemporaryMessage('تم فقدان الاتصال بالإنترنت', 'error');
});

// Performance optimization: debounce function for future use
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
