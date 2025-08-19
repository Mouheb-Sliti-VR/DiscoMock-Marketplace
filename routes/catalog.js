// routes/catalog.js
const express = require('express');
const router = express.Router();
const { MarketplaceBundleOffer, productOfferings, productSpecifications } = require('../data/catalogData');

// small helper: get spec numeric default value
function specNumber(spec, charId, fallback = null) {
  if (!spec) return fallback;
  const ch = spec.productSpecCharacteristic?.find(c => c.id === charId);
  if (!ch) return fallback;
  const v = ch.productSpecCharacteristicValue?.find(x => x.isDefault) || ch.productSpecCharacteristicValue?.[0];
  if (!v) return fallback;
  const raw = v.value ?? v.valueTo ?? v.valueFrom;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

router.get('/items', (_req, res) => {
  const bundle = MarketplaceBundleOffer?.[0];
  if (!bundle?.bundledProductOffering) return res.status(404).json({ code: 404, reason: 'Bundle not found' });

  const items = bundle.bundledProductOffering
    .map(b => productOfferings.find(o => o.id === b.id))
    .filter(Boolean)
    .map(offer => {
      const spec = productSpecifications.find(s => s.id === offer.productSpecification?.id);
      const base = {
        id: offer.id,
        name: (() => {
          switch (offer.id) {
            case 'IMG_ADS_OFFER_001': return 'Advertise With Images';
            case 'VIDEO_ADS_OFFER_001': return 'Advertise With Video';
            case 'MIXED_ADS_OFFER_001': return 'Advertise with Mixed Media';
            case '3D_MODEL_ADS_OFFER_001': return 'Showcase in 3D';
            default: return offer.name;
          }
        })(),
        subtitle: (() => {
          switch (offer.id) {
            case 'IMG_ADS_OFFER_001': return 'Showcase Your Brand';
            case 'VIDEO_ADS_OFFER_001': return 'Engage with Motion';
            case 'MIXED_ADS_OFFER_001': return 'Best of Both Worlds';
            case '3D_MODEL_ADS_OFFER_001': return 'Immersive 3D Presence';
            default: return offer.name;
          }
        })(),
        description: (() => {
          if (offer.id === 'IMG_ADS_OFFER_001') return 'Advertise with up to 4 images to showcase your brand effectively.';
          return offer.description;
        })(),
        ProductSpec: {}
      };

      // fill productSpec based on spec characteristics and the edits you requested
      if (offer.id === 'IMG_ADS_OFFER_001') {
        base.ProductSpec.Images = specNumber(spec, 'IMAGE_MAX_COUNT', 4);
      } else if (offer.id === 'VIDEO_ADS_OFFER_001') {
        // per your request: Videos: 2 (override spec if needed)
        base.ProductSpec.Videos = specNumber(spec, 'VIDEO_MAX_COUNT', 2);
      } else if (offer.id === 'MIXED_ADS_OFFER_001') {
        base.ProductSpec.Images = specNumber(spec, 'MIXED_IMG_COUNT', 4) || 4;
        base.ProductSpec.Videos = specNumber(spec, 'VIDEO_MAX_COUNT', 2) || 2;
      } else if (offer.id === '3D_MODEL_ADS_OFFER_001') {
        // this is the extra add-on: include maxModels and associated media allowances
        base.ProductSpec.maxModels = specNumber(spec, '3D_MODEL_MAX_MODELS', 1);
        // include associated Images/Videos allowances (you requested Images:2, Videos:4)
        base.ProductSpec.Images = specNumber(spec, '3D_MODEL_ASSOCIATED_IMAGES', 2);
        base.ProductSpec.Videos = specNumber(spec, '3D_MODEL_ASSOCIATED_VIDEOS', 4);
        // also expose addOnFor info so frontend knows this is an add-on
        if (Array.isArray(offer.addOnFor) && offer.addOnFor.length) {
          base.addOnFor = offer.addOnFor;
        }
      }

      return base;
    });

  res.json(items);
});

module.exports = router;
