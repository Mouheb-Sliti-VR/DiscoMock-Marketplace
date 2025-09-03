// server.js
// TMF mock server - composition root
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const orderRouter = require('./routes/order');

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.set('json spaces', 2);

// import data and routers
const catalogRouter = require('./routes/catalog');
const { MarketplaceBundleOffer, productOfferings, productSpecifications } = require('./data/catalogData');

// mount routers
app.use('/catalog', catalogRouter);

// ------------------------------
// Raw TMF-ish endpoints (same data source)
// ------------------------------

// GET /productCatalog  -> returns bundled product offering ids & names
app.get('/productCatalog', (_req, res) => {
  const bundle = MarketplaceBundleOffer?.[0];
  if (!bundle || !bundle.bundledProductOffering) {
    return res.status(404).json({ code: 404, reason: 'Bundle not found' });
  }
  const offers = bundle.bundledProductOffering.map(o => ({ id: o.id, name: o.name }));
  res.json(offers);
});

// GET /productCatalog/productOffering -> all offers (raw)
app.get('/productCatalog/productOffering', (_req, res) => {
  res.json(productOfferings);
});

// GET /productCatalog/productSpecification -> all specs (raw)
app.get('/productCatalog/productSpecification', (_req, res) => {
  res.json(productSpecifications);
});

// GET /productCatalog/productOffering/:id -> offer by id
app.get('/productCatalog/productOffering/:id', (req, res) => {
  const offer = productOfferings.find(o => o.id === req.params.id);
  if (!offer) return res.status(404).json({ code: 404, reason: 'ProductOffering not found' });
  res.json(offer);
});

// GET /productCatalog/productSpecification/:id -> spec by id
app.get('/productCatalog/productSpecification/:id', (req, res) => {
  const spec = productSpecifications.find(s => s.id === req.params.id);
  if (!spec) return res.status(404).json({ code: 404, reason: 'ProductSpecification not found' });
  res.json(spec);
});

// GET /productCatalog/productSpecification/byOffering/:offeringId -> spec for given offering
app.get('/productCatalog/productSpecification/byOffering/:offeringId', (req, res) => {
  const offer = productOfferings.find(o => o.id === req.params.offeringId);
  if (!offer || !offer.productSpecification) return res.status(404).json({ code: 404, reason: 'ProductOffering or ProductSpecification not found' });
  const spec = productSpecifications.find(s => s.id === offer.productSpecification.id);
  if (!spec) return res.status(404).json({ code: 404, reason: 'ProductSpecification not found' });
  res.json(spec);
});


app.use('/order', orderRouter);
// health
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'tmf-mock-product-catalog', time: new Date().toISOString() }));

// fallback 404 for other routes
app.use((_req, res) => res.status(404).json({ code: 404, reason: 'Not found' }));

// Setup structured logger
const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: 'info', message, ...meta }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', message, ...meta }));
  }
};

// Error handler middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    error: err.message,
    path: req.path,
    method: req.method
  });
  
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  logger.info('Server started', { 
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    service: 'tmf-mock-product-catalog'
  });
});
