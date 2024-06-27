import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
import { ftGetStorageBalance } from "./ft-contract";
import { storageDepositForFTAction } from "./creator/storage";
import { executeMultipleTransactions } from "./createPoolFn";
import { refFiViewFunction } from "../utils/contract";
import { getAccountId } from "../utils/wallet";
import moment from "moment";
import db from "@/db/RefDatabase";

const { REF_FI_CONTRACT_ID } = getConfig();

const genUrlParams = (props: Record<string, string | number>) => {
  return Object.keys(props)
    .map((key) => key + "=" + props[key])
    .join("&");
};

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
  labels = "",
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
  labels?: string;
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
      ? `/pool/search?type=${type}&sort=${sort}&limit=${limit}&labels=${labels}&offset=${offset}&hide_low_pool=${hide_low_pool}&order_by=${order}&token_type=${tktype}&token_list=${token_list}&pool_id_list=${pool_id_list}`
      : `/pool/search?pool_id_list=${pool_id_list}`;
    pools = await fetch(getConfig().indexerOld + url, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/pool/search"),
      },
    }).then((res) => res.json());

    if (pools?.data?.list.length > 0) {
      pools = pools.data;
      return pools;
    } else {
      pools = [];
      return [];
    }
  } catch (error) {
    return [];
  }
};

//for create pool
export const addSimpleLiquidityPool = async (
  tokenIds: string[],
  fee: number
) => {
  const storageBalances = await Promise.all(
    tokenIds.map((id) => ftGetStorageBalance(id))
  );
  const transactions: any[] = storageBalances
    .reduce((acc, sb, i) => {
      if (!sb || sb.total === "0") acc.push(tokenIds[i]);
      return acc;
    }, [])
    .map((id: any) => ({
      receiverId: id,
      functionCalls: [storageDepositForFTAction()],
    }));

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: "add_simple_pool",
        args: { tokens: tokenIds, fee },
        amount: "0.05",
      },
    ],
  });

  return executeMultipleTransactions(
    transactions,
    `${window.location.origin}/pools`
  );
};

export const getPoolIndexTvlOR24H = async (type: string, day: any) => {
  try {
    const url = `/v3/${type}/chart/line?day=${day}`;
    const resp = await fetch(getConfig().tvlAnd24hUrl + url, {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    }).then((res) => res.json());
    const waitExportMap: {
      high: number;
      low: number;
      list: number[];
      date: any[];
      totalVolume: number;
    } = {
      high: resp.data.high,
      low: resp.data.low,
      list: [],
      totalVolume: 0,
      date: [],
    };
    function timestampToDateString(timestamp: any) {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}/${month}/${day}`;
    }
    waitExportMap.totalVolume = resp.data.list
      .reduce((accumulator: any, currentValue: any) => {
        const volume = parseFloat(currentValue.volume); //
        waitExportMap.list.push(Number(volume.toFixed(2))); //
        waitExportMap.date.push(timestampToDateString(currentValue.time));
        return accumulator + volume; //
      }, 0)
      .toFixed(3);
    return waitExportMap;
  } catch (error) {
    return {};
  }
};

export const getAllPoolData = async () => {
  return await fetch(getConfig().indexerUrl + "/all-pool-data", {
    method: "GET",
    headers: {
      ...getAuthenticationHeaders("/all-pool-data"),
    },
  })
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    });
};

export const findSamePools = async (
  tokenList: Array<any>,
  createFee: number
) => {
  return await fetch(
    getConfig().tvlAnd24hUrl +
      `/pool/same?token_list=${tokenList.join(",")}&fee=${createFee}`,
    {
      method: "GET",
      headers: {
        ...getAuthenticationHeaders("/pool/same"),
      },
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res.data;
    });
};

export const getPoolsDetailById = async ({ pool_id }: { pool_id: string }) => {
  return fetch(getConfig().indexerUrl + "/pool/detail?pool_id=" + pool_id, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/pool/detail"),
    },
  })
    .then((res) => res.json())
    .then((pools) => {
      console.log(pools);
      return pools.data;
    })
    .catch(() => {
      return [];
    });
};

export const getSharesInPool = (id: number): Promise<string> => {
  return refFiViewFunction({
    methodName: "get_pool_shares",
    args: {
      pool_id: id,
      account_id: getAccountId(),
    },
  });
};

const parsePoolTxTimeStamp = (ts: string) => {
  return moment(Math.floor(Number(ts) / 1000000)).format("YYYY-MM-DD HH:mm:ss");
};

export interface ClassicPoolSwapTransaction {
  token_in: string;
  token_out: string;
  swap_in: string;
  swap_out: string;
  timestamp: string;
  tx_id: string;
  receipt_id: string;
}

export const getClassicPoolSwapRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    getConfig().indexerUrl + `/get-recent-transaction-swap?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-swap"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: ClassicPoolSwapTransaction[]) => {
      return res.map((tx) => {
        return {
          ...tx,
          timestamp: parsePoolTxTimeStamp(tx.timestamp),
        };
      });
    });
};

export interface ClassicPoolLiquidtyRecentTransaction {
  method_name: string;
  timestamp: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  tx_id: string;
  shares?: string;
  pool_id?: string;
  amounts?: string;
  receipt_id: string;
}

export const getClassicPoolLiquidtyRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    getConfig().indexerUrl + `/get-recent-transaction-liquidity?${paramString}`,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-recent-transaction-liquidity"),
      },
    }
  )
    .then((res) => res.json())
    .then((res: ClassicPoolLiquidtyRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export const getAllWatchListFromDb = async ({
  account = getAccountId()?.toString(),
}: {
  account?: string;
}) => {
  if (account) {
    return await db
      .allWatchList()
      .where({
        account,
      })
      .toArray();
  } else {
    return [];
  }
};

export const getWatchListFromDb = async ({
  pool_id,
  account = getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db
    .allWatchList()
    .where({
      pool_id,
      account,
    })
    .toArray();
};

export const addPoolToWatchList = async ({
  pool_id,
  account = getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db.watchList.put({
    id: account + "-" + pool_id,
    pool_id,
    account,
    update_time: new Date().getTime(),
  });
};
export const removePoolFromWatchList = async ({
  pool_id,
  account = getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db.watchList.delete(account + "-" + pool_id);
};
