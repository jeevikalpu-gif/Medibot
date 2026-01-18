# API Integration Setup Guide

## 🔌 Available APIs

### 1. Google Gemini API (Recommended)
- **Purpose**: Enhanced medical responses using Gemini Pro
- **Cost**: Free tier available, then paid
- **Setup**:
  1. Get API key from https://makersuite.google.com/app/apikey
  2. Open `config.js`
  3. Replace `YOUR_GEMINI_API_KEY` with your actual key
  4. Set `enabled: true` for Gemini

### 2. FDA Drug Database (Free)
- **Purpose**: Official drug information
- **Cost**: Free
- **Setup**: Already enabled by default

## 🚀 Quick Setup

### Option 1: Gemini Integration
```javascript
// In config.js, update:
gemini: {
    enabled: true,
    apiKey: 'your-actual-gemini-api-key-here',
    // ... rest stays same
}
```

### Option 2: Local Only
```javascript
// In config.js, update:
fallback: {
    useLocalOnly: true, // Disables all API calls
    // ... rest stays same
}
```

## 🧪 Testing API Integration

1. **Test Local Dataset**: "What are symptoms of diabetes?"
2. **Test API Fallback**: "What is the latest treatment for rare diseases?"
3. **Test Drug API**: "Tell me about aspirin medication"

## 🔒 Security Notes

- Never commit API keys to version control
- Use environment variables in production
- Monitor API usage and costs
- Set rate limits appropriately

## 📊 How It Works

1. **User Query** → Local dataset search first
2. **If insufficient data** → API call (OpenAI/Medical APIs)
3. **Response** → Formatted with medical disclaimers
4. **Fallback** → Graceful error handling

## 💡 API Response Types

- 🏥 **Local Dataset**: Structured medical data
- 🤖 **AI Response**: OpenAI-generated content  
- 💊 **FDA Drug Info**: Official drug database
- ⚠️ **Fallback**: When APIs are unavailable