import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
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
