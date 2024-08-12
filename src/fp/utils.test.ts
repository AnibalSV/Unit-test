import { isEmptyObject } from 'utils/helpers';

test('isEmptyObject', () => {
  expect(isEmptyObject({})).toBe(true);
  expect(isEmptyObject({ a: 1 })).toBe(false);
});
