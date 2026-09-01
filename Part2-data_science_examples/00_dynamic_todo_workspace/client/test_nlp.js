// Automated Unit Tests for Natural Language Parser (nlpParser)

import assert from 'assert';
import { parseNaturalLanguage } from './src/utils/nlpParser.js';

console.log('🧪 Testing Natural Language Parser Engine...\n');

// Test 1: Full token extraction
const input1 = "Ship deployment to Kubernetes tomorrow @tomorrow !urgent #dev #ops ~45m";
const result1 = parseNaturalLanguage(input1);

assert.strictEqual(result1.title, "Ship deployment to Kubernetes tomorrow");
assert.strictEqual(result1.priority, "urgent");
assert.deepStrictEqual(result1.tags, ["dev", "ops"]);
assert(result1.dueDate !== null, "dueDate should be parsed for @tomorrow");
assert.strictEqual(result1.estimate, 45);
console.log('  ✅ PASS: Full token extraction with priority, multiple tags, date, and estimate');

// Test 2: Priority shorthands
const input2 = "Fix login crash !crit #security";
const result2 = parseNaturalLanguage(input2);
assert.strictEqual(result2.title, "Fix login crash");
assert.strictEqual(result2.priority, "urgent");
assert.deepStrictEqual(result2.tags, ["security"]);
console.log('  ✅ PASS: Priority shorthand (!crit) and tag extraction');

// Test 3: Hour estimate conversion
const input3 = "Design wireframes ~1.5h";
const result3 = parseNaturalLanguage(input3);
assert.strictEqual(result3.title, "Design wireframes");
assert.strictEqual(result3.estimate, 90);
console.log('  ✅ PASS: Hour estimate conversion (~1.5h -> 90min)');

// Test 4: Default fallback
const input4 = "Simple task without special tokens";
const result4 = parseNaturalLanguage(input4);
assert.strictEqual(result4.title, "Simple task without special tokens");
assert.strictEqual(result4.priority, "medium");
assert.deepStrictEqual(result4.tags, []);
assert.strictEqual(result4.dueDate, null);
assert.strictEqual(result4.estimate, 0);
console.log('  ✅ PASS: Plain text fallback defaults');

console.log('\n========================================');
console.log('📊 NLP Parser Tests: 4 Passed, 0 Failed');
console.log('========================================\n');
