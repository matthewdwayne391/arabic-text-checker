import express from 'express';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configuration
const LT_URL = process.env.LT_URL || "http://localhost:8010";
const PORT = process.env.PORT || 5000; // Use port 5000 for frontend visibility

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(join(__dirname, 'public')));

// Helper function to create form-encoded data
function createFormData(params) {
  return new URLSearchParams(params).toString();
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Main language check endpoint
app.post('/api/check', async (req, res) => {
  try {
    const { text } = req.body;

    // Input validation
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ 
        error: 'يرجى إدخال نص صالح للتحقق منه' 
      });
    }

    if (text.length > 20000) {
      return res.status(400).json({ 
        error: 'النص طويل جداً. يرجى إدخال نص أقل من 20,000 حرف' 
      });
    }

    // Prepare request to LanguageTool
    const formData = createFormData({
      language: 'ar',
      text: text,
      enabledOnly: 'false'
    });

    console.log(`Checking text with LanguageTool: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);

    // Make request to LanguageTool server
    const response = await fetch(`${LT_URL}/v2/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formData,
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      console.error(`LanguageTool responded with status: ${response.status}`);
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    console.log(`Found ${result.matches ? result.matches.length : 0} matches`);
    
    // Return the result as-is from LanguageTool
    res.json(result);

  } catch (error) {
    console.error('Error checking text:', error);
    
    // Determine if this is a connection error
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      return res.status(502).json({ 
        error: 'خادم التصحيح اللغوي غير متاح حالياً. يرجى المحاولة مرة أخرى خلال دقيقة.' 
      });
    }

    if (error.name === 'TimeoutError' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({ 
        error: 'انتهت مهلة الاتصال. يرجى المحاولة مرة أخرى.' 
      });
    }

    // Generic error
    res.status(500).json({ 
      error: 'حدث خطأ أثناء التحقق من النص. يرجى المحاولة مرة أخرى.' 
    });
  }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'حدث خطأ داخلي في الخادم' 
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Arabic Language Corrector running on http://0.0.0.0:${PORT}`);
  console.log(`📝 Open your browser to start correcting Arabic text`);
  console.log(`🔧 LanguageTool server should be running on ${LT_URL}`);
});
