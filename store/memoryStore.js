// store/memoryStore.js
const { loadSubscriptions, saveSubscriptions } = require('./fileStore');

const QUOTES = {};
const ORDERS = {};
const INSTANCES = {};
const SUBSCRIPTIONS = loadSubscriptions(); // Load subscriptions from file on startup

// Create a proxy to automatically save subscriptions when they change
const SUBSCRIPTIONS_PROXY = new Proxy(SUBSCRIPTIONS, {
    set: function(target, property, value) {
        target[property] = value;
        console.log('Saving subscription to file:', property);
        console.log('Subscription data:', JSON.stringify(value, null, 2));
        console.log('Total subscriptions:', Object.keys(target).length);
        saveSubscriptions(target);
        return true;
    },
    deleteProperty: function(target, property) {
        delete target[property];
        console.log('Deleting subscription from file:', property);
        console.log('Total subscriptions after delete:', Object.keys(target).length);
        saveSubscriptions(target);
        return true;
    }
});

module.exports = {
    QUOTES,
    ORDERS,
    INSTANCES,
    SUBSCRIPTIONS: SUBSCRIPTIONS_PROXY
};
