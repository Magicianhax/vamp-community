import test from 'node:test';
import assert from 'node:assert';
import { slugify } from './slugify.ts';

test('slugify - basic strings', () => {
  assert.strictEqual(slugify('Hello World'), 'hello-world');
  assert.strictEqual(slugify('Next.js is awesome'), 'nextjs-is-awesome');
});

test('slugify - accents and diacritics', () => {
  assert.strictEqual(slugify('Héllò World'), 'hello-world');
  assert.strictEqual(slugify('München'), 'munchen');
  assert.strictEqual(slugify('crème brûlée'), 'creme-brulee');
});

test('slugify - emojis and symbols', () => {
  assert.strictEqual(slugify('🚀 Space'), 'space');
  assert.strictEqual(slugify('Hello 🌍 World'), 'hello-world');
  assert.strictEqual(slugify('Vamp! 🧛'), 'vamp');
});

test('slugify - multiple spaces and hyphens', () => {
  assert.strictEqual(slugify('Multiple   Spaces'), 'multiple-spaces');
  assert.strictEqual(slugify('Multiple---Hyphens'), 'multiple-hyphens');
  assert.strictEqual(slugify('   Trim spaces   '), 'trim-spaces');
});

test('slugify - leading and trailing special characters', () => {
  assert.strictEqual(slugify('!Check this out?'), 'check-this-out');
  assert.strictEqual(slugify('---Already dashed---'), 'already-dashed');
  assert.strictEqual(slugify('...Dots...'), 'dots');
});

test('slugify - underscores', () => {
  // Current implementation keeps underscores as \w includes them
  assert.strictEqual(slugify('Mixed_Case_Underscores'), 'mixed_case_underscores');
});

test('slugify - mixed cases', () => {
  assert.strictEqual(slugify('UPPERCASE lowercase'), 'uppercase-lowercase');
});
