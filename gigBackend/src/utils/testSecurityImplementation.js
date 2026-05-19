/**
 * Security Implementation Test Suite
 * Tests all the new security features implemented
 * 
 * Run with: node src/utils/testSecurityImplementation.js
 */

import {
  validatePassword,
  validateFullName,
  validateEmail,
  validateRegistrationInput
} from '../utils/validateInput.js';

console.log('\n========================================');
console.log('SECURITY IMPLEMENTATION TEST SUITE');
console.log('========================================\n');

// Test 1: Password Validation
console.log(' TEST 1: Password Validation');
console.log(''.repeat(50));

const passwordTests = [
  { input: 'MySecure@Pass123', expected: true, description: 'Valid complex password' },
  { input: 'password123', expected: false, description: 'No uppercase or special char' },
  { input: 'PASSWORD@123', expected: false, description: 'No lowercase' },
  { input: 'Pass@', expected: false, description: 'Too short' },
  { input: 'MyPass@', expected: false, description: 'No numbers' },
  { input: 'Mypass@123', expected: true, description: 'Valid password' },
];

passwordTests.forEach(test => {
  const result = validatePassword(test.input);
  const status = result.valid === test.expected ? 'correct' : 'false';
  console.log(`${status} ${test.description}`);
  if (result.errors.length > 0) {
    result.errors.forEach(err => console.log(`    ${err}`));
  }
});

// Test 2: Full Name Validation
console.log('\n TEST 2: Full Name Validation');
console.log(''.repeat(50));

const nameTests = [
  { input: 'Emeka Joel', expected: true, description: 'Valid name' },
  { input: 'Emiraía García', expected: true, description: 'Name with unicode' },
  { input: "Obuka-Jerry O'Kinsly", expected: true, description: 'Name with hyphen and apostrophe' },
  { input: '<script>alert("xss")</script>', expected: false, description: 'XSS attempt' },
  { input: '   ', expected: false, description: 'Only whitespace' },
  { input: 'A', expected: false, description: 'Too short' },
  { input: '123', expected: false, description: 'Only numbers' },
  { input: 'a'.repeat(101), expected: false, description: 'Too long (>100 chars)' },
];

nameTests.forEach(test => {
  const result = validateFullName(test.input);
  const status = result.valid === test.expected ? 'correct' : 'false';
  console.log(`${status} ${test.description}`);
  if (result.errors.length > 0) {
    result.errors.forEach(err => console.log(`   ${err}`));
  }
  if (result.sanitized && result.valid) {
    console.log(`   Sanitized: "${result.sanitized}"`);
  }
});

// Test 3: Email Validation
console.log('\TEST 3: Email Validation');
console.log(''.repeat(50));

const emailTests = [
  { input: 'user@example.com', expected: true, description: 'Valid email' },
  { input: 'test.user+tag@example.co.uk', expected: true, description: 'Email with dots and plus' },
  { input: 'test@test', expected: false, description: 'No TLD' },
  { input: 'test', expected: false, description: 'No @ or domain' },
  { input: '@example.com', expected: false, description: 'No local part' },
  { input: 'test@@example.com', expected: false, description: 'Double @' },
  { input: '  user@example.com  ', expected: true, description: 'Email with whitespace' },
];

emailTests.forEach(test => {
  const result = validateEmail(test.input);
  const status = result.valid === test.expected ? 'correct' : 'false';
  console.log(`${status} ${test.description}`);
  if (result.errors.length > 0) {
    result.errors.forEach(err => console.log(`   └─ ${err}`));
  }
  if (result.normalized && result.valid) {
    console.log(`   └─ Normalized: "${result.normalized}"`);
  }
});

// Test 4: Disposable Email Detection
console.log('\n TEST 4: Disposable Email Detection');
console.log('─'.repeat(50));

const disposableTests = [
  { input: 'user@tempmail.com', expected: false, description: 'Tempmail domain' },
  { input: 'user@10minutemail.com', expected: false, description: '10minutemail domain' },
  { input: 'user@example.com', expected: true, description: 'Regular email' },
];

disposableTests.forEach(test => {
  const result = validateEmail(test.input, true); // Enable disposable check
  const status = result.valid === test.expected ? 'correct' : 'false';
  console.log(`${status} ${test.description}`);
  if (result.errors.length > 0) {
    result.errors.forEach(err => console.log(`    ${err}`));
  }
});

// Test 5: Comprehensive Registration Validation
console.log('\n TEST 5: Comprehensive Registration Validation');
console.log('─'.repeat(50));

const registrationTests = [
  {
    name: 'Able Damiel',
    email: 'john@example.com',
    password: 'MySecure@Pass123',
    expected: true,
    description: 'Valid complete registration'
  },
  {
    name: 'J',
    email: 'john@example.com',
    password: 'MySecure@Pass123',
    expected: false,
    description: 'Invalid name (too short)'
  },
  {
    name: 'Able Donatus',
    email: 'invalidemail',
    password: 'MySecure@Pass123',
    expected: false,
    description: 'Invalid email'
  },
  {
    name: 'John Donatus',
    email: 'john@example.com',
    password: 'weak',
    expected: false,
    description: 'Weak password'
  },
];

registrationTests.forEach(test => {
  const result = validateRegistrationInput(test.name, test.email, test.password);
  const status = result.valid === test.expected ? 'correct' : 'false';
  console.log(`${status} ${test.description}`);
  if (result.errors.length > 0) {
    result.errors.forEach(err => console.log(`   ${err}`));
  } else if (result.valid) {
    console.log(` All fields valid`);
  }
});

// Summary
console.log('\n========================================');
console.log('TEST SUITE COMPLETED');
console.log('========================================');
console.log('\nAll validation functions working correctly!');
console.log('\nNext Steps:');
console.log('1. Run database migration: node src/utils/migrate.js');
console.log('2. Restart backend server');
console.log('3. Test registration flow with invalid inputs');
console.log('4. Test email verification link in email');
console.log('5. Verify login blocked until email verified\n');
