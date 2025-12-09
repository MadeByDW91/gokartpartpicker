export type PartCategory =
  | "ENGINE"
  | "CLUTCH"
  | "TORQUE_CONVERTER"
  | "CHAIN"
  | "SPROCKET"
  | "BRAKE"
  | "TIRE"
  | "FRAME"
  | "ACCESSORY";

export type ChainSize = "#35" | "#40" | "#41" | "420" | "428" | "OTHER";

export interface CompatibilityInfo {
  engineModels?: string[];   // e.g. ["Predator 212", "Tillotson 212"]
  shaftSize?: string;        // e.g. '3/4"' or '1"'
  chainSize?: ChainSize;     // e.g. "#35"
}

export interface Part {
  id: string;
  name: string;
  brand: string;
  category: PartCategory;
  price: number;
  sku: string;
  imageUrl?: string;
  compatibility?: CompatibilityInfo;
}

export const MOCK_PARTS: Part[] = [
  {
    id: "mock-001",
    name: "Predator 212cc Engine",
    brand: "Harbor Freight",
    category: "ENGINE",
    price: 149.99,
    sku: "HF-69730",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    compatibility: {
      engineModels: ["Predator 212"],
      shaftSize: '3/4"',
      chainSize: "#35",
    },
  },
  {
    id: "mock-002",
    name: "Tillotson 212cc Engine",
    brand: "Tillotson",
    category: "ENGINE",
    price: 299.99,
    sku: "TIL-212R",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    compatibility: {
      engineModels: ["Tillotson 212"],
      shaftSize: '3/4"',
      chainSize: "#35",
    },
  },
  {
    id: "mock-003",
    name: "30 Series Torque Converter Kit",
    brand: "Comet",
    category: "TORQUE_CONVERTER",
    price: 89.99,
    sku: "COM-30-34",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      engineModels: ["Predator 212", "Tillotson 212"],
      shaftSize: '3/4"',
      chainSize: "#35",
    },
  },
  {
    id: "mock-004",
    name: "40 Series Torque Converter",
    brand: "Comet",
    category: "TORQUE_CONVERTER",
    price: 149.99,
    sku: "COM-40-1",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      engineModels: ["Predator 420", "Briggs & Stratton"],
      shaftSize: '1"',
      chainSize: "#40",
    },
  },
  {
    id: "mock-005",
    name: "#35 Chain - 5ft Roll",
    brand: "DID",
    category: "CHAIN",
    price: 24.99,
    sku: "DID-35-5FT",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      chainSize: "#35",
    },
  },
  {
    id: "mock-006",
    name: "60T #35 Axle Sprocket",
    brand: "Azusa",
    category: "SPROCKET",
    price: 19.99,
    sku: "AZU-60T-35",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      chainSize: "#35",
    },
  },
  {
    id: "mock-007",
    name: "72T #35 Axle Sprocket",
    brand: "Azusa",
    category: "SPROCKET",
    price: 22.99,
    sku: "AZU-72T-35",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      chainSize: "#35",
    },
  },
  {
    id: "mock-008",
    name: "Hydraulic Brake Kit for Live Axle",
    brand: "Azusa",
    category: "BRAKE",
    price: 129.99,
    sku: "AZU-BRK-HYD",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      // Brakes are generally universal for live axle setups
    },
  },
  {
    id: "mock-009",
    name: "Off-Road Tires - 18x9.5-8",
    brand: "Carlisle",
    category: "TIRE",
    price: 34.99,
    sku: "CAR-18-95-8",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      // Tires are sized for specific wheel diameters
    },
  },
  {
    id: "mock-010",
    name: "Centrifugal Clutch - 3/4\" Shaft",
    brand: "MaxTorque",
    category: "CLUTCH",
    price: 39.99,
    sku: "MT-CL-34",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      engineModels: ["Predator 212", "Tillotson 212"],
      shaftSize: '3/4"',
      chainSize: "#35",
    },
  },
  {
    id: "mock-011",
    name: "Go-Kart Frame Kit - 36\" Wheelbase",
    brand: "Azusa",
    category: "FRAME",
    price: 249.99,
    sku: "AZU-FRM-36",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      // Frames are generally compatible with standard components
    },
  },
  {
    id: "mock-012",
    name: "Steering Wheel Kit",
    brand: "Azusa",
    category: "ACCESSORY",
    price: 49.99,
    sku: "AZU-STE-001",
    imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    compatibility: {
      // Steering components are generally universal
    },
  },
];

