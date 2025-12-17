// Content library - add your streams here
const CONTENT_LIBRARY = {
    'ocean sounds': { 
        url: 'https://example.com/jazz.mp3', 
        title: 'Ocean Sounds' 
    },
    'air play': { 
        url: 'https://example.com/news.mp3', 
        title: 'Air Play Stream' 
    }
};

// Default content when no specific type requested
const DEFAULT_CONTENT = 'ocean sounds';

// Helper to get content names for speech
function getContentListForSpeech() {
    const types = Object.keys(CONTENT_LIBRARY);
    if (types.length === 0) return 'nothing available';
    if (types.length === 1) return types[0];
    const last = types.pop();
    return types.join(', ') + ', or ' + last;
}

// Get content by key, returns null if not found
function getContent(key) {
    return CONTENT_LIBRARY[key] || null;
}

// Get all content keys
function getContentKeys() {
    return Object.keys(CONTENT_LIBRARY);
}

module.exports = {
    CONTENT_LIBRARY,
    DEFAULT_CONTENT,
    getContentListForSpeech,
    getContent,
    getContentKeys,
};

