import { CHATBOT_KNOWLEDGE } from '../data.js';

/**
 * Evaluates the user's chat message and returns a context-aware bot reply.
 * Takes the user's live profile/footprint state into account.
 */
export function getAICoachResponse(userMessageText, userState) {
  const query = userMessageText.toLowerCase().trim();
  
  // 1. Calculate active total footprint for dynamic context
  const annualCO2 = parseFloat((userState.calculatorData?.annualFootprint || 0).toFixed(1));
  const categoryBreakdown = userState.calculatorData?.breakdown || { transport: 0, energy: 0, diet: 0, consumption: 0 };
  
  // Find highest category
  let maxCat = 'transport';
  let maxVal = 0;
  for (const [cat, val] of Object.entries(categoryBreakdown)) {
    if (val > maxVal) {
      maxVal = val;
      maxCat = cat;
    }
  }

  // Define conversational responses based on keywords
  
  // Greetings
  if (query.match(/\b(hi|hello|hey|greetings|hola|good morning|good afternoon)\b/)) {
    return getRandomElement(CHATBOT_KNOWLEDGE.greetings);
  }
  
  // Status check: "what is my score", "my carbon footprint", "how am i doing"
  if (query.includes('my footprint') || query.includes('my score') || query.includes('how am i doing') || query.includes('status') || query.includes('progress') || query.includes('my carbon')) {
    if (annualCO2 === 0) {
      return "It looks like you haven't completed the Carbon Calculator yet! Click the 'Footprint Calculator' tab to calculate your initial score so I can give you personalized suggestions.";
    }
    
    let comparisonStr = "";
    if (annualCO2 <= 2.0) {
      comparisonStr = "Excellent! You are meeting the Paris Agreement target of 2.0 Tonnes per year. Keep up the amazing work!";
    } else if (annualCO2 <= 6.0) {
      comparisonStr = "You are doing better than the US national average (~16 Tonnes), but still above the sustainable target of 2.0 Tonnes. We can reduce this!";
    } else {
      comparisonStr = "Your emissions are higher than average. Your largest carbon contributor is your **" + maxCat.toUpperCase() + "** usage. Let's start by addressing that category first.";
    }

    return `Your estimated annual carbon footprint is **${annualCO2} Metric Tonnes CO2**.
    
    ${comparisonStr}
    
    You have unlocked **${(userState.unlockedBadges || []).length} Badges** and completed **${(userState.loggedActivities || []).length} eco-actions** today!`;
  }

  // Transportation specific advice
  if (query.includes('transport') || query.includes('car') || query.includes('drive') || query.includes('flight') || query.includes('fly') || query.includes('mile') || query.includes('commute')) {
    let specificContext = "";
    if (categoryBreakdown.transport > 2.0) {
      specificContext = `Currently, your transport footprint is quite high at **${parseFloat(categoryBreakdown.transport.toFixed(1))} Tonnes/year**. `;
    }
    return specificContext + CHATBOT_KNOWLEDGE.topics.transport;
  }

  // Diet specific advice
  if (query.includes('diet') || query.includes('food') || query.includes('beef') || query.includes('meat') || query.includes('vegan') || query.includes('eat') || query.includes('veget') || query.includes('salad')) {
    let specificContext = "";
    if (categoryBreakdown.diet > 1.5) {
      specificContext = `I see that diet makes up **${parseFloat(categoryBreakdown.diet.toFixed(1))} Tonnes/year** of your footprint. Shifting beef meals to chicken or legumes has a huge immediate impact! `;
    }
    return specificContext + CHATBOT_KNOWLEDGE.topics.diet;
  }

  // Home energy specific advice
  if (query.includes('energy') || query.includes('electricity') || query.includes('gas') || query.includes('heat') || query.includes('power') || query.includes('thermostat') || query.includes('led') || query.includes('bulb')) {
    let specificContext = "";
    if (categoryBreakdown.energy > 1.5) {
      specificContext = `Your home utility usage accounts for **${parseFloat(categoryBreakdown.energy.toFixed(1))} Tonnes/year**. `;
    }
    return specificContext + CHATBOT_KNOWLEDGE.topics.energy;
  }

  // Offsetting advice
  if (query.includes('offset') || query.includes('buy') || query.includes('marketplace') || query.includes('donate') || query.includes('credit') || query.includes('project')) {
    return CHATBOT_KNOWLEDGE.topics.offset + "\n\nTry visiting our **Offset Marketplace** tab where you can support projects like Amazon conservation to offset your emissions.";
  }

  // Help / Help commands
  if (query.includes('help') || query.includes('what can i say') || query.includes('commands') || query.includes('what can you do')) {
    return `I can guide you on your environmental journey. Try asking me:
    • *"What is my carbon footprint?"* to see your current stats.
    • *"How can I reduce my transportation emissions?"*
    • *"Give me tips on home energy efficiency."*
    • *"What is the footprint of a vegan diet?"*
    • *"Explain carbon offsetting."*`;
  }

  // Check custom advice commands
  if (query.includes('tip') || query.includes('advice') || query.includes('guide') || query.includes('suggest')) {
    return getRandomElement(CHATBOT_KNOWLEDGE.generalTips);
  }

  // Fallback response
  return CHATBOT_KNOWLEDGE.fallback;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
