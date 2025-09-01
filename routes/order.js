// routes/order.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateOrder, confirmOrder } = require('../services/orderServer');
const { QUOTES, ORDERS } = require('../store/memoryStore');

// Auth service URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://marketplace-vr.onrender.com';

// Middleware to verify token and get user details
const verifyToken = async (req, res, next) => {
  try {
    const bearerHeader = req.headers['authorization'];
    
    if (!bearerHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = bearerHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Get user details from your auth service
    const response = await axios.get(`${AUTH_SERVICE_URL}/auth/getUserDetails`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!response.data || !response.data.user) {
      return res.status(401).json({ error: 'Invalid token or user not found' });
    }

    // Attach user info to the request
    req.user = response.data.user;
    req.token = token;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(401).json({ error: 'Authentication failed', details: error.message });
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
        id: req.user.email,
        companyName: req.user.companyName
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /order/confirm
router.post('/confirm', verifyToken, (req, res) => {
  try {
    const payload = {
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
    const result = confirmOrder(payload);
    if (result.error) return res.status(400).json(result);
    // Add partner info to the confirmation response
    res.status(201).json({
      ...result,
      partner: {
        id: req.user.email,
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

module.exports = router;
