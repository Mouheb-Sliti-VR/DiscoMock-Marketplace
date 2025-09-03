// routes/order.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateOrder, confirmOrder } = require('../services/orderServer');
const { createSubscription, getPartnerSubscriptions, getSubscriptionById, getAllSubscriptions, logSubscriptionStats } = require('../services/subscriptionService');
const { QUOTES, ORDERS } = require('../store/memoryStore');
require("dotenv").config();

// Auth service URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
if (!AUTH_SERVICE_URL) {
  console.error('WARNING: AUTH_SERVICE_URL is not set in environment variables');
}

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

// Standard response format
const formatResponse = (success, data = null, error = null) => ({
  status: success ? 'success' : 'error',
  ...(data && { data }),
  ...(error && { error })
});

// Middleware to verify token and get user details
const verifyToken = async (req, res, next) => {
  try {
    const bearerHeader = req.headers['authorization'];
    
    if (!bearerHeader) {
      return res.status(401).json(formatResponse(false, null, {
        code: 'AUTH_NO_TOKEN',
        message: 'No authorization token provided'
      }));
    }

    const token = bearerHeader.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json(formatResponse(false, null, {
        code: 'AUTH_INVALID_FORMAT',
        message: 'Invalid authorization header format'
      }));
    }

    const response = await axios.get(AUTH_SERVICE_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.data?.user) {
      return res.status(401).json(formatResponse(false, null, {
        code: 'AUTH_INVALID_TOKEN',
        message: 'Invalid token or user not found'
      }));
    }

    req.user = response.data.user;
    req.token = token;
    
    logger.info('Authentication successful', {
      userId: req.user.email,
      companyName: req.user.companyName
    });
    
    next();
  } catch (error) {
    logger.error('Authentication failed', {
      error: error.message,
      status: error.response?.status
    });
    
    if (error.response?.status === 403) {
      return res.status(403).json(formatResponse(false, null, {
        code: 'AUTH_FORBIDDEN',
        message: 'Insufficient permissions'
      }));
    }
    
    return res.status(401).json(formatResponse(false, null, {
      code: 'AUTH_FAILED',
      message: 'Authentication failed',
      details: error.message
    }));
  }
};

// POST /order/validate
router.post('/validate', verifyToken, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      partner: {
        id: req.user.email, // Using email as partner ID
        companyName: req.user.companyName,
        email: req.user.email
      }
    };
    const result = await validateOrder(payload);
    // Add partner info to the response
    res.json({
      ...result,
      partner: {
        companyName: req.user.companyName,
        email: req.user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /order/confirm
router.post('/confirm', verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      console.error('No user data in request - authentication may have failed silently');
      return res.status(401).json({ 
        error: 'Authentication required',
        details: 'User data not found in request'
      });
    }
    
    console.log('Starting order confirmation for user:', {
      email: req.user.email,
      companyName: req.user.companyName
    });
    
    let payload;
    if (req.body.quoteId) {
      // If confirming with a quoteId, get the quote data
      console.log('Looking for quote:', {
        quoteId: req.body.quoteId,
        availableQuotes: Object.keys(QUOTES)
      });
      
      const quote = QUOTES[req.body.quoteId];
      if (!quote) {
        console.error('Quote not found:', req.body.quoteId);
        return res.status(404).json({ 
          error: 'Quote not found',
          details: 'The provided quote ID is invalid or has expired'
        });
      }
      
      // Use the quote data as the payload
      payload = {
        quoteId: req.body.quoteId,
        partner: {
          id: req.user.email,
          companyName: req.user.companyName,
          email: req.user.email,
          address: req.user.address,
          city: req.user.city,
          country: req.user.country
        }
      };
    } else {
      // Direct confirmation with full payload
      payload = {
        ...req.body,
        partner: {
          id: req.user.email,
          companyName: req.user.companyName,
          email: req.user.email,
          address: req.user.address,
          city: req.user.city,
          country: req.user.country
        }
      };
    }
    
    console.log('Confirming order with payload:', payload);
    const result = await confirmOrder(payload);
    console.log('Order confirmation result:', result);
    
    if (result.error) {
      console.error('Order confirmation failed:', result);
      return res.status(400).json({
        error: 'Order confirmation failed',
        details: result.errors || result.error
      });
    }

    // Create subscription since order is confirmed
    console.log('Creating subscription for order...');
    const partner = {
      email: req.user.email,
      companyName: req.user.companyName
    };
    console.log('Partner info for subscription:', partner);
    const subscription = createSubscription({
      orderId: result.orderId,
      billing: result.billing,
      offering: result.offering,
      subscription: result.subscription
    }, partner);
    console.log('Created subscription:', subscription);

    // Add partner info to the confirmation response
    // Note: result already contains the subscription info from orderServer
    res.status(201).json({
      ...result,
      partner: {
        companyName: req.user.companyName,
        email: req.user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET quote/order helpers
router.get('/quote/:id', (req, res) => {
  const q = QUOTES[req.params.id];
  if (!q) return res.status(404).json({ code: 404, message: 'quote not found' });
  res.json(q);
});
router.get('/order/:id', (req, res) => {
  const o = ORDERS[req.params.id];
  if (!o) return res.status(404).json({ code: 404, message: 'order not found' });
  res.json(o);
});

// Subscription endpoints
router.get('/subscriptions', verifyToken, (req, res) => {
  try {
    const subscriptions = getPartnerSubscriptions(req.user.email);
    
    res.json(formatResponse(true, {
      partner: {
        companyName: req.user.companyName,
        email: req.user.email
      },
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        startDate: sub.startDate,
        billing: {
          amount: sub.billing.amount,
          currency: sub.billing.currency
        },
        offering: {
          id: sub.offering.id,
          count: sub.offering.count
        }
      })),
      total: subscriptions.length
    }));
  } catch (err) {
    logger.error('Failed to fetch subscriptions', {
      userId: req.user.email,
      error: err.message
    });
    res.status(500).json(formatResponse(false, null, {
      code: 'SUBSCRIPTION_FETCH_ERROR',
      message: 'Failed to fetch subscriptions'
    }));
  }
});

router.get('/subscription/:id', verifyToken, (req, res) => {
  try {
    const subscription = getSubscriptionById(req.params.id);
    if (!subscription) {
      return res.status(404).json(formatResponse(false, null, {
        code: 'SUBSCRIPTION_NOT_FOUND',
        message: 'Subscription not found'
      }));
    }
    
    // Verify the subscription belongs to the requesting partner
    if (subscription.partnerEmail !== req.user.email) {
      return res.status(403).json(formatResponse(false, null, {
        code: 'SUBSCRIPTION_ACCESS_DENIED',
        message: 'Access denied to this subscription'
      }));
    }
    
    res.json(formatResponse(true, {
      id: subscription.id,
      status: subscription.status,
      startDate: subscription.startDate,
      billing: {
        amount: subscription.billing.amount,
        currency: subscription.billing.currency
      },
      offering: {
        id: subscription.offering.id,
        count: subscription.offering.count
      },
      partner: {
        companyName: subscription.partnerCompanyName,
        email: subscription.partnerEmail
      }
    }));
  } catch (err) {
    logger.error('Failed to fetch subscription', {
      userId: req.user.email,
      subscriptionId: req.params.id,
      error: err.message
    });
    res.status(500).json(formatResponse(false, null, {
      code: 'SUBSCRIPTION_FETCH_ERROR',
      message: 'Failed to fetch subscription details'
    }));
  }
});

module.exports = router;
