import { parseNaturalLanguageActivity } from './aiNlp.js';

describe('AI Natural Language Parser', () => {
  test('should fail gracefully for empty sentence input', () => {
    const result = parseNaturalLanguageActivity('');
    expect(result.success).toBe(false);
    expect(result.feedback).toContain('Please enter an action description.');
  });

  test('should fail gracefully for non-matching input', () => {
    const result = parseNaturalLanguageActivity('Hello, I am eating a burger');
    expect(result.success).toBe(false);
    expect(result.feedback).toContain('AI could not recognize any eco-actions');
  });

  test('should parse bike commuting sentence and calculate custom offset', () => {
    const result = parseNaturalLanguageActivity('I rode my bike 10 miles today');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].id).toBe('commute_bike');
    expect(result.matches[0].offset).toBe(3.5); // 10 * 0.35
  });

  test('should parse public transit sentence with km conversion', () => {
    const result = parseNaturalLanguageActivity('took the bus for 15 km');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].id).toBe('public_transit');
    // 15 km * 0.621371 = 9.32 miles. 9.32 * 0.22 = 2.05 -> rounded to 2.1
    expect(result.matches[0].offset).toBe(2.1);
  });

  test('should parse diet vegan/vegetarian meals and handle count', () => {
    const result1 = parseNaturalLanguageActivity('I ate a vegan salad for lunch');
    expect(result1.success).toBe(true);
    expect(result1.matches.length).toBe(1);
    expect(result1.matches[0].id).toBe('vegan_meal');
    expect(result1.matches[0].offset).toBe(2.1);

    const result2 = parseNaturalLanguageActivity('had 2 vegetarian meals');
    expect(result2.success).toBe(true);
    expect(result2.matches[0].id).toBe('vegan_meal');
    expect(result2.matches[0].offset).toBe(4.2); // 2.1 * 2
  });

  test('should parse short shower duration', () => {
    const result = parseNaturalLanguageActivity('took a 6 min shower');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].id).toBe('short_shower');
    // (10 - 6) * 0.18 = 0.72 -> rounded to 0.7
    expect(result.matches[0].offset).toBe(0.7);
  });

  test('should parse cold wash laundry loading options', () => {
    const result = parseNaturalLanguageActivity('washed laundry in cold water for 3 loads');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(1);
    expect(result.matches[0].id).toBe('cold_wash');
    expect(result.matches[0].offset).toBe(2.1); // 0.7 * 3
  });

  test('should parse recycling and no plastic actions', () => {
    const result1 = parseNaturalLanguageActivity('sorted cardboard and cans for recycling');
    expect(result1.success).toBe(true);
    expect(result1.matches[0].id).toBe('recycled');

    const result2 = parseNaturalLanguageActivity('used canvas bag and avoided plastic straw');
    expect(result2.success).toBe(true);
    expect(result2.matches[0].id).toBe('no_plastic');
  });

  test('should parse multiple matched actions in a single sentence', () => {
    const result = parseNaturalLanguageActivity('rode my bike 5 miles and ate a vegan meal');
    expect(result.success).toBe(true);
    expect(result.matches.length).toBe(2);
    expect(result.matches.map(m => m.id)).toContain('commute_bike');
    expect(result.matches.map(m => m.id)).toContain('vegan_meal');
  });
});
