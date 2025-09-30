/**
 * Manual test for template matcher functionality
 * Run with: node -r esbuild-register test-template-matcher.ts
 */

import { matchTemplates, getBestTemplate, formatTemplateChoices } from './src/templateMatcher';

console.log('Testing Template Matcher...\n');

// Test 1: E-commerce matching
console.log('Test 1: E-commerce keywords');
const ecomResults = matchTemplates('I want to build an e-commerce store with payments');
console.log(`  Found ${ecomResults.length} matches`);
console.log(`  Best match: ${ecomResults[0]?.title || 'None'} (${ecomResults[0]?.id})`);
console.log(`  Score: ${ecomResults[0]?.score}\n`);

// Test 2: Blog matching
console.log('Test 2: Blog keywords');
const blogResults = matchTemplates('I need a blog for writing articles');
console.log(`  Found ${blogResults.length} matches`);
console.log(`  Best match: ${blogResults[0]?.title || 'None'} (${blogResults[0]?.id})`);
console.log(`  Score: ${blogResults[0]?.score}\n`);

// Test 3: Dashboard matching
console.log('Test 3: Dashboard keywords');
const dashboardResults = matchTemplates('admin dashboard with charts and analytics');
console.log(`  Found ${dashboardResults.length} matches`);
console.log(`  Best match: ${dashboardResults[0]?.title || 'None'} (${dashboardResults[0]?.id})`);
console.log(`  Score: ${dashboardResults[0]?.score}\n`);

// Test 4: Auth matching
console.log('Test 4: Authentication keywords');
const authResults = matchTemplates('app with user login and authentication');
console.log(`  Found ${authResults.length} matches`);
console.log(`  Best match: ${authResults[0]?.title || 'None'} (${authResults[0]?.id})`);
console.log(`  Score: ${authResults[0]?.score}\n`);

// Test 5: SaaS matching
console.log('Test 5: SaaS keywords');
const saasResults = matchTemplates('SaaS application with subscriptions');
console.log(`  Found ${saasResults.length} matches`);
console.log(`  Best match: ${saasResults[0]?.title || 'None'} (${saasResults[0]?.id})`);
console.log(`  Score: ${saasResults[0]?.score}\n`);

// Test 6: No matches
console.log('Test 6: No matches');
const noMatchResults = matchTemplates('quantum physics simulator');
console.log(`  Found ${noMatchResults.length} matches`);
const defaultTemplate = getBestTemplate('quantum physics simulator');
console.log(`  Default template: ${defaultTemplate.title} (${defaultTemplate.id})\n`);

// Test 7: Format choices
console.log('Test 7: Format template choices');
const formatted = formatTemplateChoices(ecomResults.slice(0, 3));
console.log(`  Formatted ${formatted.length} templates`);
formatted.forEach((item, index) => {
    console.log(`  ${index + 1}. ${item.label}`);
    console.log(`     ${item.description}`);
    if (item.detail) {
        console.log(`     ${item.detail}`);
    }
});

console.log('\n✅ All tests completed!');
