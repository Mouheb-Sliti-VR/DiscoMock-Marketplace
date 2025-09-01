// services/subscriptionService.js
const { SUBSCRIPTIONS } = require('../store/memoryStore');
const { v4: uuidv4 } = require('uuid');

function createSubscription(order, partner) {
  console.log('Creating subscription with order:', JSON.stringify(order, null, 2));
  console.log('Partner info:', JSON.stringify(partner, null, 2));
  
  if (!order || !partner || !partner.email) {
    console.error('Invalid order or partner data');
    throw new Error('Invalid subscription data');
  }

  const subscriptionId = uuidv4();
  const subscription = {
    id: subscriptionId,
    orderId: order.orderId,
    partner: {
      email: partner.email,
      companyName: partner.companyName
    },
    status: 'ACTIVE',
    startDate: new Date().toISOString(),
    billing: {
      amount: order.billing.total,
      currency: order.billing.currency
    },
    offering: order.billing.lines[0].offeringId // Since we typically have one offering per order
  };

  console.log('Created subscription object:', JSON.stringify(subscription, null, 2));
  
  // Store in memory
  SUBSCRIPTIONS[subscriptionId] = subscription;
  
  // Verify storage
  const stored = SUBSCRIPTIONS[subscriptionId];
  console.log('Verified subscription in memory:', stored ? 'YES' : 'NO');
  console.log('Total subscriptions:', Object.keys(SUBSCRIPTIONS).length);
  
  return subscription;
  return subscription;
}

function getPartnerSubscriptions(partnerEmail) {
  return Object.values(SUBSCRIPTIONS).filter(sub => 
    sub.partnerEmail === partnerEmail
  );
}

function getSubscriptionById(subscriptionId) {
  return SUBSCRIPTIONS[subscriptionId];
}

function getAllSubscriptions() {
  return Object.values(SUBSCRIPTIONS);
}

// Debug helper
function logSubscriptionStats() {
  const subs = getAllSubscriptions();
  console.log(`Total subscriptions: ${subs.length}`);
  if (subs.length > 0) {
    console.log('Subscriptions by partner:');
    const byPartner = {};
    subs.forEach(sub => {
      byPartner[sub.partnerEmail] = (byPartner[sub.partnerEmail] || 0) + 1;
    });
    console.log(byPartner);
  }
}

module.exports = {
  createSubscription,
  getPartnerSubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  logSubscriptionStats
};
