// API Configuration for MEDIBOT
const API_CONFIG = {
    // Ollama Local AI Configuration (Disabled)
    ollama: {
        enabled: false, // Disabled for local-only operation
        baseUrl: 'http://localhost:11434/api/generate',
        model: 'llama2',
        temperature: 0.3,
        stream: false
    },
    
    // Google Gemini (Disabled)
    gemini: {
        enabled: false, // Disabled for local-only operation
        apiKey: '',
        model: 'gemini-1.5-flash',
        maxTokens: 500,
        temperature: 0.3
    },
    
    // Medical APIs (Disabled)
    fda: {
        enabled: false, // Disabled for local-only operation
        baseUrl: 'https://api.fda.gov/drug/label.json',
        rateLimit: 1000
    },
    
    // Fallback settings
    fallback: {
        useLocalOnly: true, // Forces local dataset only
        showAPIErrors: false
    }
};

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}