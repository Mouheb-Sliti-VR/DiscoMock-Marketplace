// data/catalogData.js

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
        price: { taxIncludedAmount: { value: 10.0, unit: "EUR" } },
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
    description: "Upload and showcase 3D models with supporting images in Orange Metaverse",
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
        id: "3D_MODEL_ONLY",
        name: "3D Model Only",
        description: "Only 3D models are supported, no additional media types",
        valueType: "boolean",
        configurable: false,
        productSpecCharacteristicValue: [
          { value: "true", isDefault: true },
        ],
      },
    ],
    href: "/productCatalog/productSpecification/3D_MODEL_ADS_SPEC_001",
  },
];

module.exports = { MarketplaceBundleOffer, productOfferings, productSpecifications };
