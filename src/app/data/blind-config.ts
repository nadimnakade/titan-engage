export type BlindFamily =
  | 'Roller Blinds'
  | 'Zebra Blinds'
  | 'Sheer Vertical Blinds'
  | 'Plicell'
  | 'Venetian Blinds'
  | 'Wooden Blinds'
  | 'Roman Blinds'
  | 'Laser-Cut Roller Blinds'
  | 'Curtains'
  | 'Vertical Blinds'
  | 'Other';

export interface BlindProductConfig {
  madeToMeasure: boolean;
  family: BlindFamily;
  enabledSpecs: string[];
  defaults: Record<string, string>;
  options: Record<string, string[]>;
  requiredSpecs?: string[];
  optionPriceAdjustments?: Record<string, Record<string, number>>;
  pricing?: {
    mode: 'manual' | 'squareMetre' | 'sizeBands';
    minimumCharge: number;
    pricePerSquareMetre: number;
    sizeBands: Array<{ maxWidth: number; maxDrop: number; price: number }>;
  };
  minWidth?: number;
  maxWidth?: number;
  minDrop?: number;
  maxDrop?: number;
}

export interface CatalogueProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  tax: number;
  config?: BlindProductConfig;
}

export const BLIND_FAMILIES: BlindFamily[] = [
  'Roller Blinds',
  'Zebra Blinds',
  'Sheer Vertical Blinds',
  'Plicell',
  'Venetian Blinds',
  'Wooden Blinds',
  'Roman Blinds',
  'Laser-Cut Roller Blinds',
  'Curtains',
  'Vertical Blinds',
  'Other',
];

export const CONFIGURABLE_SPECS = [
  ['room', 'Room / Window'],
  ['measurementBasis', 'Measurement basis'],
  ['fittingPosition', 'Fitting position'],
  ['mountingSurface', 'Hanging type'],
  ['fabric', 'Fabric / Colour / Finish'],
  ['operation', 'Operation'],
  ['manualMechanism', 'Manual control mechanism'],
  ['controlPosition', 'Control position'],
  ['openingDirection', 'Opening / travel direction'],
  ['stackingPosition', 'Stacking position'],
  ['chainLength', 'Chain / cord length'],
  ['rollDirection', 'Roll direction'],
  ['slatWidth', 'Slat width'],
  ['liftControlSide', 'Lift control side'],
  ['tiltControlSide', 'Tilt control side'],
  ['tiltMechanism', 'Tilt mechanism'],
  ['motorType', 'Motor type / model'],
  ['motorPower', 'Motor power'],
  ['motorControl', 'Motor control'],
  ['motorPosition', 'Motor position'],
  ['extras', 'Extras'],
  ['childSafetyDevice', 'Child-safety device / information'],
  ['instructions', 'Other description / special instructions'],
] as const;

export const DEFAULT_BLIND_CONFIG: BlindProductConfig = {
  madeToMeasure: true,
  family: 'Roller Blinds',
  enabledSpecs: [
    'room',
    'measurementBasis',
    'fittingPosition',
    'mountingSurface',
    'fabric',
    'operation',
    'manualMechanism',
    'controlPosition',
    'chainLength',
    'rollDirection',
    'motorType',
    'motorPower',
    'motorControl',
    'motorPosition',
    'extras',
    'childSafetyDevice',
    'instructions',
  ],
  defaults: {
    unit: 'cm',
    measurementBasis: 'Recess opening',
    fittingPosition: 'Inside recess',
    mountingSurface: 'Wall',
    operation: 'Manual',
    manualMechanism: 'Chain',
    controlPosition: 'Right',
    chainLength: 'Standard',
    rollDirection: 'Standard',
    childSafetyDevice: 'Chain tensioner',
  },
  options: {
    measurementBasis: ['Recess opening', 'Exact finished blind size'],
    fittingPosition: ['Inside recess', 'Outside recess'],
    mountingSurface: ['Wall', 'Ceiling', 'Recessed'],
    fabric: ['Blackout Grey', 'Blackout Charcoal', 'White', 'Supplier selection'],
    operation: ['Manual', 'Motorised', 'Cordless', 'Spring', 'Other'],
    manualMechanism: ['Chain', 'Cord', 'Wand', 'Other'],
    controlPosition: ['Left', 'Right'],
    openingDirection: ['Left', 'Right', 'Centre split', 'Up', 'Down', 'Other'],
    stackingPosition: ['Left', 'Right', 'Centre split'],
    chainLength: ['Standard', 'Custom length'],
    rollDirection: ['Standard', 'Reverse'],
    slatWidth: ['25 mm', '50 mm', '89 mm', '127 mm'],
    liftControlSide: ['Left', 'Right'],
    tiltControlSide: ['Left', 'Right'],
    tiltMechanism: ['Cord', 'Wand'],
    motorType: ['Somfy WireFree', 'Rechargeable tubular motor', 'Supplier compatible motor'],
    motorPower: ['Rechargeable battery', 'Battery', 'Mains'],
    motorControl: ['Remote', 'Wall switch', 'App', 'Smart-home control'],
    motorPosition: ['Left', 'Right'],
    extras: ['None', 'Cassette', 'Pelmet', 'Guide rails', 'Remote'],
    childSafetyDevice: ['Not applicable', 'Chain tensioner', 'Cord cleat', 'Breakaway connector', 'Supplier compliant device'],
  },
  requiredSpecs: ['room', 'fabric'],
  optionPriceAdjustments: {
    extras: { Cassette: 45, Pelmet: 70, 'Guide rails': 55, Remote: 35 },
    operation: { Motorised: 180 },
  },
  pricing: {
    mode: 'manual',
    minimumCharge: 0,
    pricePerSquareMetre: 0,
    sizeBands: [],
  },
  minWidth: 30,
  maxWidth: 300,
  minDrop: 30,
  maxDrop: 300,
};

export const DEFAULT_CATALOGUE: CatalogueProduct[] = [
  {
    id: 'PRD-BLIND-ROLLER',
    name: 'Premium Blackout Roller Blind',
    description: 'Made-to-measure blackout roller blind',
    price: 520,
    tax: 20,
    config: structuredClone(DEFAULT_BLIND_CONFIG),
  },
  { id: 'SRV-SUPPORT', name: 'Cloud Support Plan', description: 'Annual priority support', price: 850, tax: 20 },
  { id: 'SRV-AUDIT', name: 'Security Audit', description: 'Infrastructure security review', price: 1200, tax: 20 },
  { id: 'SRV-TRAIN', name: 'Team Training', description: 'On-site team workshop', price: 650, tax: 0 },
];

export function customerDescription(name: string, specs: Record<string, unknown>): string {
  const dimensions = specs['width'] && specs['drop']
    ? `${specs['width']} × ${specs['drop']} ${specs['unit'] || 'cm'}`
    : '';
  const operation = specs['operation'] === 'Manual'
    ? `Manual${specs['manualMechanism'] ? `, ${specs['manualMechanism']}` : ''}${specs['controlPosition'] ? ` ${specs['controlPosition']}` : ''}`
    : String(specs['operation'] || '');
  const venetianControls = [
    specs['liftControlSide'] ? `Lift ${specs['liftControlSide']}` : '',
    specs['tiltMechanism'] ? `Tilt ${specs['tiltMechanism']}${specs['tiltControlSide'] ? ` ${specs['tiltControlSide']}` : ''}` : '',
  ].filter(Boolean).join(', ');
  return [name, specs['room'], dimensions, specs['fabric'], specs['fittingPosition'], specs['mountingSurface'] ? `${specs['mountingSurface']} hanging` : '', operation, venetianControls, specs['rollDirection'] ? `${specs['rollDirection']} roll` : '', specs['extras'] && specs['extras'] !== 'None' ? specs['extras'] : '']
    .filter(Boolean)
    .join(' - ');
}
