// services/subscriptionService.js
const { SUBSCRIPTIONS } = require('../store/memoryStore');
const { v4: uuidv4 } = require('uuid');

// Logger utility
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      ...meta
    }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      ...meta
    }));
  }
};

function createSubscription(order, partner) {
  if (!order || !partner || !partner.email) {
    logger.error('Invalid subscription data provided', { 
      hasOrder: !!order,
      hasPartner: !!partner,
      hasEmail: !!partner?.email
    });
    throw new Error('Invalid subscription data');
  }

  // Subscription key: user+offering (not orderId)
  const userKey = partner.email;
  const offerKey = order.offering.id;
  // Find existing non-expired subscription for this user+offer
  let existingSubId = null;
  let existingSub = null;
  const now = new Date();
  for (const subId in SUBSCRIPTIONS) {
    const sub = SUBSCRIPTIONS[subId];
    if (sub.partnerEmail === userKey && sub.offering.id === offerKey) {
      // Check expiration
      if (sub.expirationDate && new Date(sub.expirationDate) > now) {
        existingSubId = subId;
        existingSub = sub;
        break;
      } else {
        // Expired: delete
        delete SUBSCRIPTIONS[subId];
      }
    }
  }

  // Calculate expiration: 30 days from now, or extend if already active
  const DAYS = 30;
  let startDate = order.subscription?.startDate || now.toISOString();
  let expirationDate;
  if (existingSub) {
    // Extend: remaining days + 30
    const prevExp = new Date(existingSub.expirationDate);
    const remainingMs = prevExp - now;
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
    expirationDate = new Date(now.getTime() + (DAYS + remainingDays) * 24 * 60 * 60 * 1000).toISOString();
    // Remove old subscription (override)
    delete SUBSCRIPTIONS[existingSubId];
    startDate = now.toISOString();
  } else {
    expirationDate = new Date(now.getTime() + DAYS * 24 * 60 * 60 * 1000).toISOString();
  }

  const subscriptionId = order.orderId;
  const subscription = {
    id: subscriptionId,
    orderId: order.orderId,
    partnerEmail: partner.email,
    partnerCompanyName: partner.companyName,
    status: 'ACTIVE',
    startDate,
    expirationDate,
    billing: {
      amount: order.billing.amount,
      currency: order.billing.currency
    },
    offering: {
      id: order.offering.id,
      ...getOfferingDetails(order.offering)
    }
  };

  // Store in memory (will automatically save to file through proxy)
  SUBSCRIPTIONS[subscriptionId] = subscription;
  
  logger.info('Subscription created', { 
    subscriptionId,
    partnerId: partner.email,
    offeringId: order.offering.id,
    expirationDate
  });
  
  return subscription;
}

function getOfferingDetails(offering) {
  const details = {};
  
  if (offering.imagesCount !== undefined) {
    details.imagesCount = offering.imagesCount;
  }
  if (offering.videosCount !== undefined) {
    details.videosCount = offering.videosCount;
  }
  if (offering.modelsCount !== undefined) {
    details.modelsCount = offering.modelsCount;
  }
  
  // For backwards compatibility with old data
  if (Object.keys(details).length === 0 && offering.count !== undefined) {
    details.count = offering.count;
  }
  
  return details;
}

function getPartnerSubscriptions(partnerEmail) {
  const now = new Date();
  // Remove expired subscriptions
  for (const subId in SUBSCRIPTIONS) {
    const sub = SUBSCRIPTIONS[subId];
    if (sub.expirationDate && new Date(sub.expirationDate) <= now) {
      delete SUBSCRIPTIONS[subId];
    }
  }
  const partnerSubs = Object.values(SUBSCRIPTIONS).filter(sub => 
    sub.partnerEmail === partnerEmail
  );
  logger.info('Retrieved partner subscriptions', {
    partnerId: partnerEmail,
    count: partnerSubs.length
  });
  return partnerSubs;
}

function getSubscriptionById(subscriptionId) {
  const subscription = SUBSCRIPTIONS[subscriptionId];
  
  logger.info('Subscription lookup result', {
    subscriptionId,
    found: !!subscription
  });
  
  return subscription;
}

function getAllSubscriptions() {
  const subs = Object.values(SUBSCRIPTIONS);
  
  logger.info('Retrieved all subscriptions', {
    totalCount: subs.length
  });
  
  return subs;
}

// Statistics helper
function getSubscriptionStats() {
  const subs = getAllSubscriptions();
  const byPartner = {};
  const byOffering = {};
  
  subs.forEach(sub => {
    byPartner[sub.partnerEmail] = (byPartner[sub.partnerEmail] || 0) + 1;
    byOffering[sub.offering.id] = (byOffering[sub.offering.id] || 0) + 1;
  });
  
  return {
    totalSubscriptions: subs.length,
    byPartner,
    byOffering
  };
}

module.exports = {
  createSubscription,
  getPartnerSubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  getSubscriptionStats
};
