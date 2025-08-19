// server.js
// Clean TMF-style mock Product Catalog for Metaverse Partners Marketplace
// Ready to run with: node server.js

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.set("json spaces", 2);


// Bundle Offers For Marketplace
// ------------------------------
const MarketplaceBundleOffer = [
  {
    id: "METAVERSE_MARKETPLACE_BUNDLE_001",
    name: "Metaverse Marketplace Bundle",
    description: "Complete partner advertising bundle for Orange Metaverse",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    isBundle: true,
    isSellable: true,
    channel: ["marketplace"],
    bundledProductOffering: [
      {
        id: "IMG_ADS_OFFER_001",
        name: "Images Advertisement Offer",
        bundledProductOfferingOption: {
          numberRelOfferLowerLimit: 0,
          numberRelOfferUpperLimit: 1,
        },
      },
      {
        id: "VIDEO_ADS_OFFER_001",
        name: "Video Advertisement Offer",
        bundledProductOfferingOption: {
          numberRelOfferLowerLimit: 0,
          numberRelOfferUpperLimit: 1,
        },
      },
      {
        id: "MIXED_ADS_OFFER_001",
        name: "Mixed Advertisement Offer",
        bundledProductOfferingOption: {
          numberRelOfferLowerLimit: 0,
          numberRelOfferUpperLimit: 1,
        },
      },
      {
        id: "3D_MODEL_ADS_OFFER_001",
        name: "Mixed Advertisement Plus",
        bundledProductOfferingOption: {
          numberRelOfferLowerLimit: 0,
          numberRelOfferUpperLimit: 1,
        },
      },
    ],
  },
];

// ------------------------------
// Product Offerings
// ------------------------------
const productOfferings = [
  {
    id: "IMG_ADS_OFFER_001",
    name: "Images Advertisement Offer",
    description:
      "Upload and display image advertisements in Orange Metaverse",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    isBundle: false,
    isSellable: true,
    channel: ["marketplace"],
    productSpecification: {
      id: "IMG_ADS_SPEC_001",
      href: "/productCatalog/productSpecification/IMG_ADS_SPEC_001",
    },
    productOfferingPrice: [
      {
        id: "IMG_PER_IMAGE_PRICE",
        name: "Image Fixed Price (per image)",
        description: "Fixed price for one image advertisement",
        lifecycleStatus: "ACTIVE",
        priceType: "ONE_TIME",
        price: { taxIncludedAmount: { value: 10.0, unit: "EUR" } },
      },
    ],
    productOfferingTerm: [
      {
        name: "Display Term",
        description:
          "Standard display period and placement managed by marketplace",
      },
    ],
    href: "/productCatalog/productOffering/IMG_ADS_OFFER_001",
  },
  {
    id: "VIDEO_ADS_OFFER_001",
    name: "Video Advertisement Offer",
    description: "Upload and display video advertisements in Orange Metaverse",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    isBundle: false,
    isSellable: true,
    channel: ["marketplace"],
    productSpecification: {
      id: "VIDEO_ADS_SPEC_001",
      href: "/productCatalog/productSpecification/VIDEO_ADS_SPEC_001",
    },
    productOfferingPrice: [
      {
        id: "VIDEO_FIXED_PRICE",
        name: "Video Fixed Price",
        description: "Fixed price for one video advertisement",
        lifecycleStatus: "ACTIVE",
        priceType: "ONE_TIME",
        price: { taxIncludedAmount: { value: 50.0, unit: "EUR" } },
      },
    ],
    href: "/productCatalog/productOffering/VIDEO_ADS_OFFER_001",
  },
  {
    id: "MIXED_ADS_OFFER_001",
    name: "Mixed Advertisement Offer",
    description:
      "Upload combination of images and videos for metaverse advertising",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    isBundle: false,
    isSellable: true,
    channel: ["marketplace"],
    productSpecification: {
      id: "MIXED_ADS_SPEC_001",
      href: "/productCatalog/productSpecification/MIXED_ADS_SPEC_001",
    },
    productOfferingPrice: [
      {
        id: "MIXED_BASE_PRICE",
        name: "Mixed Content Base Price",
        description: "Base price for mixed content advertising",
        lifecycleStatus: "ACTIVE",
        priceType: "ONE_TIME",
        price: { taxIncludedAmount: { value: 15.0, unit: "EUR" } },
      },
      {
        id: "MIXED_IMAGE_PRICE",
        name: "Additional Image Price",
        description: "Price per additional image in mixed content",
        lifecycleStatus: "ACTIVE",
        priceType: "ONE_TIME",
        price: { taxIncludedAmount: { value: 5.0, unit: "EUR" } },
      },
      {
        id: "MIXED_VIDEO_PRICE",
        name: "Video Addition Price",
        description: "Additional price when video is included",
        lifecycleStatus: "ACTIVE",
        priceType: "ONE_TIME",
        price: { taxIncludedAmount: { value: 25.0, unit: "EUR" } },
      },
    ],
    href: "/productCatalog/productOffering/MIXED_ADS_OFFER_001",
  },
  {
    id: "3D_MODEL_ADS_OFFER_001",
    name: "3D Model Advertisement Offer",
    description: "Upload and showcase 3D models in Orange Metaverse",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    isBundle: false,
    isSellable: true,
    channel: ["marketplace"],
    // mark as add-on for Mixed Advertisement Offer
    addOnFor: ["MIXED_ADS_OFFER_001"],
    productSpecification: {
      id: "3D_MODEL_ADS_SPEC_001",
      href: "/productCatalog/productSpecification/3D_MODEL_ADS_SPEC_001",
    },
    productOfferingPrice: [
      {
        id: "3D_MODEL_FIXED_PRICE",
        name: "3D Model Fixed Price",
        description: "Fixed price for 3D model showcase",
        lifecycleStatus: "ACTIVE",
        priceType: "ONE_TIME",
        price: { taxIncludedAmount: { value: 100.0, unit: "EUR" } },
      },
    ],
    href: "/productCatalog/productOffering/3D_MODEL_ADS_OFFER_001",
  },
];

// ------------------------------
// Product Specifications
// ------------------------------
const productSpecifications = [
  {
    id: "IMG_ADS_SPEC_001",
    name: "Image Advertisement Specification",
    description:
      "Specification for partner image advertisement content in metaverse",
    productSpecificationType: "ATOMIC",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    channel: ["marketplace"],
    productSpecCharacteristic: [
      {
        id: "IMAGE_FORMAT",
        name: "Image Format",
        description: "Accepted image formats",
        valueType: "string",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "image/png", isDefault: true },
          { value: "image/jpeg", isDefault: false },
        ],
      },
      {
        id: "IMAGE_MAX_SIZE",
        name: "Maximum Image Size",
        description: "Maximum image file size",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "5242880", unitOfMeasure: "bytes", isDefault: true }, // 5 MB
        ],
      },
      {
        id: "IMAGE_MIN_DIMENSIONS",
        name: "Minimum Image Dimensions",
        description: "Minimum width and height in pixels",
        valueType: "string",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "1080x1080", isDefault: true },
        ],
      },
      {
        id: "IMAGE_MAX_COUNT",
        name: "Maximum Image Count",
        description: "Max number of images allowed per offer",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [{ value: "4", isDefault: true }],
      },
    ],
    href: "/productCatalog/productSpecification/IMG_ADS_SPEC_001",
  },
  {
    id: "VIDEO_ADS_SPEC_001",
    name: "Video Advertisement Specification",
    description:
      "Specification for partner video advertisement content in metaverse",
    productSpecificationType: "ATOMIC",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    channel: ["marketplace"],
    productSpecCharacteristic: [
      {
        id: "VIDEO_FORMAT",
        name: "Video Format",
        description: "Accepted video formats",
        valueType: "string",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "video/mp4", isDefault: true },
          { value: "video/quicktime", isDefault: false },
        ],
      },
      {
        id: "VIDEO_MAX_SIZE",
        name: "Maximum Video Size",
        description: "Maximum video file size",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "419430400", unitOfMeasure: "bytes", isDefault: true }, // 400 MB
        ],
      },
      {
        id: "VIDEO_MAX_DURATION",
        name: "Maximum Video Duration",
        description: "Maximum video duration in seconds",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "300", unitOfMeasure: "seconds", isDefault: true },
        ],
      },
      {
        id: "VIDEO_MAX_COUNT",
        name: "Maximum Video Count",
        description: "Max number of videos allowed per offer",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [{ value: "2", isDefault: true }],
      },
    ],
    href: "/productCatalog/productSpecification/VIDEO_ADS_SPEC_001",
  },
  {
    id: "MIXED_ADS_SPEC_001",
    name: "Mixed Advertisement Specification",
    description:
      "Specification for mixed content (images + videos) in metaverse",
    productSpecificationType: "ATOMIC",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    channel: ["marketplace"],
    productSpecCharacteristic: [
      {
        id: "MIXED_IMG_COUNT",
        name: "Image Count",
        description: "Number of images in mixed content",
        valueType: "integer",
        configurable: true,
        productSpecCharacteristicValue: [
          { valueFrom: "0", valueTo: "4", isDefault: false },
        ],
      },
      {
        id: "MIXED_VIDEO_COUNT",
        name: "Video Count",
        description: "Number of videos in mixed content",
        valueType: "integer",
        configurable: true,
        productSpecCharacteristicValue: [
          { valueFrom: "0", valueTo: "2", isDefault: false },
        ],
      },
      {
        id: "MIXED_CONTENT_CONSTRAINT",
        name: "Content Constraint",
        description: "At least one content type must be selected",
        valueType: "string",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "MIN_ONE_CONTENT_TYPE", isDefault: true },
        ],
      },
    ],
    href: "/productCatalog/productSpecification/MIXED_ADS_SPEC_001",
  },
  {
    id: "3D_MODEL_ADS_SPEC_001",
    name: "3D Model Advertisement Specification",
    description: "Specification for 3D model showcase in metaverse",
    productSpecificationType: "ATOMIC",
    lifecycleStatus: "ACTIVE",
    version: "1.0",
    channel: ["marketplace"],
    productSpecCharacteristic: [
      {
        id: "3D_MODEL_FORMAT",
        name: "3D Model Format",
        description: "Accepted 3D model formats",
        valueType: "string",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "model/gltf-binary", isDefault: true },
        ],
      },
      {
        id: "3D_MODEL_MAX_SIZE",
        name: "Maximum 3D Model Size",
        description: "Maximum 3D model file size",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "104857600", unitOfMeasure: "bytes", isDefault: true },
        ],
      },
      {
        id: "3D_MODEL_COMPLEXITY",
        name: "Model Complexity",
        description: "Maximum polygon count for performance",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "50000", unitOfMeasure: "polygons", isDefault: true },
        ],
      },
      {
        id: "3D_MODEL_MAX_COUNT",
        name: "Maximum Model Count",
        description: "Maximum number of 3D models allowed",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "1", isDefault: true },
        ],
      },
      {
        id: "3D_MODEL_ASSOCIATED_IMAGES",
        name: "Associated Images Allowed",
        description: "Number of images allowed when adding a 3D model as add-on",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "2", isDefault: true },
        ],
      },
      {
        id: "3D_MODEL_ASSOCIATED_VIDEOS",
        name: "Associated Videos Allowed",
        description: "Number of videos allowed when adding a 3D model as add-on",
        valueType: "integer",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "4", isDefault: true },
        ],
      },
    ],
    href: "/productCatalog/productSpecification/3D_MODEL_ADS_SPEC_001",
  },
];






// ------------------------------
// Routes (TMF-ish raw)
// ------------------------------

// All MarketplaceBundleOffer (ODACAT)
app.get("/productCatalog", (_req, res) => {
  const bundle = MarketplaceBundleOffer[0];
  if (!bundle || !bundle.bundledProductOffering) {
    return res.status(404).json({ code: 404, reason: "Bundle not found" });
  }
  const offers = bundle.bundledProductOffering.map((o) => ({
    id: o.id,
    name: o.name,
  }));
  res.json(offers);
});

// All ProductOffering (All Offers)
app.get("/productCatalog/productOffering", (_req, res) => {
  res.json(productOfferings);
});

// All ProductSpecification (All Specs)
app.get("/productCatalog/productSpecification", (_req, res) => {
  res.json(productSpecifications);
});

// Health Check Api
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "tmf-mock-product-catalog",
    time: new Date().toISOString(),
  });
});

// Get detailed info for each offer in the marketplace bundle
app.get("/productCatalog/bundleOffers/details", (_req, res) => {
  const bundle = MarketplaceBundleOffer[0];
  if (!bundle || !bundle.bundledProductOffering) {
    return res.status(404).json({ code: 404, reason: "Bundle not found" });
  }
  const details = bundle.bundledProductOffering.map((bundled) => {
    const offer = productOfferings.find((o) => o.id === bundled.id);
    const spec =
      offer && offer.productSpecification
        ? productSpecifications.find(
          (s) => s.id === offer.productSpecification.id
        )
        : null;
    return {
      id: bundled.id,
      name: bundled.name,
      description: offer ? offer.description : null,
      price:
        offer && offer.productOfferingPrice ? offer.productOfferingPrice : null,
      constraints:
        spec && spec.productSpecCharacteristic
          ? spec.productSpecCharacteristic
          : null,
    };
  });
  res.json(details);
});

// Get a product offering by ID
app.get("/productCatalog/productOffering/:id", (req, res) => {
  const offer = productOfferings.find((o) => o.id === req.params.id);
  if (!offer)
    return res
      .status(404)
      .json({ code: 404, reason: "ProductOffering not found" });
  res.json(offer);
});

// Get the product specification for a given offering ID
app.get(
  "/productCatalog/productSpecification/byOffering/:offeringId",
  (req, res) => {
    const offer = productOfferings.find((o) => o.id === req.params.offeringId);
    if (!offer || !offer.productSpecification)
      return res
        .status(404)
        .json({
          code: 404,
          reason: "ProductOffering or ProductSpecification not found",
        });
    const spec = productSpecifications.find(
      (s) => s.id === offer.productSpecification.id
    );
    if (!spec)
      return res
        .status(404)
        .json({ code: 404, reason: "ProductSpecification not found" });
    res.json(spec);
  }
);

// ------------------------------
// Projection: Frontend Catalog Items (BundledProductSpec[])
// ------------------------------
function getChar(spec, charId) {
  return spec?.productSpecCharacteristic?.find((c) => c.id === charId);
}
function getDefaultValue(spec, charId) {
  const ch = getChar(spec, charId);
  if (!ch) return null;
  const v =
    ch.productSpecCharacteristicValue?.find((v) => v.isDefault) ||
    ch.productSpecCharacteristicValue?.[0];
  return v ?? null;
}
function getNumber(spec, charId) {
  const v = getDefaultValue(spec, charId);
  if (!v) return null;
  const num = v.value ?? v.valueTo ?? v.valueFrom;
  const n = Number(num);
  return Number.isFinite(n) ? n : null;
}
function getRangeMax(spec, charId) {
  const ch = getChar(spec, charId);
  const v = ch?.productSpecCharacteristicValue?.[0];
  if (!v) return null;
  if (v.valueTo != null) {
    const n = Number(v.valueTo);
    return Number.isFinite(n) ? n : null;
  }
  if (v.value != null) {
    const n = Number(v.value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function mapName(offer) {
  switch (offer.id) {
    case "IMG_ADS_OFFER_001":
      return "Advertise With Images";
    case "VIDEO_ADS_OFFER_001":
      return "Advertise With Video";
    case "MIXED_ADS_OFFER_001":
      return "Advertise with Mixed Media";
    case "3D_MODEL_ADS_OFFER_001":
      return "Showcase in 3D";
    default:
      return offer.name;
  }
}
function mapSubtitle(offer) {
  switch (offer.id) {
    case "IMG_ADS_OFFER_001":
      return "Showcase Your Brand";
    case "VIDEO_ADS_OFFER_001":
      return "Engage with Motion";
    case "MIXED_ADS_OFFER_001":
      return "Best of Both Worlds";
    case "3D_MODEL_ADS_OFFER_001":
      return "Immersive 3D Presence";
    default:
      return offer.name;
  }
}
function mapDescription(offer) {
  switch (offer.id) {
    case "IMG_ADS_OFFER_001":
      return "Advertise with up to 4 images to showcase your brand effectively.";
    default:
      return offer.description;
  }
}

app.get("/catalog/items", (_req, res) => {
  const bundle = MarketplaceBundleOffer?.[0];
  if (!bundle?.bundledProductOffering) {
    return res.status(404).json({ code: 404, reason: "Bundle not found" });
  }

  const items = bundle.bundledProductOffering
    .map((b) => productOfferings.find((o) => o.id === b.id))
    .filter(Boolean)
    .map((offer) => {
      const spec = productSpecifications.find(
        (s) => s.id === offer.productSpecification?.id
      );

      const item = {
        id: offer.id,
        name: mapName(offer),
        subtitle: mapSubtitle(offer),
        description: mapDescription(offer),
        ProductSpec: {},
      };

      // Populate ProductSpec according to your interface { Images?: number; Videos?: number; }
      if (spec) {
        switch (offer.id) {
          case "IMG_ADS_OFFER_001": {
            const maxImages = getNumber(spec, "IMAGE_MAX_COUNT") ?? 4;
            item.ProductSpec.Images = maxImages;
            break;
          }
          case "VIDEO_ADS_OFFER_001": {
            const maxVideos = getNumber(spec, "VIDEO_MAX_COUNT") ?? 1;
            item.ProductSpec.Videos = maxVideos;
            break;
          }
          case "MIXED_ADS_OFFER_001": {
            const maxImgs = getRangeMax(spec, "MIXED_IMG_COUNT") ?? 4;
            const maxVideos = getRangeMax(spec, "MIXED_VIDEO_COUNT") ?? 2;
            item.ProductSpec.Images = maxImgs;
            item.ProductSpec.Videos = maxVideos;
            break;
          }
          case "3D_MODEL_ADS_OFFER_001": {
            const models = getNumber(spec, "3D_MODEL_MAX_COUNT") ?? 1;
            item.ProductSpec.maxModels = maxModels;
            break;
          }
          default:
            break;
        }
      }

      return item;
    });

  res.json(items);
});

// ------------------------------
app.listen(PORT, () => {
  console.log(`TMF mock server listening on http://localhost:${PORT}`);
});
