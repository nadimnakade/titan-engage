export type BlindFamily =
  | 'Roller'
  | 'Day & Night'
  | 'Vertical'
  | 'Venetian'
  | 'Roman'
  | 'Pleated / Cellular'
  | 'Panel Track'
  | 'Other';

export interface BlindProductConfig {
  madeToMeasure: boolean;
  family: BlindFamily;
  enabledSpecs: string[];
  defaults: Record<string, string>;
  options: Record<string, string[]>;
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
  'Roller',
  'Day & Night',
  'Vertical',
  'Venetian',
  'Roman',
  'Pleated / Cellular',
  'Panel Track',
  'Other',
];

export const CONFIGURABLE_SPECS = [
  ['room', 'Room / Window'],
  ['measurementBasis', 'Measurement basis'],
  ['fittingPosition', 'Fitting position'],
  ['mountingSurface', 'Mounting surface'],
  ['fabric', 'Fabric / Colour / Finish'],
  ['operation', 'Operation'],
  ['manualMechanism', 'Manual control mechanism'],
  ['controlPosition', 'Control position'],
  ['openingDirection', 'Opening / travel direction'],
  ['stackingPosition', 'Stacking position'],
  ['chainLength', 'Chain / cord length'],
  ['rollDirection', 'Roll direction'],
  ['slatWidth', 'Slat width'],
  ['motorType', 'Motor type / model'],
  ['motorPower', 'Motor power'],
  ['motorControl', 'Motor control'],
  ['motorPosition', 'Motor position'],
  ['extras', 'Extras'],
  ['instructions', 'Special instructions'],
] as const;

export const DEFAULT_BLIND_CONFIG: BlindProductConfig = {
  madeToMeasure: true,
  family: 'Roller',
  enabledSpecs: [
    'room',
    'measurementBasis',
    'fittingPosition',
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
    'instructions',
  ],
  defaults: {
    unit: 'cm',
    measurementBasis: 'Recess opening',
    fittingPosition: 'Inside recess',
    operation: 'Manual',
    manualMechanism: 'Chain',
    controlPosition: 'Right',
    chainLength: 'Standard',
    rollDirection: 'Standard',
  },
  options: {
    measurementBasis: ['Recess opening', 'Exact finished blind size'],
    fittingPosition: ['Inside recess', 'Outside recess'],
    mountingSurface: ['Wall', 'Ceiling', 'Window frame'],
    fabric: ['Blackout Grey', 'Blackout Charcoal', 'White', 'Supplier selection'],
    operation: ['Manual', 'Motorised', 'Cordless', 'Spring'],
    manualMechanism: ['Chain', 'Cord', 'Wand'],
    controlPosition: ['Left', 'Right'],
    openingDirection: ['Left', 'Right', 'Centre split', 'Up', 'Down'],
    stackingPosition: ['Left', 'Right', 'Centre split'],
    chainLength: ['Standard', 'Custom length'],
    rollDirection: ['Standard', 'Reverse'],
    slatWidth: ['25 mm', '50 mm', '89 mm', '127 mm'],
    motorType: ['Somfy WireFree', 'Rechargeable tubular motor', 'Supplier compatible motor'],
    motorPower: ['Rechargeable battery', 'Battery', 'Mains'],
    motorControl: ['Remote', 'Wall switch', 'App', 'Smart-home control'],
    motorPosition: ['Left', 'Right'],
    extras: ['None', 'Cassette', 'Pelmet', 'Guide rails', 'Remote'],
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
  return [name, specs['room'], dimensions, specs['fabric'], specs['fittingPosition'], operation, specs['rollDirection'] ? `${specs['rollDirection']} roll` : '']
    .filter(Boolean)
    .join(' - ');
}
