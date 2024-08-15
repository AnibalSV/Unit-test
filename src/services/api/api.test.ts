import { getAccountSummPerf } from "./utils";
import apiPerfSummResp from "../../mocks/apiPerfSummResp.json";
import fetchMock from "jest-fetch-mock";
beforeEach(() => {
  fetchMock.resetMocks();
});

test("should get the right data from getAccountSummPerf", async () => {
  const props = {
    account: "gradesavers",
    dateRange: [new Date("2019-01-01"), new Date("2019-01-31")] as [Date, Date],
    compareDateRange: [new Date("2019-02-01"), new Date("2019-02-28")] as [
      Date,
      Date
    ],
  };

  fetchMock.mockResponse(JSON.stringify(apiPerfSummResp));
  const data = await getAccountSummPerf(props as any);

  expect(fetchMock).toHaveBeenCalledWith(
    "http://localhost/api/accounts/gradesavers/performance?format=json&start_date=2019-01-01&end_date=2019-01-31",
    undefined
  );

  expect(fetchMock).toHaveBeenCalledWith(
    "http://localhost/api/accounts/gradesavers/performance?format=json&start_date=2019-02-01&end_date=2019-02-28",
    undefined
  );

  const dataStructure = expect.objectContaining({
    items: expect.arrayContaining([
      expect.objectContaining({
        date: expect.any(String),
        revenue: expect.any(Number),
        net_revenue: expect.any(Number),
      }),
    ]),
  });

  const seriesDataStructure = expect.arrayContaining([
    expect.objectContaining({
      name: expect.any(String),
      data: expect.arrayContaining([
        expect.arrayContaining([expect.any(Number), expect.any(Number)]),
      ]),
    }),
  ]);

  expect(data).toEqual(
    expect.objectContaining({
      data: dataStructure,
      compareData: dataStructure,
      seriesData: seriesDataStructure,
      compareSeriesData: seriesDataStructure,
    })
  );
});
