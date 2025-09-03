const fs = require('fs');
const path = require('path');

// Path to the JSON storage file
const STORAGE_FILE = path.join(__dirname, 'subscriptions.json');

// Load data from file
function loadSubscriptions() {
    try {
        if (!fs.existsSync(STORAGE_FILE)) {
            // Initialize with empty object if file doesn't exist
            fs.writeFileSync(STORAGE_FILE, '{}', 'utf8');
            console.log('Created new subscriptions file');
            return {};
        }
        const data = fs.readFileSync(STORAGE_FILE, 'utf8');
        const parsed = JSON.parse(data);
        console.log('Loaded subscriptions from file:', Object.keys(parsed).length);
        return parsed;
    } catch (error) {
        console.error('Error loading subscriptions:', error);
        return {};
    }
}

// Save data to file
function saveSubscriptions(subscriptions) {
    try {
        fs.writeFileSync(STORAGE_FILE, JSON.stringify(subscriptions, null, 2));
        console.log('Subscriptions saved to file');
    } catch (error) {
        console.error('Error saving subscriptions:', error);
    }
}

module.exports = {
    loadSubscriptions,
    saveSubscriptions
};
