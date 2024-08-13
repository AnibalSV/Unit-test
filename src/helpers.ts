import merge from "lodash/merge";
import React from "react";
import ReactDOM from "react-dom";
import { createRoot } from "react-dom/client";
import {
  differenceInCalendarMonths,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import {
  entries,
  flat,
  getProp,
  isArray,
  isDate,
  isString,
  map,
  max,
  min,
  pipe,
  reduce,
  toDate,
  toLocaleCurrency,
  toLocaleStringNumb,
  toNumber,
} from './fp';

import { BASE_API_URL } from "env";


export const formatNumber = (x: number, decimal = 2) => {
  if (isNaN(x)) return x;
  return Number(x).toLocaleString(navigator.languages[0], {
    maximumFractionDigits: decimal,
    minimumFractionDigits: decimal,
  });
};

// @deprecated
export const numberWithCommas = formatNumber;

export const isNumber = (val: any) => {
  return !isNaN(Number(val));
};

export const cloneStringify = (obj) => JSON.parse(JSON.stringify(obj));

export const searchParamsToObj = (searchParams) => {
  const searchParamsObj = {};
  searchParams.forEach((value, key) => {
    searchParamsObj[key] = value;
  });
  return searchParamsObj;
};

export const calcDiscrepancy = (a, b) => Math.abs(a - b) / Math.max(a, b);
export const formatCurrency = (
  prefix: string,
  numb: number,
  decimal?: number
) => {
  return isNumber(numb) ? prefix + formatNumber(numb, decimal) : numb;
};

export const currencyFormatter = toLocaleCurrency(navigator.language);
export const intFormatter = toLocaleStringNumb(navigator.language, {
  maximumFractionDigits: 0,
});
export const percentageFormatter = toLocaleStringNumb(navigator.language, {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});


export const capitalize = (string) => {
  if (typeof string !== "string") return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * @deprecated Use capitalize instead
 */
export const capitalizeFirstLetter = capitalize;

export const mergeDeep = merge;

export const randomChoice = (percent: number) => {
  return Math.random() > percent;
};

const TRANSLATE_MAP = {
  revenue: "Revenue",
  cpms: "CPM",
  impressions: "Server Impressions",
  paid_impressions: "Paid Impressions",
};

export const translate = (key) => {
  return TRANSLATE_MAP[key] || key;
};

export const numberToPercentage = (
  number: number | string,
  decimal?: number
) => {
  const value = Math.abs(parseFloat(number as string));

  if (isNaN(value)) {
    return "";
  }

  return numberWithCommas(value, decimal) + "%";
};

export const avgCalc = (items: number[]) => {
  const sum = items.reduce((a, b) => a + b, 0);
  return sum / items.length;
};

export const sumCalc = (items: number[]) => {
  const sum = items.reduce((a, b) => a + b, 0);
  return sum;
};

type frecuency = "daily" | "weekly" | "monthly" | "auto";

export const toLocalDate = (dateStr) => {
  let date: Date;

  if (isString(dateStr)) {
    const strArr = dateStr.split("-");
    date = new Date(
      Number(strArr[0]),
      Number(strArr[1]) - 1,
      Number(strArr[2])
    );
  } else {
    date = new Date(dateStr);
  }

  return date;
};

const getDateTimeFromPeriod = (
  datetime: string,
  frecuency: frecuency = "daily"
) => {
  let date = parseISO(datetime);

  switch (frecuency) {
    case "weekly":
      date = startOfWeek(date);

      break;

    case "monthly":
      date = startOfMonth(date);
      break;

    default: {
      break;
    }
  }

  return isDate(date) ? Number(date) : datetime;
};

export const transformDataSeriesDateTime =
  (frecuency: frecuency, yaxisList: YAxis[]) =>
  (dataSeries: ApexAxisChartSeries) => {
    const setFrecuency =
      frecuency === "auto" ? getAutoTimeRange(dataSeries) : frecuency;
    return setFrecuency === "daily"
      ? dataSeries
      : dataSeries.map((serieData) => {
          const name = serieData.name?.split("-").shift();
          const yaxis = yaxisList.find((item) =>
            isArray(item.seriesName)
              ? item.seriesName.includes(name)
              : item.seriesName === name
          );

          const calculate = yaxis?.calculateDateOnFrecuency;

          if (!calculate) {
            throw new Error(
              `calculateDateOnFrecuency is not defined for ${serieData.name}`
            );
          }

          const serie = cloneStringify(serieData) as any;

          serie.data = entries(
            reduce(
              {},
              (acc, [datetime, value]) => {
                const newTime = getDateTimeFromPeriod(datetime, setFrecuency);

                acc[newTime] =
                  acc[newTime] === undefined
                    ? value
                    : calculate(acc[newTime], value);

                return acc;
              },
              serie.data
            )
          ).map(([time, value]) => [Number(time), value]);

          return serie;
        });
  };

export const getAutoTimeRange = (filteredData) => {
  const { maxDate, minDate } = pipe(
    map(getProp("data")),
    flat,
    map(pipe(getProp(0), toDate, toNumber)),
    (dates) => ({
      maxDate: max(dates),
      minDate: min(dates),
    })
  )(filteredData);

  const monthsDiff = differenceInCalendarMonths(maxDate, minDate);

  let frecuency;
  if (monthsDiff <= 3) {
    frecuency = "daily";
  } else if (monthsDiff > 3 && monthsDiff <= 6) {
    frecuency = "weekly";
  } else {
    frecuency = "monthly";
  }
  return frecuency;
};

const getReactVersion = () => {
  const reactVersion = React.version.split(".");
  return {
    major: Number(reactVersion[0]),
    minor: Number(reactVersion[1]),
    patch: Number(reactVersion[2]),
  };
};

export const renderReactElement = (component, props, domEl) => {
  const { major: version } = getReactVersion();

  const e = React.createElement;
  const ReactComponent = e(Theme, { children: null }, e(component, props));

  if (version > 17) {
    const root = createRoot(domEl);
    root.render(ReactComponent);
  } else {
    ReactDOM.render(ReactComponent, domEl);
  }
};

export const propsOrValue = (fn) => (props) => {
  let value = props;
  if (typeof props === "object") {
    value = props.value;
  }

  return value ? fn(value) : 0;
};

export default {
  avgCalc,
  sumCalc,
  renderReactElement,
  numberToPercentage,
  toLocalDate,
  currencyFormatter,
  intFormatter,
  mergeDeep,
  percentageFormatter,
  capitalize,
  capitalizeFirstLetter,
  formatCurrency,
  numberWithCommas,
  formatNumber,
  propsOrValue,
};

export const isEmptyObject = (obj?: Record<string, any>) =>
  typeof obj === "object" && obj !== null
    ? Object.keys(obj).length === 0
    : null;

/**
 * Get a random number between a range
 * @param max
 * @param min default 0
 * @returns
 */
export const createRandomNumber = (max: number, min: number = 0) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Create a list with a given length and fill
 * @param end
 * @param start
 * @param fill
 */
export const createList = (end: number, start: number = 0, fill: any = null) => new Array(end - start).fill(fill);



/**
 * Get the length of an array or an object
 * @param {any[] | Record<string, any> | string}
 * @returns {null | number}
 */
export const len = (item?: any[] | Record<string, any> | string) => {
  let len: number | null = null;

  if (Array.isArray(item) || typeof item === "string") {
    len = item.length;
  } else if (item && typeof item === "object") {
    len = Object.keys(item).length;
  }

  return len;
};

/**
 * Delay a promise to be resolve in x seconds
 * @param s seconds
 */
export const delayPromise = (s: number) =>
  new Promise<undefined>((resolve) => setTimeout(resolve, s * 1000));

export const hasTimeExpired = (date: number, timeToExpire: number) => {
  const now = new Date();
  const dateToExpire = new Date(date);
  return now.getTime() - dateToExpire.getTime() > timeToExpire;
};