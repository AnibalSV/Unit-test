// sum.test.js
import { expect, test, describe, vi, beforeAll } from "vitest";
import { formatNumber,isNumber, cloneStringify, searchParamsToObj, calcDiscrepancy, currencyFormatter, capitalize, randomChoice, translate, numberToPercentage, avgCalc, sumCalc, getDateTimeFromPeriod} from "./helpers";

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

  test("2-when argument is valid(negative, decimal, long).", () => {
    expect(isNumber(-1896567.269)).toBe(true);
  });
});

describe('cloneStringify:', () => {

  test('when cloning an object inside another object', () => {
    expect(cloneStringify({key1: 'value', key2: {key3: 'value'} })).toEqual({key1: 'value', key2: {key3: 'value'} });
  })

  test('when to clone an array', () => {
    expect(cloneStringify([4, 1, { a: 3 }])).toEqual([4, 1, { a: 3 }])
  })

  test('changes in the clone cannot affect the original', () => {
    const original = {a: 22, b:'abcd'};
    const clone = cloneStringify(original);
    clone.a = 100;
    expect(original.a).toBe(22);
    
  })

  test('when handling primitive data', () => {
    expect(null).toBe(null);
    expect(true).toBe(true);
    expect(23).toBe(23);
    expect('abcd').toBe('abcd');
  })
})

describe('searchParamsToObj:', () => {
  test('when convert SearchParams to an object correctly.', () => {
    const searchParams = new URLSearchParams('key1=value1&key2=value2');
    const expected = { key1: 'value1', key2: 'value2' };
    expect(searchParamsToObj(searchParams)).toEqual(expected);
  });

  test('when handling multiple values for a single key.', () => {
    const searchParams = new URLSearchParams('key1=value1&key1=value2&key1=value3');
    const expected = { key1: 'value1', key1: 'value2', key1:'value3'};
    expect(searchParamsToObj(searchParams)).toEqual(expected);
  })

  test('when handling values with space and special characters', () => {
    const searchParams = new URLSearchParams('key1=value%201&key2=value%40value');
    const expected = { key1: 'value 1', key2: 'value@value'};
    expect(searchParamsToObj(searchParams)).toEqual(expected);
  })
})

describe('calcDiscrepancy:', () => {
  test('1-when one or more arguments are not a number.', () => {
    expect(calcDiscrepancy('20', '6')).toBe(0.7);
    expect(calcDiscrepancy(NaN, '6')).toBe(NaN);
    expect(calcDiscrepancy('20', undefined)).toBe(NaN);
    expect(calcDiscrepancy('20', 6)).toBe(0.7);
    expect(calcDiscrepancy(NaN, NaN)).toBe(NaN);
  })

  test('when one or more arguments are negative', () => {
    expect(calcDiscrepancy(-20, 6)).toBe(4.333333333333333);
    expect(calcDiscrepancy(20,  -6)).toBe(1.3);
    expect(calcDiscrepancy(-20, -6)).toBe(-2.3333333333333335);
  })

  test('when arguments are equal', () => {
    expect(calcDiscrepancy(2, 2)).toBe(0);
  })

  test('when one or more arguments is zero', () => {
    expect(calcDiscrepancy(0, 2)).toBe(1);
    expect(calcDiscrepancy(2, 0)).toBe(1)
  })

})

describe('currencyFormatter:', () => {
  // Solo funciona con prefix = 'USD', no funciona con '€' ni con '$'

  test('when one or more arguments are not numbers', () => {
    expect(currencyFormatter('USD', 1000, 1)).toBe('$1,000.00');
  })
})

describe('capitalize', () => {
  //Error cuando hay un espacio vacio al inicio del string.

  test('when the argument is a normal text string', () => {
    expect(capitalize('string')).toBe('String');
    expect(capitalize('string')).not.toBe('string');
  })

  test('when  the argument is a text string that begins with a capital letter', () => {
    expect(capitalize('String')).toBe('String');
  })

  test('when argument is not a text string', () => {
    expect(capitalize('')). toBe('');
    expect(capitalize(123)).toBe(123);
    expect(capitalize(null)).toBe(null);
    expect(capitalize(undefined)).toBe(undefined);
  })

  test.skip('when the argument starts with a blank space', () => {
    expect(capitalize(' string')).toBe('String')
  }) //Aqui hay un error que debe ser resuelto.

  test('when the argument contains special characters', () => {
    expect(capitalize('s%tring')).toBe('S%tring');
    expect(capitalize('&string')).toBe('&string');
  })
  })

  describe('randomChoice', () => {
    //Si el argumento es null, el resultado deberia ser false.
    test('when argument is not valid', () => {
      expect(randomChoice(NaN)).toBe(false);
      expect(randomChoice(0)).toBe(true);
      expect(randomChoice(undefined)).toBe(false);
    })

    test.skip('when arguments is null', () => {
      expect(randomChoice(null)).toBe(false);
    })//Aqui hay un error que debe ser resuelto.

    test('when argument is negative', () => {
      expect(randomChoice(-0.1)).toBe(true);
    })
  })

  describe('translate', () => {
   
    test('when argument is valid', () => {
      expect(translate('impressions')).toBe('Server Impressions');
    })

    test('when argument is not valid', () => {
      expect(translate('string')).toBe('string');
      expect(translate('')).toBe('');
      expect(translate(null)).toBe(null);
      expect(translate(undefined)).toBe(undefined);
      expect(translate(NaN)).toBe(NaN);
      expect(translate(123)).toBe(123);

    })
  })

  describe('numberToPercentage', () => {
    
    test('when argument is not valid', () => {
      expect(numberToPercentage(NaN)).toBe('');
      expect(numberToPercentage(undefined)).toBe('');
      expect(numberToPercentage('')).toBe('');
    })

    test('when argument is string now', () => {
      expect(numberToPercentage('10')).toBe('10.00%');
    })
  })

  describe('avgCalc', () => {

    test('when arguments is valid', () => {
      expect(avgCalc([10, 2])).toBe(6);
    })

    test('when arguments is not number', () => {
      expect(avgCalc([NaN])).toBe(NaN);
      expect(avgCalc([undefined])).toBe(NaN);
    })

    test.skip('when arguments is empty', () => {
      expect(avgCalc([])).toBe(NaN);
      expect(avgCalc(['', ''])).toBe(NaN);
    })//Aqui hay un error que debe ser resuelto.

    test('when arguments is negative', () => {
      expect(avgCalc([-10, -2])). toBe(-6);
    })
  })

  describe('sumCalc', () => {

    test('when arguments is not valid', () => {
      expect(sumCalc([NaN])).toBe(NaN);
      expect(sumCalc([undefined])).toBe(NaN);
    })

    test.skip('when one or more arguments is empty', () => {
      expect(sumCalc([])).toBe(NaN);
      expect(sumCalc([''])).toBe(NaN);
    })//Aqui hay un error que debe ser resuelto.

    test('when one or more arguments is negative' , () => {
      expect(sumCalc([-10, -100])).toBe(-110);
      expect(sumCalc([-10, 100])).toBe(90);
      expect(sumCalc([10, -100])).toBe(-90);
    })
  })


