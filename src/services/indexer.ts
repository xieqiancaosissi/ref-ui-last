import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
const config = getConfig();
export const currentRefPrice = async (): Promise<any> => {
  return await fetch(
    getConfig().indexerUrl +
      "/get-token-price?token_id=token.v2.ref-finance.near",
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-token-price"),
      },
    }
  )
    .then((res) => res.json())
    .then((priceBody) => {
      return priceBody.price;
    })
    .catch(() => {
      return "-";
    });
};

export const getTokenPriceList = async (): Promise<any> => {
  return await fetch(config.indexerUrl + "/list-token-price", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-token-price"),
    },
  })
    .then((res) => res.json())
    .then((list) => {
      return list;
    });
};

export const getTokens = async () => {
  return await fetch(getConfig().indexerUrl + "/list-token", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-token"),
    },
  })
    .then((res) => res.json())
    .then((tokens) => {
      return tokens;
    });
};
