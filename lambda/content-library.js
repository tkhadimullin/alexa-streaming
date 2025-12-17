/**
 * Content Library
 * 
 * Content is loaded from CONTENT_LIBRARY_JSON environment variable.
 * Set this in Alexa Developer Console (Code tab → Environment Variables).
 * 
 * Example JSON value:
 * {
 *   "ocean sounds": { "url": "https://example.com/ocean.mp3", "title": "Ocean Sounds" },
 *   "air play": { "url": "https://example.com/airplay.mp3", "title": "Air Play Stream" }
 * }
 * 
 * DEFAULT_CONTENT_KEY env var sets which content plays by default (optional, defaults to first key).
 */

// Load content library from environment
function loadContentLibrary() {
    const jsonStr = process.env.CONTENT_LIBRARY_JSON;
    if (!jsonStr) {
        console.warn('CONTENT_LIBRARY_JSON environment variable not set');
        return {};
    }
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Failed to parse CONTENT_LIBRARY_JSON:', e.message);
        return {};
    }
}

const CONTENT_LIBRARY = loadContentLibrary();

// Default content key (from env or first available)
const DEFAULT_CONTENT = process.env.DEFAULT_CONTENT_KEY 
    || Object.keys(CONTENT_LIBRARY)[0] 
    || null;

// Helper to get content names for speech
function getContentListForSpeech() {
    const types = Object.keys(CONTENT_LIBRARY);
    if (types.length === 0) return 'nothing configured';
    if (types.length === 1) return types[0];
    const typesCopy = [...types];
    const last = typesCopy.pop();
    return typesCopy.join(', ') + ', or ' + last;
}

// Get content by key, returns null if not found
function getContent(key) {
    return CONTENT_LIBRARY[key] || null;
}

// Get all configured content keys
function getContentKeys() {
    return Object.keys(CONTENT_LIBRARY);
}

// Check if any content is configured
function hasContent() {
    return Object.keys(CONTENT_LIBRARY).length > 0;
}

// Get default content (may be null if not configured)
function getDefaultContent() {
    return DEFAULT_CONTENT ? CONTENT_LIBRARY[DEFAULT_CONTENT] : null;
}

module.exports = {
    CONTENT_LIBRARY,
    DEFAULT_CONTENT,
    getContentListForSpeech,
    getContent,
    getContentKeys,
    hasContent,
    getDefaultContent,
};
