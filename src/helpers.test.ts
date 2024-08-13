// sum.test.js
import { expect, test, describe, vi, beforeAll } from "vitest";
import { formatNumber,isNumber, cloneStringify, searchParamsToObj, calcDiscrepancy, currencyFormatter} from "./helpers";

describe("formatNumber:", () => {
  // Mocks para navigator.languages
  beforeAll(() => {
    vi.stubGlobal("navigator", { languages: ["en-US"] }); // Mockea navigator.languages
  });

  test('1-when argument is not number.', () => {
    expect(formatNumber(NaN)).toBe(NaN);
    expect(formatNumber(undefined)).toBe(undefined);
  })

  test('2-when argument is valid.', () => {
    expect(formatNumber('-1896567.269')).toBe('-1,896,567.27');
  })
});

describe("isNumber:", () => {
  // Mocks para navigator.languages
  beforeAll(() => {
    vi.stubGlobal("navigator", { languages: ["en-US"] }); // Mockea navigator.languages
  });

  test("1-when argument is not number.", () => {
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber(undefined)).toBe(false);
    expect(isNumber("Hola")).toBe(false);
  });

  test("2-when argument is valid.", () => {
    expect(isNumber(-1896567.269)).toBe(true);
  });
});

describe('cloneStringify:', () => {

  test('1-when argument is valid.', () => {
    expect(cloneStringify({nombre: 'Albert', edad: 36})).toEqual({nombre: 'Albert', edad: 36});
  })
})

/*describe('searchParamsToObj:', () => {
  test('1-When argument is valid.', () => {
    expect(searchParamsToObj()).toBe()
  })
})*/

describe('calcDiscrepancy:', () => {
  test('1-when argument is not number.', () => {
    expect(calcDiscrepancy('20', '6')).toBe(0.7);
    expect(calcDiscrepancy(NaN, '6')).toBe(NaN);
    expect(calcDiscrepancy('20', undefined)).toBe(NaN);
    expect(calcDiscrepancy('20', 6)).toBe(0.7);
  })

  test('2-when argument is valid.', () => {
    expect(calcDiscrepancy(20,6)).toBe(0.7);
  })
})

/*describe('currencyFormatter:', () => {
  test('', () => {
    expect(currencyFormatter()).toBe();
  })
})*/
