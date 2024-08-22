import { buildUrl, handleError, handleJson, replaceUrlParams } from './utils';
import { test, expect } from 'vitest';
import jest from 'jest-mock';


test('handleError throws an Error', async () => {
  const res = {
    ok: false
  };

  await expect(handleError(res as unknown as Response)).rejects.toThrow('Response not ok');
});

test('handleError', () => {
  const res = {
    ok: true
  };

  expect(() => handleError(res as unknown as Response)).not.toThrow();
});

test('handleJson', async () => {
  const res = {
    json: jest.fn().mockResolvedValue({})
  } as unknown as Response;

  const response = await handleJson(res);

  expect(response).toEqual({});
});

test('handleJson with error', async () => {
  const res = {
    json: jest.fn().mockRejectedValue(new Error('error'))
  } as unknown as Response;

  const response = await handleJson(res);

  expect(response).toEqual({});
});

test('handleJson', async () => {
  const res = {
    json: jest.fn().mockResolvedValue({})
  } as unknown as Response;

  const response = await handleJson(res);

  expect(response).toEqual({});
});

test('replaceUrlParams', () => {
  const url = '/api/:id/:name';
  const params = {
    id    : 1,
    name  : 'name',
    age   : undefined,
    gender: 'female'
  };

  expect(replaceUrlParams(url, params)).toBe('/api/1/name');
});

test('replaceUrlParams with empty params', () => {
  const url = '/api/:id/:name';
  const params = {};

  expect(replaceUrlParams(url, params)).toBe('/api');
});

test('buildUrl', () => {
  const url = '/api/:id/:name';
  const urlParams = {
    id  : 1,
    name: 'name'
  };

  const baseUrl = 'http://localhost';

  expect(buildUrl(url,  urlParams, baseUrl)).toBe('http://localhost/api/1/name');
});

test('buildUrl with empty params', () => {
  const url = '/api/:id/:name';
  const urlParams = {};

  const baseUrl = 'http://localhost';

  expect(buildUrl(url,  urlParams, baseUrl)).toBe('http://localhost/api');
});

test('buildUrl with empty baseUrl', () => {
  const url = '/api/:id/:name';
  const urlParams = {
    id  : 1,
    name: 'name'
  };

  expect(buildUrl(url,  urlParams)).toBe('http://localhost/api/1/name');
});
