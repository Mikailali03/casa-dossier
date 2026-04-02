export const SYSTEM_LONGEVITY = {
  // Category Defaults
  'HVAC': 15,
  'PLUMBING': 20,
  'APPLIANCES': 12,
  'ELECTRICAL': 30,
  'SMART HOME': 5,
  'STRUCTURE': 100,
  'OTHER': 10,

  // Specific Sub-category overrides
  'AC Unit': 12,
  'Furnace': 18,
  'Thermostat': 10,
  'Water Heater': 10,
  'EV Charger': 10,
  'Solar Panel': 25,
  'Refrigerator': 14,
  'Dishwasher': 9,
  'Washing Machine': 10,
  'Clothes Dryer': 12,
  'Door Lock': 5,
  'Camera': 4
};

export const calculateLifecycle = (manufactureDate, category, subCategory) => {
  if (!manufactureDate) return { age: 0, percentUsed: 0, yearsRemaining: 15, status: 'healthy' };
  
  const manufacturedYear = new Date(manufactureDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - manufacturedYear);
  
  // Logic: Check sub-category specific first, then fallback to category, then default to 15
  const expectedLife = SYSTEM_LONGEVITY[subCategory] || SYSTEM_LONGEVITY[category] || 15;
  
  const percentUsed = Math.min(100, Math.round((age / expectedLife) * 100));
  const yearsRemaining = Math.max(0, expectedLife - age);
  const status = yearsRemaining <= 2 ? 'critical' : yearsRemaining <= 5 ? 'warning' : 'healthy';

  return { age, expectedLife, percentUsed, yearsRemaining, status };
};