// ML Engine for MEDIBOT - Advanced Text Processing and Similarity
class MLEngine {
    constructor() {
        this.vocabulary = new Map();
        this.idfScores = new Map();
        this.documentVectors = [];
        this.stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'to', 'are', 'as', 'was', 'with', 'for', 'by', 'an', 'be', 'or', 'in', 'that', 'have', 'it', 'not', 'of', 'you', 'he', 'she', 'they', 'we', 'i', 'me', 'my', 'your', 'his', 'her', 'their', 'our']);
    }

    // Preprocess text - tokenization, stemming, stop word removal
    preprocessText(text) {
        return text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !this.stopWords.has(word))
            .map(word => this.stemWord(word));
    }

    // Simple stemming algorithm
    stemWord(word) {
        const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'ion', 'tion', 'ness', 'ment'];
        for (let suffix of suffixes) {
            if (word.endsWith(suffix) && word.length > suffix.length + 2) {
                return word.slice(0, -suffix.length);
            }
        }
        return word;
    }

    // Build TF-IDF vectors for medical dataset
    buildTFIDFVectors(medicalData) {
        const documents = medicalData.map(item => 
            `${item.disease_name} ${item.symptoms.join(' ')} ${item.causes.join(' ')} ${item.diagnosis} ${item.treatment.join(' ')}`
        );

        // Build vocabulary and document frequency
        const docFreq = new Map();
        const processedDocs = documents.map(doc => {
            const tokens = this.preprocessText(doc);
            const uniqueTokens = new Set(tokens);
            uniqueTokens.forEach(token => {
                docFreq.set(token, (docFreq.get(token) || 0) + 1);
            });
            return tokens;
        });

        // Calculate IDF scores
        const totalDocs = documents.length;
        docFreq.forEach((freq, token) => {
            this.idfScores.set(token, Math.log(totalDocs / freq));
        });

        // Build TF-IDF vectors
        this.documentVectors = processedDocs.map(tokens => {
            const termFreq = new Map();
            tokens.forEach(token => {
                termFreq.set(token, (termFreq.get(token) || 0) + 1);
            });

            const vector = new Map();
            termFreq.forEach((tf, token) => {
                const tfidf = tf * (this.idfScores.get(token) || 0);
                vector.set(token, tfidf);
            });
            return vector;
        });
    }

    // Calculate cosine similarity between query and documents
    calculateCosineSimilarity(queryVector, docVector) {
        let dotProduct = 0;
        let queryMagnitude = 0;
        let docMagnitude = 0;

        // Calculate dot product and magnitudes
        const allTerms = new Set([...queryVector.keys(), ...docVector.keys()]);
        
        allTerms.forEach(term => {
            const queryVal = queryVector.get(term) || 0;
            const docVal = docVector.get(term) || 0;
            
            dotProduct += queryVal * docVal;
            queryMagnitude += queryVal * queryVal;
            docMagnitude += docVal * docVal;
        });

        queryMagnitude = Math.sqrt(queryMagnitude);
        docMagnitude = Math.sqrt(docMagnitude);

        if (queryMagnitude === 0 || docMagnitude === 0) return 0;
        return dotProduct / (queryMagnitude * docMagnitude);
    }

    // Semantic search using TF-IDF and cosine similarity
    semanticSearch(query, medicalData, topK = 3) {
        const queryTokens = this.preprocessText(query);
        
        // Build query TF-IDF vector
        const queryTermFreq = new Map();
        queryTokens.forEach(token => {
            queryTermFreq.set(token, (queryTermFreq.get(token) || 0) + 1);
        });

        const queryVector = new Map();
        queryTermFreq.forEach((tf, token) => {
            const tfidf = tf * (this.idfScores.get(token) || 0);
            queryVector.set(token, tfidf);
        });

        // Calculate similarities
        const similarities = this.documentVectors.map((docVector, index) => ({
            index,
            similarity: this.calculateCosineSimilarity(queryVector, docVector),
            data: medicalData[index]
        }));

        // Sort by similarity and return top results
        return similarities
            .filter(item => item.similarity > 0.1) // Threshold for relevance
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    // Named Entity Recognition for medical terms
    extractMedicalEntities(text) {
        const medicalPatterns = {
            symptoms: /\b(pain|ache|fever|nausea|fatigue|headache|cough|shortness|breath|dizziness|swelling)\b/gi,
            body_parts: /\b(chest|head|stomach|heart|lung|kidney|liver|brain|joint|muscle)\b/gi,
            conditions: /\b(diabetes|hypertension|asthma|migraine|pneumonia|depression|anxiety|arthritis)\b/gi,
            medications: /\b(aspirin|ibuprofen|acetaminophen|insulin|metformin|antibiotics)\b/gi
        };

        const entities = {};
        Object.keys(medicalPatterns).forEach(category => {
            const matches = text.match(medicalPatterns[category]) || [];
            entities[category] = [...new Set(matches.map(m => m.toLowerCase()))];
        });

        return entities;
    }

    // Intent classification for medical queries
    classifyIntent(query) {
        const intents = {
            symptoms: /\b(symptom|sign|feel|hurt|pain|ache)\b/i,
            diagnosis: /\b(diagnos|test|check|exam|detect)\b/i,
            treatment: /\b(treat|cure|heal|medicine|medication|drug)\b/i,
            causes: /\b(cause|reason|why|what.*cause|due to)\b/i,
            prevention: /\b(prevent|avoid|stop|precaution|protect)\b/i,
            general: /\b(what is|what are|explain|tell me about|define)\b/i
        };

        const scores = {};
        Object.keys(intents).forEach(intent => {
            scores[intent] = intents[intent].test(query) ? 1 : 0;
        });

        const maxIntent = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );

        return { intent: maxIntent, confidence: scores[maxIntent] || 0.5 }; // Default confidence for general
    }

    // Confidence scoring for responses
    calculateConfidence(similarities, entities, intent) {
        const avgSimilarity = similarities.reduce((sum, item) => sum + item.similarity, 0) / similarities.length;
        const entityCount = Object.values(entities).flat().length;
        const intentConfidence = intent.confidence;

        // Weighted confidence score
        return Math.min(1.0, (avgSimilarity * 0.5) + (entityCount * 0.1) + (intentConfidence * 0.4));
    }
}