class MedicalChatbot {
    constructor() {
        this.medicalData = [];
        this.mlEngine = new MLEngine(); // Initialize ML engine
        this.chatMessages = document.getElementById('chat-messages');
        this.userInput = document.getElementById('user-input');
        this.sendBtn = document.getElementById('send-btn');
        this.clearBtn = document.getElementById('clear-btn');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.datasetStatus = document.getElementById('dataset-status');
        
        // API Configuration - now loaded from config.js
        this.apiConfig = typeof API_CONFIG !== 'undefined' ? API_CONFIG : {
            ollama: { enabled: false, baseUrl: 'http://localhost:11434/api/generate', model: 'llama2' },
            gemini: { enabled: false, apiKey: 'YOUR_GEMINI_API_KEY' },
            fda: { enabled: true, baseUrl: 'https://api.fda.gov/drug/label.json' },
            fallback: { useLocalOnly: false, showAPIErrors: true }
        };
        
        this.init();
    }

    async init() {
        await this.loadMedicalDataset();
        this.setupEventListeners();
        this.updateDatasetStatus('✅ Medical Dataset Loaded');
    }

    async loadMedicalDataset() {
        try {
            const response = await fetch('./dataset/medical_data.json');
            this.medicalData = await response.json();
            
            // Build ML models after loading data
            this.mlEngine.buildTFIDFVectors(this.medicalData);
            console.log('ML models initialized');
        } catch (error) {
            console.error('Error loading medical dataset:', error);
            this.updateDatasetStatus('❌ Dataset Load Failed');
        }
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });
        this.clearBtn.addEventListener('click', () => this.clearChat());
    }

    updateDatasetStatus(status) {
        this.datasetStatus.textContent = status;
    }

    async handleSendMessage() {
        const message = this.userInput.value.trim();
        if (!message) return;

        this.addUserMessage(message);
        this.userInput.value = '';
        this.showTypingIndicator();

        try {
            console.log('Processing query:', message);
            
            // First try local dataset
            let response = this.generateResponse(message);
            console.log('Local response:', response ? 'Found' : 'Not found');
            
            // If local dataset has insufficient data, try API
            if (this.isInsufficientResponse(response)) {
                console.log('Trying API response...');
                response = await this.getAPIResponse(message);
                console.log('API response received');
            }
            
            this.hideTypingIndicator();
            this.addBotMessage(response);
        } catch (error) {
            console.error('Error in handleSendMessage:', error);
            this.hideTypingIndicator();
            this.addBotMessage(this.getErrorResponse(error));
        }
    }

    addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.escapeHtml(message)}</p>
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addBotMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }

    generateResponse(query) {
        // Use ML-powered semantic search
        const mlResults = this.mlEngine.semanticSearch(query, this.medicalData, 3);
        
        if (mlResults.length === 0) {
            return null; // Return null to trigger API call
        }

        // Extract medical entities and classify intent
        const entities = this.mlEngine.extractMedicalEntities(query);
        const intent = this.mlEngine.classifyIntent(query);
        const confidence = this.mlEngine.calculateConfidence(mlResults, entities, intent);

        return this.constructMLResponse(mlResults, query, entities, intent, confidence);
    }

    retrieveRelevantData(query) {
        const queryLower = query.toLowerCase();
        const keywords = queryLower.split(/\s+/).filter(word => word.length > 2);
        
        const scoredResults = this.medicalData.map(item => {
            let score = 0;
            const searchText = `${item.disease_name} ${item.symptoms.join(' ')} ${item.causes.join(' ')} ${item.diagnosis}`.toLowerCase();
            
            keywords.forEach(keyword => {
                if (searchText.includes(keyword)) {
                    score += 1;
                    if (item.disease_name.toLowerCase().includes(keyword)) score += 2;
                    if (item.symptoms.some(symptom => symptom.toLowerCase().includes(keyword))) score += 1.5;
                }
            });
            
            return { ...item, score };
        });

        return scoredResults
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }

    constructMLResponse(mlResults, query, entities, intent, confidence) {
        // Different confidence thresholds based on intent
        const threshold = intent.intent === 'general' ? 0.2 : 0.3;
        
        // If confidence is too low, return null to trigger API call
        if (confidence < threshold) {
            console.log(`Low confidence (${Math.round(confidence * 100)}%), triggering API call`);
            return null;
        }
        
        const topResult = mlResults[0].data;
        const similarity = mlResults[0].similarity;
        
        let response = `<div class="ml-response">
            <h4>🧠 AI Analysis (${Math.round(confidence * 100)}% confidence)</h4>
            <div class="ml-stats">
                <span>Intent: ${intent.intent}</span> | 
                <span>Similarity: ${Math.round(similarity * 100)}%</span>
            </div>
        </div>`;
        
        response += `<h4>📋 ${topResult.disease_name}</h4>`;
        
        // Show relevant sections based on intent
        if (intent.intent === 'symptoms' && topResult.symptoms) {
            response += `<div class="medical-info priority">
                <h4>🔍 Symptoms:</h4>
                <ul>${topResult.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}</ul>
            </div>`;
        }
        
        if (intent.intent === 'treatment' && topResult.treatment) {
            response += `<div class="medical-info priority">
                <h4>💊 Treatment:</h4>
                <ul>${topResult.treatment.map(treatment => `<li>${treatment}</li>`).join('')}</ul>
            </div>`;
        }
        
        if (intent.intent === 'causes' && topResult.causes) {
            response += `<div class="medical-info priority">
                <h4>🧬 Causes:</h4>
                <ul>${topResult.causes.map(cause => `<li>${cause}</li>`).join('')}</ul>
            </div>`;
        }
        
        if (intent.intent === 'general') {
            // Show all key information for general queries
            if (topResult.symptoms) {
                response += `<div class="medical-info">
                    <h4>🔍 Symptoms:</h4>
                    <ul>${topResult.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}</ul>
                </div>`;
            }
            if (topResult.causes) {
                response += `<div class="medical-info">
                    <h4>🧬 Causes:</h4>
                    <ul>${topResult.causes.map(cause => `<li>${cause}</li>`).join('')}</ul>
                </div>`;
            }
            if (topResult.treatment) {
                response += `<div class="medical-info">
                    <h4>💊 Treatment:</h4>
                    <ul>${topResult.treatment.map(treatment => `<li>${treatment}</li>`).join('')}</ul>
                </div>`;
            }
            // Show if there are other possible matches
            if (mlResults.length > 1) {
                response += `<div class="medical-info">
                    <h4>🔗 Other Possible Conditions:</h4>
                    <ul>${mlResults.slice(1, 3).map(item => `<li>${item.data.disease_name} (${Math.round(item.similarity * 100)}% match)</li>`).join('')}</ul>
                </div>`;
            }
        }
        
        // Always show diagnosis if available
        if (topResult.diagnosis) {
            response += `<div class="medical-info">
                <h4>🏥 Diagnosis:</h4>
                <p>${topResult.diagnosis}</p>
            </div>`;
        }
        
        // Show detected entities
        const entityList = Object.values(entities).flat();
        if (entityList.length > 0) {
            response += `<div class="entities">
                <h4>🏷️ Detected: ${entityList.join(', ')}</h4>
            </div>`;
        }
        
        response += `<p class="disclaimer">⚠️ This ML-powered response is for educational purposes only. Consult healthcare professionals for medical advice.</p>`;
        
        return response;
    }

    clearChat() {
        this.chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-content">
                    <p>Hello! I'm MEDIBOT, your medical information assistant. I can help answer questions about medical conditions, symptoms, and treatments based on my medical database.</p>
                    <p class="disclaimer">⚠️ <strong>Disclaimer:</strong> This chatbot is for educational purposes only and not a substitute for professional medical diagnosis or treatment.</p>
                </div>
            </div>
        `;
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isInsufficientResponse(response) {
        return response === null || 
               response.includes("don't have enough data") ||
               (response.includes("26% confidence") || response.includes("confidence")) && response.includes("33%"); // Low confidence threshold
    }

    async getAPIResponse(query) {
        // Check if APIs are disabled - return fallback for local-only operation
        if (this.apiConfig.fallback?.useLocalOnly) {
            return this.getFallbackResponse(query);
        }

        // API code removed for simplicity - keeping local-only operation
        return this.getFallbackResponse(query);
    }

    async callGemini(query) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${this.apiConfig.gemini.model || 'gemini-1.5-flash'}:generateContent?key=${this.apiConfig.gemini.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a medical information assistant. Provide accurate, educational medical information about: ${query}. Always include disclaimers about consulting healthcare professionals. Keep response under 300 words.`
                    }]
                }],
                generationConfig: {
                    temperature: this.apiConfig.gemini.temperature || 0.3,
                    maxOutputTokens: this.apiConfig.gemini.maxTokens || 500
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
            throw new Error('Invalid response structure from Gemini API');
        }
        
        const content = data.candidates[0].content.parts[0].text;
        
        return `<div class="api-response">
            <h4>🤖 Gemini AI Response</h4>
            <p>${content}</p>
            <p class="disclaimer">⚠️ This information is AI-generated and for educational purposes only. Consult healthcare professionals for medical advice.</p>
        </div>`;
    }

    async callOllama(query) {
        try {
            console.log('Calling Ollama API...');
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(this.apiConfig.ollama.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.apiConfig.ollama.model || 'llama2',
                    prompt: `You are a medical information assistant. Provide accurate, educational medical information about: ${query}. Always include disclaimers about consulting healthcare professionals. Keep response under 300 words.`,
                    stream: false,
                    options: {
                        temperature: this.apiConfig.ollama.temperature || 0.3
                    }
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);
            console.log('Ollama response received');

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.response;
            
            return `<div class="api-response">
                <h4>🦙 Ollama Local AI Response</h4>
                <p>${content}</p>
                <p class="disclaimer">⚠️ This information is AI-generated locally and for educational purposes only. Consult healthcare professionals for medical advice.</p>
            </div>`;
        } catch (error) {
            console.error('Ollama Error:', error);
            throw error;
        }
    }

    async callFDAAPI(query) {
        // Example: FDA Drug API call
        const searchTerm = query.toLowerCase().match(/\b(medication|drug|medicine|aspirin|ibuprofen|acetaminophen)\b/) ? 
            query.split(' ').find(word => word.length > 4) : null;
            
        if (searchTerm) {
            const response = await fetch(`${this.apiConfig.fda.baseUrl}?search=${searchTerm}&limit=1`);
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                const drug = data.results[0];
                return `<div class="api-response">
                    <h4>💊 FDA Drug Information</h4>
                    <p><strong>Drug:</strong> ${drug.openfda?.brand_name?.[0] || searchTerm}</p>
                    <p><strong>Purpose:</strong> ${drug.purpose?.[0] || 'Not specified'}</p>
                    <p><strong>Active Ingredient:</strong> ${drug.active_ingredient?.[0] || 'Not specified'}</p>
                    <p class="disclaimer">⚠️ Source: FDA Database. Consult healthcare professionals for medical advice.</p>
                </div>`;
            }
        }
        
        return this.getFallbackResponse(query);
    }

    getFallbackResponse(query) {
        return `<p>I don't have enough data in my medical records to answer this question about "${query}".</p>
               <p>💡 <strong>Suggestion:</strong> Try adding an API key for enhanced responses, or consult medical databases.</p>
               <p class="disclaimer">⚠️ For medical concerns, please consult with a healthcare professional.</p>`;
    }

    getErrorResponse(error) {
        return `<p>❌ Sorry, I encountered an error while processing your request.</p>
               <p class="disclaimer">⚠️ Please try again or consult with a healthcare professional.</p>`;
    }
}

// Initialize the chatbot when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MedicalChatbot();
});