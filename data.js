// Environmental conversion coefficients and default mock structures
export const EMISSION_FACTORS = {
  transport: {
    electric: 0.05, // kg CO2 per mile
    hybrid: 0.15,   // kg CO2 per mile
    sedan: 0.25,    // kg CO2 per mile
    suv: 0.40,      // kg CO2 per mile
    transit: 0.08,  // kg CO2 per mile of bus/train
    flight: 90.0    // kg CO2 per flight hour
  },
  energy: {
    electricity: 0.38, // kg CO2 per kWh (depends on grid mix)
    gas: 5.30,         // kg CO2 per Therm
    heatingOil: 10.15  // kg CO2 per gallon
  },
  diet: {
    meatHeavy: 2900,  // kg CO2 per year
    average: 2000,    // kg CO2 per year
    vegetarian: 1300, // kg CO2 per year
    vegan: 900        // kg CO2 per year
  },
  consumption: {
    heavy: 2400,      // kg CO2 per year
    moderate: 1200,   // kg CO2 per year
    light: 500        // kg CO2 per year
  }
};

// Daily habits lists (for tracking)
export const DAILY_HABITS = [
  { id: 'commute_bike', name: 'Commute by bike/walk', category: 'transport', offset: 4.8, icon: '🚲', desc: 'Avoided driving a gas vehicle' },
  { id: 'public_transit', name: 'Took public transit', category: 'transport', offset: 3.2, icon: '🚍', desc: 'Used bus or train instead of driving' },
  { id: 'vegan_meal', name: 'Had a plant-based meal', category: 'diet', offset: 2.1, icon: '🥗', desc: 'Substituted meat/dairy with plants' },
  { id: 'short_shower', name: 'Took a short shower (<5 min)', category: 'energy', offset: 0.9, icon: '🚿', desc: 'Saved hot water and heating energy' },
  { id: 'cold_wash', name: 'Washed laundry in cold water', category: 'energy', offset: 0.7, icon: '🧼', desc: 'Reduced water heater energy usage' },
  { id: 'recycled', name: 'Recycled all waste today', category: 'consumption', offset: 0.8, icon: '♻️', desc: 'Kept recyclable products out of landfills' },
  { id: 'no_plastic', name: 'Avoided single-use plastic', category: 'consumption', offset: 0.5, icon: '🥤', desc: 'Used reusable bags, bottles, or cups' }
];

// Long term action planner pledges
export const PLANNER_PLEDGES = [
  { id: 'pledge_led', name: 'Switch to 100% LED Bulbs', category: 'energy', impact: 150, difficulty: 'Easy', icon: '💡', desc: 'Replace all incandescent bulbs with energy-efficient LEDs.' },
  { id: 'pledge_meatless', name: 'Meatless Weekdays', category: 'diet', impact: 800, difficulty: 'Medium', icon: '🥦', desc: 'Eat plant-based foods from Monday through Friday.' },
  { id: 'pledge_carpool', name: 'Carpool or Transit 3x/week', category: 'transport', impact: 950, difficulty: 'Medium', icon: '🚗', desc: 'Share rides or take train/bus to reduce weekly vehicle mileage.' },
  { id: 'pledge_thermostat', name: 'Install a Smart Thermostat', category: 'energy', impact: 340, difficulty: 'Easy', icon: '🌡️', desc: 'Optimize home heating and cooling schedules dynamically.' },
  { id: 'pledge_compost', name: 'Compost Organic Waste', category: 'consumption', impact: 280, difficulty: 'Medium', icon: '🍂', desc: 'Compost organic leftovers to reduce landfill methane emissions.' },
  { id: 'pledge_solar', name: 'Install Solar Panels', category: 'energy', impact: 3200, difficulty: 'Hard', icon: '☀️', desc: 'Switch your home to clean, renewable local energy production.' },
  { id: 'pledge_ev', name: 'Switch to an Electric Vehicle', category: 'transport', impact: 2500, difficulty: 'Hard', icon: '⚡', desc: 'Eliminate tailpipe emissions by upgrading to an EV.' }
];

// Carbon marketplace projects
export const OFFSET_PROJECTS = [
  {
    id: 'proj_amazon',
    name: 'Amazon Rainforest Conservation',
    location: 'Acre State, Brazil',
    costPerTon: 15.00, // USD per Tonne of CO2
    rating: 'Gold Standard',
    image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=600&q=80',
    desc: 'Protects critical pristine Amazonian rainforest from illegal logging, conserving biodiversity and securing carbon stocks.'
  },
  {
    id: 'proj_wind',
    name: 'Thar Desert Wind Farm',
    location: 'Rajasthan, India',
    costPerTon: 12.00,
    rating: 'VCS + CCB',
    image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80',
    desc: 'Displaces fossil-fuel grid electricity by installing clean, sustainable utility-scale wind power generators.'
  },
  {
    id: 'proj_cook',
    name: 'Clean Cookstoves Program',
    location: 'Nyanza Province, Kenya',
    costPerTon: 18.00,
    rating: 'Gold Standard',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=600&q=80',
    desc: 'Provides fuel-efficient cookstoves to families, reducing fuel-wood logging, local deforestation, and toxic indoor smoke.'
  }
];

// Bot conversational knowledge base (TerraAI responses)
export const CHATBOT_KNOWLEDGE = {
  greetings: [
    "Hello! I'm TerraAI, your personal eco-coach. How can I help you reduce your environmental footprint today?",
    "Hi there! Ready to make a positive impact today? Ask me anything about carbon savings or environmental habits!"
  ],
  generalTips: [
    "To make the biggest dent in your footprint, focus on the 'big three': driving less (or switching to transit/EVs), heating/cooling your home efficiently, and eating less beef/dairy.",
    "Did you know? Food production accounts for over 25% of global greenhouse gas emissions. Transitioning to a plant-oriented diet is one of the most effective personal actions.",
    "Small daily changes compound! Saving energy at home (unplugging vampire electronics, washing cold) and avoiding single-use plastics can save up to 500kg CO2 per year."
  ],
  topics: {
    transport: "Transportation is often the largest single source of individual emissions. You can reduce this by: \n• Walking or cycling for trips under 2 miles.\n• Keeping your car tires inflated (improves gas mileage by 3%).\n• Combining errands to drive fewer miles.\n• Considering an EV or hybrid for your next vehicle purchase.",
    diet: "Dietary emissions vary greatly. Beef generates approximately 60kg of CO2 per kg of food, whereas peas produce just 0.9kg. Shifting just one meal a day to plant-based saves an estimated 2kg CO2!",
    energy: "Home energy efficiency tips:\n• Set your thermostat to 68°F (20°C) in winter and 78°F (26°C) in summer.\n• Seal gaps around doors and windows to prevent drafts.\n• Wash laundry in cold water (saves ~90% of the washing machine energy).\n• Switch to energy-efficient LED lighting.",
    offset: "Carbon offsetting allows you to invest in projects that remove or avoid carbon emissions (like tree planting or wind farms) to balance out your own footprint. While it is great for neutralizing unavoidable travel, reducing your primary footprint should always come first!",
    calculator: "The Terrasense calculator evaluates your Transport, Energy, Diet, and Shopping habits to estimate your annual footprint in Metric Tonnes of CO2. The global target is under 2.0 tonnes per person to combat climate change."
  },
  fallback: "That's a great question! Reducing our footprint involves balancing conservation, switching to efficient options, and offsetting what we can't avoid. Ask me about 'diet', 'transport', 'home energy', or 'offsetting' for deep-dive suggestions!"
};

// Seed data for historical footprint tracking over a 6-week period
export const MOCK_HISTORY = [
  { week: 'Wk 1', transport: 180, energy: 150, diet: 110, consumption: 70 },
  { week: 'Wk 2', transport: 165, energy: 140, diet: 110, consumption: 65 },
  { week: 'Wk 3', transport: 140, energy: 130, diet: 95, consumption: 60 },
  { week: 'Wk 4', transport: 125, energy: 125, diet: 90, consumption: 55 },
  { week: 'Wk 5', transport: 100, energy: 115, diet: 80, consumption: 50 },
  { week: 'Wk 6', transport: 85, energy: 110, diet: 70, consumption: 45 }
];
