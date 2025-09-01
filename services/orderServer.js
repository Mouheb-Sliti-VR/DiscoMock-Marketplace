// services/orderService.js
const { v4: uuidv4 } = require('uuid');
const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const { productOfferings, productSpecifications } = require('../data/catalogData');
const { QUOTES, ORDERS, INSTANCES } = require('../store/memoryStore');
const { computePriceForSelection } = require('./priceService');

const PARTY_MGMT_CALLBACK = process.env.PARTY_MGMT_CALLBACK || null;

function findOffering(id) {
  return productOfferings.find(o => o.id === id);
}
function findSpecForOffering(offer) {
  return productSpecifications.find(s => s.id === offer?.productSpecification?.id);
}
function readSpecNumber(spec, charId) {
  if (!spec) return null;
  const ch = spec.productSpecCharacteristic?.find(c => c.id === charId);
  if (!ch) return null;
  const v = ch.productSpecCharacteristicValue?.find(x => x.isDefault) || ch.productSpecCharacteristicValue?.[0];
  const raw = v?.value ?? v?.valueTo ?? v?.valueFrom;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function validateSelection(sel) {
  const errors = [];
  const offer = findOffering(sel.offeringId);
  if (!offer) { errors.push({ code: 'OFFER_NOT_FOUND', message: `Offering ${sel.offeringId} not found` }); return errors; }
  const spec = findSpecForOffering(offer);

  if (offer.id === 'IMG_ADS_OFFER_001' || offer.id === 'MIXED_ADS_OFFER_001') {
    const requested = Number(sel.imagesCount ?? 0);
    const max = readSpecNumber(spec, 'IMAGE_MAX_COUNT') ?? 4;
    if (requested > max) errors.push({ code: 'IMAGE_COUNT_EXCEEDED', message: `Requested ${requested} images, max allowed ${max}` });
  }

  if (offer.id === 'VIDEO_ADS_OFFER_001' || offer.id === 'MIXED_ADS_OFFER_001') {
    const requestedV = Number(sel.videosCount ?? 0);
    const maxV = readSpecNumber(spec, 'VIDEO_MAX_COUNT') ?? 1;
    if (requestedV > maxV) errors.push({ code: 'VIDEO_COUNT_EXCEEDED', message: `Requested ${requestedV} videos, max allowed ${maxV}` });
  }

  return errors;
}

async function validatePartner(partyId) {
  if (!PARTY_MGMT_CALLBACK) return { ok: true };
  try {
    const resp = await fetch(PARTY_MGMT_CALLBACK, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ partyId })
    });
    if (!resp.ok) return { ok: false, reason: `partner service returned ${resp.status}` };
    const body = await resp.json();
    return { ok: Boolean(body.valid), detail: body };
  } catch (err) {
    return { ok: false, reason: err.message };
  }
}

async function validateOrder(payload) {
  const { partyId, selections } = payload;
  const errors = [];

  if (!partyId || !Array.isArray(selections)) {
    return { valid: false, errors: [{ code: 'BAD_REQUEST', message: 'partyId and selections[] required' }] };
  }

  const pv = await validatePartner(partyId);
  if (!pv.ok) errors.push({ code: 'PARTY_VALIDATION_FAILED', message: pv.reason || 'partner validation failed', detail: pv.detail ?? null });

  let total = 0;
  for (const s of selections) {
    errors.push(...validateSelection(s));
    const price = computePriceForSelection(s);
    if (price === null) errors.push({ code: 'PRICE_ERROR', message: `Cannot compute price for ${s.offeringId}` });
    else total += price;
  }

  const quoteId = uuidv4();
  const valid = errors.length === 0;
  QUOTES[quoteId] = { payload, price: total, valid, errors, createdAt: new Date().toISOString() };

  return { quoteId, valid, price: total, errors };
}

function confirmOrder(payload) {
  console.log('Confirming order with payload:', payload);
  
  // Handle both direct payload and quoteId cases
  let effective;
  if (payload.quoteId) {
    const quote = QUOTES[payload.quoteId];
    if (!quote) {
      throw new Error('Invalid quote ID');
    }
    // Merge quote payload with simplified partner info
    effective = {
      ...quote.payload,
      quoteId: payload.quoteId,
      partner: {
        email: payload.partner.email,
        companyName: payload.partner.companyName
      }
    };
  } else {
    effective = {
      ...payload,
      partner: {
        email: payload.partner.email,
        companyName: payload.partner.companyName
      }
    };
  }

  console.log('Effective payload:', effective);
  
  if (!effective || !Array.isArray(effective.selections)) {
    throw new Error('Invalid payload structure');
  }

  // re-validate selections (sync)
  const errors = [];
  for (const s of effective.selections) errors.push(...validateSelection(s));
  if (errors.length) return { error: true, errors };

  const orderId = uuidv4();
  const order = { 
    id: orderId,
    quoteId: effective.quoteId,
    partyId: effective.partyId,
    partner: {
      email: effective.partner.email,
      companyName: effective.partner.companyName
    },
    selections: effective.selections, 
    status: 'CONFIRMED', 
    createdAt: new Date().toISOString() 
  };
  const createdInstances = [];
  for (const s of effective.selections) {
    const iid = uuidv4();
    const inst = { id: iid, offeringId: s.offeringId, partyId: effective.partyId, metadata: s, createdAt: new Date().toISOString(), orderId };
    INSTANCES[iid] = inst;
    createdInstances.push(inst);
  }
  order.instances = createdInstances.map(i => i.id);
  
  // Get the quote data for pricing if available
  const quoteData = effective.quoteId ? QUOTES[effective.quoteId] : null;
  const total = quoteData ? quoteData.price : effective.selections.reduce((acc, s) => acc + (computePriceForSelection(s) || 0), 0);
  
  order.billing = { 
    total, 
    currency: 'EUR', 
    lines: effective.selections.map(s => ({ 
      offeringId: s.offeringId, 
      amount: computePriceForSelection(s) || 0 
    })) 
  };

  ORDERS[orderId] = order;
  return { 
    orderId,
    status: order.status,
    offering: {
      id: order.selections[0].offeringId,  // Since we typically have one offering per order
      count: order.selections[0].imagesCount || order.selections[0].videosCount || 1
    },
    billing: {
      amount: order.billing.total,
      currency: order.billing.currency
    },
    partner: order.partner
  };
}

module.exports = {
  validateOrder,
  confirmOrder,
  validateSelection // exported for tests or outside usage
};
