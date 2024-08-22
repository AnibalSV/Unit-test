import RestApi from "services/RestApi";
import Cookies from "js-cookie";

import { BASE_API_URL } from "env";
import { getProp } from "fp";

const api = new RestApi(
  [
    { name: "slots", url: "/slots" },
    { name: "partners", url: "/partners" },
    { name: "routes", url: "/internal-dashboard-routes" },
    { name: "validateSlots", url: "/validate-slots" },
    { name: "accountDetails", url: "/account-details" },
    { name: "scriptsABTest", url: "/scripts/ab-test" },
    { name: "groupVersions", url: "/scripts/group-version" },
    { name: "countries", url: "/countries", baseUrl: BASE_API_URL },
    { name: "ad-sizes", url: "/ad-sizes", baseUrl: BASE_API_URL },
    {
      name: "scriptsDiffChanges",
      url: "/scripts/diff-changes",
    },
    { name: "scriptsHistory", url: "/scripts/history" },
    { name: "scriptsInfo", url: "/scripts/info" },
  ],
  {
    baseUrl: BASE_API_URL + "/:account",
    headers: {
      "X-CSRFToken": Cookies.get("csrftoken"),
    },
  }
);

export default api;
