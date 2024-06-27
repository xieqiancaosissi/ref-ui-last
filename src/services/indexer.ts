import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "../services/signature";
import { parsePoolView } from "./api";
import { PoolRPCView } from "@/interfaces/swap";
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

export const getPoolsByIds = async ({
  pool_ids,
}: {
  pool_ids: string[];
}): Promise<PoolRPCView[]> => {
  const ids = pool_ids.join("|");
  if (!ids) return [];
  return fetch(config.indexerUrl + "/list-pools-by-ids?ids=" + ids, {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-pools-by-ids"),
    },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools = pools.map((pool: any) => parsePoolView(pool));
      return pools;
    })
    .catch(() => {
      return [];
    });
};

export const get24hVolumes = async (
  pool_ids: (string | number)[]
): Promise<string[]> => {
  const batchSize = 300;
  const numBatches = Math.ceil(pool_ids.length / batchSize);
  const promises: Promise<string[]>[] = [];

  for (let i = 0; i < numBatches; i++) {
    const batchIds = pool_ids.slice(i * batchSize, (i + 1) * batchSize);
    const promise = fetch(
      config.sodakiApiUrl +
        `/poollist/${batchIds.join("|")}/rolling24hvolume/sum`,
      {
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((batchData) => batchData.map((r: any) => r.toString()));

    promises.push(promise);
  }

  const results = await Promise.all(promises);
  return results.flat();
};

export const getTopPools = async (): Promise<PoolRPCView[]> => {
  const listTopPools = await fetch(config.indexerUrl + "/list-top-pools", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-top-pools"),
    },
  })
    .then((res) => res.json())
    .catch(() => []);
  return listTopPools;
};

export const getTxId = async (receipt_id: string) => {
  return await fetch(config.txIdApiUrl + `/v1/search/?keyword=${receipt_id}`)
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return [];
    });
};
