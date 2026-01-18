# MEDIBOT - Medical AI Assistant

A complete medical chatbot application that answers medical history and diagnosis-related questions using a structured dataset with RAG-style retrieval.

## 🏥 Features

- **Dataset-Grounded Responses**: All answers come from a comprehensive medical database
- **RAG-Style Retrieval**: Intelligent keyword matching and semantic similarity scoring
- **Advanced ML Engine**: Custom TF-IDF vectorization and cosine similarity for accurate matching
- **Intent Classification**: Recognizes symptoms, causes, treatment, and general queries
- **Multiple Condition Suggestions**: Shows alternative possible conditions for complex queries
- **Modern Medical UI**: Professional healthcare-inspired interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Chat**: Smooth animations and typing indicators
- **Medical Disclaimers**: Ethical safeguards for medical information
- **Offline Operation**: No internet required - works entirely from local dataset

## 📂 Project Structure

```
RAGBOT/
├── index.html          # Main HTML structure
├── style.css           # Modern medical-grade styling
├── script.js           # RAG logic and chat functionality
├── ml-engine.js        # Machine learning engine for text processing
├── config.js           # Configuration (APIs disabled for local-only)
├── dataset/
│   └── medical_data.json   # Comprehensive medical database
└── README.md           # This file
```

## 🚀 How to Run

1. **No Server Required**: Simply open `index.html` in any modern web browser
2. **Local Files**: All data is stored locally - no internet connection needed
3. **Cross-Platform**: Works on Windows, Mac, and Linux

### Quick Start:
```bash
# Navigate to the RAGBOT folder
cd Desktop/RAGBOT

# Open in browser (Windows)
start index.html

# Or double-click index.html in file explorer
```

## 🧠 How It Works

### RAG-Style Retrieval Logic:
1. **Query Processing**: User input is tokenized and keywords extracted
2. **Intent Classification**: Determines if query is about symptoms, causes, treatment, or general info
3. **Semantic Search**: Uses TF-IDF vectors and cosine similarity to find relevant medical records
4. **Confidence Scoring**: Ranks results by relevance and intent match
5. **Response Generation**: Constructs grounded responses from top matches
6. **Multiple Suggestions**: Shows alternative conditions for ambiguous queries

### ML Engine Features:
- **Text Preprocessing**: Tokenization, stemming, and stop-word removal
- **TF-IDF Vectorization**: Builds document vectors for efficient similarity calculation
- **Cosine Similarity**: Measures semantic relevance between queries and medical data
- **Entity Extraction**: Identifies medical terms, symptoms, and conditions
- **Confidence Thresholding**: Ensures high-quality responses with fallback handling

## 💊 Sample Queries to Try

- "What is hypertension?" - General information about high blood pressure
- "Symptoms of diabetes" - Lists Type 2 Diabetes symptoms
- "How is asthma treated?" - Shows treatment options for asthma
- "Causes of migraine" - Explains migraine triggers
- "What are pneumonia symptoms?" - Displays pneumonia symptoms
- "Treatment for depression" - Shows depression management options
- "What causes anxiety?" - Lists anxiety disorder causes
- "I have severe chest pain, what could it be?" - Suggests multiple possible conditions
- "Explain brain chemistry in mental health" - Matches anxiety disorder information

## ⚠️ Medical Disclaimer

This chatbot is for **educational purposes only** and is **not a substitute** for professional medical diagnosis or treatment. Always consult with qualified healthcare professionals for medical concerns.

## 🎨 UI/UX Features

- **Dark Medical Theme**: Professional healthcare color palette
- **Smooth Animations**: Fade-in effects and typing indicators
- **Responsive Layout**: Adapts to all screen sizes
- **Accessibility**: High contrast and readable fonts
- **Status Indicators**: Dataset loading status display
- **Confidence Display**: Shows AI confidence levels for transparency

## 🔧 Technical Implementation

- **Pure Vanilla JavaScript**: No frameworks or dependencies
- **Local JSON Dataset**: Fast, offline-capable data storage
- **Modular Code**: Clean separation of concerns (UI, ML, data)
- **Error Handling**: Graceful fallbacks for edge cases
- **Performance Optimized**: Efficient search algorithms with caching
- **No External APIs**: Completely offline operation

## 📱 Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🏆 Hackathon Ready

This application is designed to be:
- **Demo-Ready**: Professional appearance and smooth functionality
- **Extensible**: Easy to add more medical data or features
- **Portable**: Single folder deployment
- **Impressive**: Modern UI that showcases technical skills
- **Educational**: Demonstrates ML concepts in healthcare

---

**Built with ❤️ for medical education and information accessibility**