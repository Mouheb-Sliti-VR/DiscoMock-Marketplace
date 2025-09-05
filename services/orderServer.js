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

function getOfferingCounts(selection) {
  const offer = findOffering(selection.offeringId);
  if (!offer) return { count: 0 };

  switch (offer.id) {
    case 'IMG_ADS_OFFER_001':
      return {
        imagesCount: selection.selectedImagesCount
      };
    
    case 'VIDEO_ADS_OFFER_001':
      return {
        videosCount: selection.selectedVideosCount
      };
    
    case 'MIXED_ADS_OFFER_001':
      return {
        imagesCount: selection.selectedImagesCount,
        videosCount: selection.selectedVideosCount
      };
    
    case '3D_MODEL_ADS_OFFER_001':
      return {
        modelsCount: selection.selectedModelsCount,
        imagesCount: selection.selectedImagesCount,
        videosCount: selection.selectedVideosCount
      };
    
    default:
      return { count: 1 };
  }
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
  
  console.log('Validating selection:', {
    selection: sel,
    offeringId: sel.offeringId
  });

  const offer = findOffering(sel.offeringId);
  console.log('Found offer:', {
    offer: offer,
    hasProductSpec: !!offer?.ProductSpec
  });

  if (!offer) { 
    errors.push({ code: 'OFFER_NOT_FOUND', message: `Offering ${sel.offeringId} not found` }); 
    return errors; 
  }

  // Log the offer structure
  console.log('Offer details:', {
    id: offer.id,
    name: offer.name,
    productSpec: offer.ProductSpec,
    productSpecification: offer.productSpecification
  });

  // Check if required fields are present based on offer type
  const spec = findSpecForOffering(offer);
  console.log('Product specification:', {
    spec: spec,
    specId: offer.productSpecification?.id
  });

  function getMaxCount(spec, characteristicId) {
    const characteristic = spec?.productSpecCharacteristic?.find(c => c.id === characteristicId);
    if (!characteristic) return null;
    const value = characteristic.productSpecCharacteristicValue[0];
    return value.valueTo ? parseInt(value.valueTo) : parseInt(value.value);
  }

  switch (offer.id) {
    case 'IMG_ADS_OFFER_001':
      if (sel.selectedImagesCount === undefined) {
        errors.push({ code: 'MISSING_IMAGES_COUNT', message: 'selectedImagesCount is required for image offers' });
      }
      const maxImages = getMaxCount(spec, 'IMAGE_MAX_COUNT');
      if (maxImages && sel.selectedImagesCount > maxImages) {
        errors.push({ code: 'IMAGE_COUNT_EXCEEDED', message: `Requested ${sel.selectedImagesCount} images, max allowed ${maxImages}` });
      }
      break;

    case 'VIDEO_ADS_OFFER_001':
      if (sel.selectedVideosCount === undefined) {
        errors.push({ code: 'MISSING_VIDEOS_COUNT', message: 'selectedVideosCount is required for video offers' });
      }
      const maxVideos = getMaxCount(spec, 'VIDEO_MAX_COUNT');
      if (maxVideos && sel.selectedVideosCount > maxVideos) {
        errors.push({ code: 'VIDEO_COUNT_EXCEEDED', message: `Requested ${sel.selectedVideosCount} videos, max allowed ${maxVideos}` });
      }
      break;

    case 'MIXED_ADS_OFFER_001':
      if (sel.selectedImagesCount === undefined || sel.selectedVideosCount === undefined) {
        errors.push({ code: 'MISSING_MEDIA_COUNT', message: 'Both selectedImagesCount and selectedVideosCount are required for mixed media offers' });
      }
      const maxMixedImages = getMaxCount(spec, 'MIXED_IMG_COUNT');
      if (maxMixedImages && sel.selectedImagesCount > maxMixedImages) {
        errors.push({ code: 'IMAGE_COUNT_EXCEEDED', message: `Requested ${sel.selectedImagesCount} images, max allowed ${maxMixedImages}` });
      }
      const maxMixedVideos = getMaxCount(spec, 'MIXED_VIDEO_COUNT');
      if (maxMixedVideos && sel.selectedVideosCount > maxMixedVideos) {
        errors.push({ code: 'VIDEO_COUNT_EXCEEDED', message: `Requested ${sel.selectedVideosCount} videos, max allowed ${maxMixedVideos}` });
      }
      break;

    case '3D_MODEL_ADS_OFFER_001':
      if (sel.selectedModelsCount === undefined) {
        errors.push({ code: 'MISSING_MODELS_COUNT', message: 'selectedModelsCount is required for 3D model offers' });
      }
      const maxModels = getMaxCount(spec, '3D_MODEL_MAX_COUNT');
      if (maxModels && sel.selectedModelsCount > maxModels) {
        errors.push({ code: 'MODEL_COUNT_EXCEEDED', message: `Requested ${sel.selectedModelsCount} models, max allowed ${maxModels}` });
      }
      if (sel.selectedImagesCount !== undefined && sel.selectedImagesCount > 0) {
        errors.push({ code: 'IMAGES_NOT_SUPPORTED', message: 'Images are not supported in 3D model offers' });
      }
      if (sel.selectedVideosCount !== undefined && sel.selectedVideosCount > 0) {
        errors.push({ code: 'VIDEOS_NOT_SUPPORTED', message: 'Videos are not supported in 3D model offers' });
      }
      break;
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

async function validateOrder(payload, user) {
  const { selections } = payload;
  const errors = [];

  if (!Array.isArray(selections)) {
    return { valid: false, errors: [{ code: 'BAD_REQUEST', message: 'selections[] array is required' }] };
  }

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
  let effective;
  if (payload.quoteId) {
    const quote = QUOTES[payload.quoteId];
    if (!quote) {
      throw new Error({
        code: 'INVALID_QUOTE',
        message: 'The provided quote ID is invalid or has expired'
      });
    }
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
  // Internal result with all data needed for subscription
  const orderResult = {
    orderId,
    status: order.status,
    offering: {
      id: order.selections[0].offeringId,
      ...getOfferingCounts(order.selections[0])
    },
    billing: {
      amount: order.billing.total,
      currency: order.billing.currency
    },
    partner: order.partner,
    selections: order.selections,
    instances: order.instances
  };

  // Clean public response
  return {
    orderId: orderResult.orderId,
    offering: orderResult.offering,
    billing: orderResult.billing,
    subscription: {
      id: orderResult.orderId,  // Using orderId as subscription reference
      status: 'ACTIVE',
      startDate: order.createdAt
    }
  };
}

module.exports = {
  validateOrder,
  confirmOrder,
  validateSelection // exported for tests or outside usage
};
