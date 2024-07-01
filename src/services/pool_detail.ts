import getConfig from "../utils/config";
import { getAuthenticationHeaders } from "./signature";
const config = getConfig();
export const getPoolMonthVolume = async (pool_id: string): Promise<any[]> => {
  return await fetch(config.sodakiApiUrl + `/pool/${pool_id}/volume`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((monthVolume) => {
      return monthVolume.slice(0, 60);
    });
};

export const getPoolMonthTVL = async (pool_id: string): Promise<any[]> => {
  return await fetch(config.sodakiApiUrl + `/pool/${pool_id}/tvl`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((monthTVL) => {
      return monthTVL.slice(0, 60);
    });
};

export const getV3PoolVolumeById = async (pool_id: string): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + "/get-dcl-pools-volume?pool_id=" + pool_id,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-dcl-pools-volume"),
      },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      (list || []).sort((v1, v2) => {
        const b =
          new Date(v1.dateString).getTime() - new Date(v2.dateString).getTime();
        return b;
      });
      return list.slice(-60);
    })
    .catch(() => {
      return [];
    });
};
export const getV3poolTvlById = async (pool_id: string): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + "/get-dcl-pools-tvl-list?pool_id=" + pool_id,
    {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        ...getAuthenticationHeaders("/get-dcl-pools-tvl-list"),
      },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list.slice(0, 60);
    })
    .catch(() => {
      return [];
    });
};
