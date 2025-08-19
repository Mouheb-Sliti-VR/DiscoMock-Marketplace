// routes/order.js
const express = require('express');
const router = express.Router();
const { validateOrder, confirmOrder } = require('../services/orderService');
const { QUOTES, ORDERS } = require('../store/memoryStore');

// POST /order/validate
router.post('/validate', async (req, res) => {
  try {
    const result = await validateOrder(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /order/confirm
router.post('/confirm', (req, res) => {
  try {
    const result = confirmOrder(req.body);
    if (result.error) return res.status(400).json(result);
    res.status(201).json(result);
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
