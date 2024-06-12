import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
export const getSearchResult = async ({
  type = "classic",
  sort = "tvl",
  limit = "100",
  offset = "0",
  farm = "false",
  hide_low_pool = "false",
  order = "desc",
  token_type = "",
  token_list = "",
  pool_id_list = "",
  onlyUseId = false,
}: {
  type?: string;
  sort?: string;
  limit?: string;
  offset?: string;
  farm?: string | boolean;
  hide_low_pool?: string | boolean;
  order?: string;
  token_list?: string;
  token_type?: string;
  pool_id_list?: string;
  onlyUseId?: boolean;
}): Promise<any[]> => {
  let tktype = token_type;
  if (token_type == "all") {
    tktype = "";
  } else if (token_type == "stablecoin") {
    tktype = "stable_coin";
  }
  if (sort == "apr") {
    sort = "apy";
  }
  if (sort == "volume_24h") {
    sort = "24h";
  }

  try {
    let pools: any;
    const url = !onlyUseId
      ? `/pool/search?type=${type}&sort=${sort}&limit=${limit}&offset=${offset}&farm=${farm}&hide_low_pool=${hide_low_pool}&order_by=${order}&token_type=${tktype}&token_list=${token_list}&pool_id_list=${pool_id_list}`
      : `/pool/search?pool_id_list=${pool_id_list}`;
    pools = await fetch(getConfig().indexerUrl + url, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/pool/search"),
      },
    }).then((res) => res.json());
    // localStorage.setItem("poolsTotal", pools.data.total);

    if (pools?.data?.list.length > 0) {
      pools = pools.data;
      return pools;
      // .filter((pool: { token_account_ids: string | any[]; id: any }) => {
      //   return !isStablePool(pool.id) && pool.token_account_ids.length < 3;
      // })
      // .filter(filterBlackListPools);
    } else {
      pools = [];
      return [];
    }
  } catch (error) {
    return [];
  }
};
