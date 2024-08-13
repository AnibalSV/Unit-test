// sum.test.js
import { expect, test, describe } from 'vitest'
import { formatNumber } from './helpers.ts'


describe('formatNumber', () => {
  test('when argument is not a number', () => {
    expect(formatNumber(NaN)).toBe(NaN);
    
    // @ts-expect-error: Testing
    expect(formatNumber(null)).toBe(NaN);
    
    // @ts-expect-error: Testing
    expect(formatNumber(undefined)).toBe(NaN);
    
    // @ts-expect-error: Testing
    expect(formatNumber('wresafsf')).toBe(NaN);
  });

  test('when argument is valid', () => {
    const result = formatNumber('4.323');

    expect(result).toBe(4.32);
  })
});

describe('isNumber', () => {
  test('when argument is not a number', () => {
    
  });
})