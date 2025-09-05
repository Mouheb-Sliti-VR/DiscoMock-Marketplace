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
    const images = Number(sel.selectedImagesCount ?? 1);
    console.log('Image price calculation:', {
      pricePerImage: unit,
      numberOfImages: images,
      total: unit * images
    });
    return unit * images;
  }

  if (offer.id === 'VIDEO_ADS_OFFER_001') {
    const p = prices.find(p => p.id === 'VIDEO_FIXED_PRICE') || prices[0];
    const unit = p?.price?.taxIncludedAmount?.value ?? 0;
    const videos = Number(sel.selectedVideosCount ?? 1);
    console.log('Video price calculation:', {
      pricePerVideo: unit,
      numberOfVideos: videos,
      total: unit * videos
    });
    return unit * videos;
  }

  if (offer.id === 'MIXED_ADS_OFFER_001') {
    if (sel.selectedImagesCount === undefined || sel.selectedVideosCount === undefined) {
      throw new Error('Both selectedImagesCount and selectedVideosCount are required for mixed media offers');
    }
    const pBase = prices.find(p => p.id === 'MIXED_BASE_PRICE');
    const pImg = prices.find(p => p.id === 'MIXED_IMAGE_PRICE');
    const pVid = prices.find(p => p.id === 'MIXED_VIDEO_PRICE');
    const base = pBase?.price?.taxIncludedAmount?.value ?? 0;
    const imageUnit = pImg?.price?.taxIncludedAmount?.value ?? 0;
    const videoUnit = pVid?.price?.taxIncludedAmount?.value ?? 0;
    const imgs = Number(sel.selectedImagesCount);
    const vids = Number(sel.selectedVideosCount);
    console.log('Mixed media price calculation:', {
      basePrice: base,
      pricePerImage: imageUnit,
      pricePerVideo: videoUnit,
      numberOfImages: imgs,
      numberOfVideos: vids,
      total: base + imageUnit * imgs + videoUnit * vids
    });
    return base + imageUnit * imgs + videoUnit * vids;
  }

  if (offer.id === '3D_MODEL_ADS_OFFER_001') {
    if (sel.selectedModelsCount === undefined) {
      throw new Error('selectedModelsCount is required for 3D model offers');
    }
    const p = prices.find(p => p.id === '3D_MODEL_FIXED_PRICE') || prices[0];
    const unit = p?.price?.taxIncludedAmount?.value ?? 0;
    const models = Number(sel.selectedModelsCount);
    console.log('3D model price calculation:', {
      pricePerModel: unit,
      numberOfModels: models,
      total: unit * models
    });
    return unit * models;
  }

  const p = prices.find(p => p.priceType === 'ONE_TIME') || prices[0];
  return p?.price?.taxIncludedAmount?.value ?? 0;
}

module.exports = { computePriceForSelection };
