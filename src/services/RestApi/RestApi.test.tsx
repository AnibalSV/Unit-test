import Endpoint from './Endpoint';
import { type EndpointProps } from './interfaces';
import RestApi from './RestApi';
import fetchMock from 'jest-fetch-mock';

let api;

const endpointsSchema: EndpointProps[] = [
  { name: 'users', url: '/users' },
  { name: 'locations', url: '/locations/:id', urlParams: { format: 'json' } },
  { name: 'account-users', url: '/account/:account/users/:id' }
];

const apiConfig = {
  headers: {
    'Content-Type': 'application/json'
  }
};

beforeEach(() => {
  api = new RestApi(endpointsSchema);
  fetchMock.resetMocks();
  fetchMock.mockResponse(JSON.stringify({}));
});

test('It should create an instance with the right properties', () => {
  endpointsSchema.forEach(endpoint => {
    expect(api[endpoint.name]).toBeInstanceOf(Endpoint);
    expect(api.get(endpoint.name)).toBeInstanceOf(Endpoint);
  });
});

test('It should add a new endpoint', () => {
  api.add({ name: 'newEndpoint', url: '/newEndpoint' });
  expect(api.newEndpoint).toBeInstanceOf(Endpoint);
});

test('It should remove an endpoint with the name', () => {
  api.remove('users');
  expect(api.users).toBeNull();
});

test('It should get the endpoint with the name', () => {
  expect(api.get('users')).toBeInstanceOf(Endpoint);
});

test('It should get the endpoint with the name', () => {
  api.users.get();

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/users', { ...apiConfig, method: 'GET' });
});

test('It should post the endpoint with the name', () => {
  const data = { name: 'John' };

  api.users.post(data);

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/users', { ...apiConfig, method: 'POST', body: JSON.stringify(data) });
});

test('It should put the endpoint with the name', () => {
  const data = { name: 'John' };

  api.users.put(data);

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/users', { ...apiConfig, method: 'PUT', body: JSON.stringify(data) });
});

test('It should delete the endpoint with the name', () => {
  api.users.delete();

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/users', { ...apiConfig, method: 'DELETE' });
});

test('It should make a request with the rights url parameters', () => {
  const urlParams = { id: 'canada', PC: '28026' };

  api.get('locations').get(urlParams);

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/locations/canada?format=json&PC=28026', { ...apiConfig, method: 'GET' });
});

test('It should make a request with the right baseUrl', () => {
  const api = new RestApi(endpointsSchema, { baseUrl: '/api/:version' });
  api.get('users').get({ version: 'v1' });

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/api/v1/users', { ...apiConfig, method: 'GET' });
});

test('It should make a request with the right headers', () => {
  const headers = {
    Token: 'Somethint'
  };

  api.get('users').get({}, { headers });

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/users', { ...apiConfig, headers: { ...headers, ...apiConfig.headers }, method: 'GET' });
});

test('It should remove any url parameter if it doesnt exist', () => {
  api.get('locations').get();

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/locations?format=json', { ...apiConfig, method: 'GET' });
});

test('It should remove any url parameters in between', () => {
  api.get('account-users').get();

  expect(fetchMock).toHaveBeenCalledWith('http://localhost/account/users', { ...apiConfig, method: 'GET' });
});

test('It should transform any json data', () => {
  const items = [{ name: 'John' }];

  const data = { items };

  fetchMock.mockResponseOnce(JSON.stringify(data));
  const getItems = (res) => res.items;
  api.get('users').get({}, { transform: getItems }).then(res => {
    expect(res).toEqual(items);
  });
});
