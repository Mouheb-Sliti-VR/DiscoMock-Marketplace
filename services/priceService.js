// services/priceService.js
const { productOfferings } = require('../data/catalogData');

function findOffering(id) {
  return productOfferings.find(o => o.id === id);
}

function computePriceForSelection(sel) {
  const offer = findOffering(sel.offeringId);
  if (!offer) return null;
  const prices = offer.productOfferingPrice || [];

  if (offer.id === 'IMG_ADS_OFFER_001') {
    const p = prices.find(p => p.id === 'IMG_PER_IMAGE_PRICE') || prices[0];
    const unit = p?.price?.taxIncludedAmount?.value ?? 0;
    const images = Number(sel.imagesCount ?? 1);
    return unit * images;
  }

  if (offer.id === 'VIDEO_ADS_OFFER_001') {
    const p = prices.find(p => p.id === 'VIDEO_FIXED_PRICE') || prices[0];
    const unit = p?.price?.taxIncludedAmount?.value ?? 0;
    const videos = Number(sel.videosCount ?? 1);
    return unit * videos;
  }

  if (offer.id === 'MIXED_ADS_OFFER_001') {
    const pBase = prices.find(p => p.id === 'MIXED_BASE_PRICE');
    const pImg = prices.find(p => p.id === 'MIXED_IMAGE_PRICE');
    const pVid = prices.find(p => p.id === 'MIXED_VIDEO_PRICE');
    const base = pBase?.price?.taxIncludedAmount?.value ?? 0;
    const imageUnit = pImg?.price?.taxIncludedAmount?.value ?? 0;
    const videoUnit = pVid?.price?.taxIncludedAmount?.value ?? 0;
    const imgs = Number(sel.imagesCount ?? 0);
    const vids = Number(sel.videosCount ?? 0);
    return base + imageUnit * imgs + videoUnit * vids;
  }

  const p = prices.find(p => p.priceType === 'ONE_TIME') || prices[0];
  return p?.price?.taxIncludedAmount?.value ?? 0;
}

module.exports = { computePriceForSelection };
