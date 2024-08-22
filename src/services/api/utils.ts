import { BASE_API_URL } from 'env';
import {
  entries,
  equal,
  every,
  isArray,
  isDate,
  isNumber,
  len,
  pipe,
  stringTemplate,
  values
} from 'fp';
import RestApi from 'services/RestApi';
import Cookies from 'js-cookie';
import api from './api';

interface PerformanceSummaryResponse {
  items: Array<{
    date                 : string
    id                   : string
    ad_server_impressions: number
    discrepancy          : number
    paid_impressions     : number
    ecpm                 : number
    fill_rate            : number
    net_revenue          : number
    revenue              : number
    page_views           : number
    rpm                  : number
    rcpm                 : number
    viewable_impressions : number
    partner_name?        : string
    unit_name?           : string
    device_type?         : string
  }>
}

interface AccountDateRangeProps {
  endpointName?    : endpointName
  account          : string
  dateRange        : [Date, Date]
  compareDateRange?: [Date, Date]
}

const endpointUrlDict = {
  performanceSummary: '/accounts/${account}/performance?format=json&start_date=${start}&end_date=${end}',

  performancePartners: '/accounts/${account}/performance-partners?format=json&start_date=${start}&end_date=${end}',
  performanceGroupPartners:
    '/accounts/${account}/performance-grouped-partners?format=json&start_date=${start}&end_date=${end}&limit=${limit}',
  performancePartnersAgg:
    '/accounts/${account}/performance-partners-agg?format=json&start_date=${start}&end_date=${end}&limit=${limit}',

  performanceUnits: '/accounts/${account}/performance-units?format=json&start_date=${start}&end_date=${end}',
  performanceGroupUnits:
    '/accounts/${account}/performance-grouped-units?format=json&start_date=${start}&end_date=${end}&limit=${limit}',
  performanceUnitsAgg:
    '/accounts/${account}/performance-units-agg?format=json&start_date=${start}&end_date=${end}&limit=${limit}',

  performanceDevices   : '/accounts/${account}/performance-devices?format=json&start_date=${start}&end_date=${end}',
  performanceDevicesAgg: '/accounts/${account}/performance-devices-agg?format=json&start_date=${start}&end_date=${end}&limit=${limit}',

  performanceCountries: '/accounts/${account}/performance-countries?format=json&start_date=${start}&end_date=${end}',
  performanceAuction  : '/accounts/${account}/performance-auction?format=json&start_date=${start}&end_date=${end}',
  performanceDisplay  : '/accounts/${account}/performance-display?format=json&start_date=${start}&end_date=${end}'
};

const fetchAndParse = async <T = { items: any[] }>(url, options?) => {
  let urlObj;

  try {
    urlObj = new URL(BASE_API_URL + url);
  } catch (err) {
    urlObj = new URL(window.location.origin + BASE_API_URL + url);
  }

  urlObj.searchParams.set('format', 'json');

  return await (fetch(urlObj.toString(), options)
    .then<T>((res) => res.json())
    .catch(console.error) as Promise<T>);
};

const isDateRange = every(isArray, pipe(len, equal(2)), (dates) => dates.every(isDate));

type endpointName = keyof typeof endpointUrlDict;
const makeRequest = async <T>(endpoint: endpointName, params = {}, options?) => {
  const url = stringTemplate(endpointUrlDict[endpoint])(params);
  return await fetchAndParse<T>(url);
};

const dateToStr = (date: Date) => date.toISOString().split('T')[0];

const fetchByDates = async ({ endpointName, dateRange, compareDateRange, ...props }: AccountDateRangeProps) => {
  let start = dateToStr(dateRange[0]);
  let end = dateToStr(dateRange[1]);

  const promises: Array<Promise<PerformanceSummaryResponse>> = [];

  promises.push(makeRequest<PerformanceSummaryResponse>(endpointName, { ...props, start, end }));

  if (isDateRange(compareDateRange)) {
    start = dateToStr(compareDateRange[0]);
    end = dateToStr(compareDateRange[1]);
    promises.push(makeRequest<PerformanceSummaryResponse>(endpointName, { ...props, start, end }));
  }

  return await Promise.all(promises).then(([data, compareData]) => ({ data, compareData }));
};

export const createSeriesData = (data: PerformanceSummaryResponse, idName = 'id') => {
  const series = !Array.isArray(data.items)
    ? []
    : values(
      data.items.reduce((acc, item) => {
        const label = item.device_type || item.partner_name || item.unit_name || '';
        const id = item[idName];
        entries(item).forEach(([key, value]) => {
          if (isNumber(value)) {
            const keyStr = `${key}-${label}-${id}`;
            acc[keyStr] = acc[keyStr] || { name: key, data: [], label, id };
            acc[keyStr].data.push([item.date, Number(value)]);
          }
        });

        return acc;
      }, {})
    );

  Object.keys(data).forEach((key) => {
    const item = data[key];
    if (item?.name && item.data?.length) {
      series.push(item);
    }
  });

  return series;
};

const createSeriesFromResponse = (response: any, idName = 'id') => {
  const seriesData = createSeriesData(response.data, idName);

  let compareSeriesData;
  if (response.compareData) {
    compareSeriesData = createSeriesData(response.compareData, idName);
  }

  return { seriesData, compareSeriesData };
};

/// ------------------------------------ PUBLIC  API --------------------------------------------

/**
 *  Allows to fech any endpoint from the API.
 */
export const getAccountData = (...args) => {
  let props = args;

  if (typeof args[0] === 'string') {
    const [endpointName, options] = args;
    props = { endpointName, ...options };
  }

  return fetchByDates(props as any);
};

/**
 * Get the devices performance.
 */
export const getDevicesPerformance = async (props: AccountDateRangeProps) => {
  const [groupedPartners, partners] = await Promise.all([
    fetchByDates({ endpointName: 'performanceDevicesAgg', ...props }),
    fetchByDates({ endpointName: 'performanceDevices', ...props })
  ]);

  const { seriesData, compareSeriesData } = createSeriesFromResponse(partners, 'device_type');

  return { ...groupedPartners, seriesData, compareSeriesData };
};

/**
 * Get the partners performance.
 *
 */
export const getPartnersPerformance = async (props: AccountDateRangeProps) => {
  const [groupedPartners, partners] = await Promise.all([
    fetchByDates({ endpointName: 'performancePartnersAgg', ...props }),
    fetchByDates({ endpointName: 'performancePartners', ...props })
  ]);

  const { seriesData, compareSeriesData } = createSeriesFromResponse(partners, 'partner_id');

  return { ...groupedPartners, seriesData, compareSeriesData };
};

/**
 * Get the units performance.
 */
export const getUnitsPerformance = async (props: AccountDateRangeProps) => {
  const [groupedUnits, units] = await Promise.all([
    fetchByDates({ endpointName: 'performanceUnitsAgg', ...props }),
    fetchByDates({ endpointName: 'performanceUnits', ...props })
  ]);

  const { seriesData, compareSeriesData } = createSeriesFromResponse(units, 'unit_id');

  return { ...groupedUnits, seriesData, compareSeriesData };
};

/**
 * Get the account summary performance
 */
export const getAccountSummPerf = async (props: AccountDateRangeProps) => {
  const response = await fetchByDates({ endpointName: 'performanceSummary', ...props });

  const { seriesData, compareSeriesData } = createSeriesFromResponse(response, '');

  return { ...response, seriesData, compareSeriesData };
};

const getProp = (prop: string) => (obj: Record<string, any>) => obj[prop];
const getItems = getProp('items');

interface IApiItems<T> {
  items: T[]
}

interface PartnersResponse {
  slug         : string
  name         : string
  base_currency: 'USD' | 'EUR'
}

interface RoutesResponse {
  path    : string
  label   : string
  icon    : string
  apiUrl  : string
  children: RoutesResponse[]
}

export const fakeRequest = async (timeout: number, resolveObj?: any) => {
  return await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(resolveObj);
    }, timeout);
  });
};

export const getInitialData = () => {
  return Promise.all([
    fetchAndParse<IApiItems<PartnersResponse>>('/partners').then(getItems),
    fetchAndParse<IApiItems<RoutesResponse>>('/internal-dashboard-routes').then(getItems),
    fakeRequest(3000)
  ]).then(([partners, routes]) => ({ partners, routes }));
};
export const post = async (url: string, data: any) => {
  const baseURL = 'https://admin.lngtd.com/api';
  const response = await fetch(baseURL + url, {
    method: 'POST',
    body  : JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

// ------------------------------------ NEW  API --------------------------------------------

export const SWRMutate = (args: any[], { arg }) => {
  let url: string = '';
  let method: string = 'post';
  let rest: any[] = [];

  if (typeof args === 'string') {
    url = args;
    method = 'post';
  } else if (Array.isArray(args)) {
    url = args[0];
    method = args[1];
    rest = args.slice(2);
  }

  return SWRFetcher([url, method, arg, ...rest]);
};

interface SWRForwardProps {
  url     : string
  baseUrl?: string
  body?   : Record<string, any>
  headers?: Record<string, any>
}

type SWRServiceProps = (props: SWRForwardProps) => Promise<any>;

export const SWRForward = (service: SWRServiceProps) => (url) =>
  service({
    url,
    baseUrl: BASE_API_URL,
    headers: {
      "X-CSRFToken": Cookies.get("csrftoken"),
    },
  });
export const SWRMutationForward = (service: SWRServiceProps) => (url, {arg}) =>
  service({
    url,
    body: arg,
    baseUrl: BASE_API_URL,
    headers: {
      "X-CSRFToken": Cookies.get("csrftoken"),
    },
  });

export const SWRFetcher = async (args: any[] | string) => {
  let url: string = '';
  let method: string = 'get';
  let rest: any[] = [];

  if (typeof args === 'string') {
    url = args;
    method = 'get';
  } else if (Array.isArray(args)) {
    url = args[0];
    method = args[1];
    rest = args.slice(2);
  }

  let promise;

  try {
    promise = await api.get(url)[method](...rest);
  } catch (error) {
    console.debug(error);
    throw error;
  }

  return promise;
};
