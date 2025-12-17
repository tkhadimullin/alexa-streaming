/**
 * Setup Script - Run once to populate DynamoDB with content
 * 
 * This can be triggered by a special intent or run manually.
 * Edit the INITIAL_CONTENT below with your streams.
 */

const { saveContentLibrary, TABLE_NAME } = require('./content-library');

// ============================================
// EDIT YOUR CONTENT HERE
// ============================================
const INITIAL_CONTENT = {
    "ocean sounds": {
        "url": "https://example.com/ocean.mp3",
        "title": "Ocean Sounds"
    },
    "jazz": {
        "url": "https://example.com/jazz.mp3", 
        "title": "Jazz Radio"
    },
    "white noise": {
        "url": "https://example.com/whitenoise.mp3",
        "title": "White Noise"
    }
};

const DEFAULT_CONTENT_KEY = "ocean sounds";
// ============================================

async function setupContent() {
    console.log(`Setting up content in table: ${TABLE_NAME}`);
    console.log('Content:', JSON.stringify(INITIAL_CONTENT, null, 2));
    console.log('Default:', DEFAULT_CONTENT_KEY);
    
    const success = await saveContentLibrary(INITIAL_CONTENT, DEFAULT_CONTENT_KEY);
    
    if (success) {
        console.log('✓ Content library saved successfully!');
        return true;
    } else {
        console.error('✗ Failed to save content library');
        return false;
    }
}

module.exports = { setupContent, INITIAL_CONTENT, DEFAULT_CONTENT_KEY };

