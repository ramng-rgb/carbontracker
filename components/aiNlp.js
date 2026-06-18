import { DAILY_HABITS } from '../data.js';

/**
 * Parses a natural language sentence to detect carbon tracker habits.
 * Returns an object with { success: boolean, matches: Array, feedback: string }
 */
export function parseNaturalLanguageActivity(text) {
  const sentence = text.toLowerCase().trim();
  if (!sentence) {
    return { success: false, feedback: "Please enter an action description." };
  }

  const matches = [];
  let feedbackParts = [];

  // Helper: extract the first number in the text, default to a standard factor if not specified
  const numberRegex = /(\d+(?:\.\d+)?)/;
  const numMatch = sentence.match(numberRegex);
  const parsedNumber = numMatch ? parseFloat(numMatch[1]) : null;

  // Let's check for specific keywords associated with our daily habits list
  
  // 1. Commute by bike / walking
  if (sentence.includes('bike') || sentence.includes('cycle') || sentence.includes('walk') || sentence.includes('foot') || sentence.includes('ran')) {
    const habit = DAILY_HABITS.find(h => h.id === 'commute_bike');
    // If distance is specified, let's calculate custom offset. Standard is 4.8kg offset (based on ~12 miles avoided)
    let finalOffset = habit.offset;
    let distanceDesc = "";
    if (parsedNumber) {
      const isKm = sentence.includes('km') || sentence.includes('kilometer');
      const miles = isKm ? parsedNumber * 0.621371 : parsedNumber;
      // Saving ~0.35kg CO2 per mile relative to average driving
      finalOffset = parseFloat((miles * 0.35).toFixed(1));
      distanceDesc = ` for ${parsedNumber} ${isKm ? 'km' : 'miles'}`;
    }
    matches.push({
      id: habit.id,
      name: `${habit.name}${distanceDesc}`,
      category: habit.category,
      offset: finalOffset,
      icon: habit.icon
    });
    feedbackParts.push(`🚲 Commuted sustainably${distanceDesc} (Saved ${finalOffset} kg CO2)`);
  }

  // 2. Public Transit
  else if (sentence.includes('bus') || sentence.includes('train') || sentence.includes('subway') || sentence.includes('transit') || sentence.includes('metro')) {
    const habit = DAILY_HABITS.find(h => h.id === 'public_transit');
    let finalOffset = habit.offset;
    let distanceDesc = "";
    if (parsedNumber) {
      const isKm = sentence.includes('km') || sentence.includes('kilometer');
      const miles = isKm ? parsedNumber * 0.621371 : parsedNumber;
      // Saving ~0.22kg CO2 per mile by swapping car for train/bus
      finalOffset = parseFloat((miles * 0.22).toFixed(1));
      distanceDesc = ` for ${parsedNumber} ${isKm ? 'km' : 'miles'}`;
    }
    matches.push({
      id: habit.id,
      name: `${habit.name}${distanceDesc}`,
      category: habit.category,
      offset: finalOffset,
      icon: habit.icon
    });
    feedbackParts.push(`🚍 Swapped to public transit${distanceDesc} (Saved ${finalOffset} kg CO2)`);
  }

  // 3. Diet: Vegan / Vegetarian / Plant-based
  if (sentence.includes('vegan') || sentence.includes('salad') || sentence.includes('plant-based') || sentence.includes('vegetarian') || sentence.includes('veggie') || sentence.includes('meatless') || sentence.includes('tofu')) {
    const habit = DAILY_HABITS.find(h => h.id === 'vegan_meal');
    // If user mentions multiple meals
    let count = 1;
    if (sentence.includes('two') || sentence.includes(' 2 ') || sentence.includes('meals')) {
      count = parsedNumber && parsedNumber <= 3 ? parsedNumber : 2;
    }
    const finalOffset = parseFloat((habit.offset * count).toFixed(1));
    matches.push({
      id: habit.id,
      name: count > 1 ? `${habit.name} (${count} meals)` : habit.name,
      category: habit.category,
      offset: finalOffset,
      icon: habit.icon
    });
    feedbackParts.push(`🥗 Ate plant-based (${count} meal${count > 1 ? 's' : ''}) (Saved ${finalOffset} kg CO2)`);
  }

  // 4. Short Shower
  if (sentence.includes('shower') || sentence.includes('bath')) {
    const habit = DAILY_HABITS.find(h => h.id === 'short_shower');
    let finalOffset = habit.offset;
    let timeDesc = "";
    if (parsedNumber && parsedNumber < 15) {
      // Shorter is better. Assuming average shower is 10 mins.
      // Offset = (10 - parsedNumber) * 0.18 kg CO2
      const savings = (10 - parsedNumber) * 0.18;
      finalOffset = savings > 0 ? parseFloat(savings.toFixed(1)) : 0.2;
      timeDesc = ` (${parsedNumber} mins)`;
    }
    matches.push({
      id: habit.id,
      name: `${habit.name}${timeDesc}`,
      category: habit.category,
      offset: finalOffset,
      icon: habit.icon
    });
    feedbackParts.push(`🚿 Took a shorter shower${timeDesc} (Saved ${finalOffset} kg CO2)`);
  }

  // 5. Cold Wash
  if (sentence.includes('wash') || sentence.includes('laundry') || sentence.includes('clothes') || sentence.includes('washing')) {
    if (sentence.includes('cold') || sentence.includes('tap') || !sentence.includes('hot')) {
      const habit = DAILY_HABITS.find(h => h.id === 'cold_wash');
      let finalOffset = habit.offset;
      let loadDesc = "";
      if (parsedNumber && parsedNumber > 1 && parsedNumber < 5) {
        finalOffset = parseFloat((habit.offset * parsedNumber).toFixed(1));
        loadDesc = ` (${parsedNumber} loads)`;
      }
      matches.push({
        id: habit.id,
        name: `${habit.name}${loadDesc}`,
        category: habit.category,
        offset: finalOffset,
        icon: habit.icon
      });
      feedbackParts.push(`🧼 Cold water laundry wash${loadDesc} (Saved ${finalOffset} kg CO2)`);
    }
  }

  // 6. Recycle
  if (sentence.includes('recycle') || sentence.includes('recycled') || sentence.includes('sorting') || sentence.includes('cardboard') || sentence.includes('can') || sentence.includes('cans')) {
    const habit = DAILY_HABITS.find(h => h.id === 'recycled');
    matches.push({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      offset: habit.offset,
      icon: habit.icon
    });
    feedbackParts.push(`♻️ Sorted and recycled waste (Saved ${habit.offset} kg CO2)`);
  }

  // 7. No Plastic
  if (sentence.includes('plastic') || sentence.includes('reusable') || sentence.includes('canvas bag') || sentence.includes('no straw')) {
    const habit = DAILY_HABITS.find(h => h.id === 'no_plastic');
    matches.push({
      id: habit.id,
      name: habit.name,
      category: habit.category,
      offset: habit.offset,
      icon: habit.icon
    });
    feedbackParts.push(`🥤 Avoided single-use plastics (Saved ${habit.offset} kg CO2)`);
  }

  if (matches.length > 0) {
    return {
      success: true,
      matches,
      feedback: `AI successfully analyzed: \n• ${feedbackParts.join('\n• ')}\nAdded to your activity logs!`
    };
  } else {
    return {
      success: false,
      feedback: "AI could not recognize any eco-actions in your text. Try something like: 'I rode my bike 8 miles' or 'I had a salad for lunch and washed laundry in cold water'."
    };
  }
}
