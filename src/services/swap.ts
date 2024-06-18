import { getAuthenticationHeaders } from "@/services/signature";
import db from "@/db/RefDatabase";
import getConfig from "@/utils/config";
const config = getConfig();
export const reloadTopPools = async (): Promise<"success" | "failed"> => {
  const listTopPools = await fetch(config.indexerUrl + "/list-top-pools", {
    method: "GET",
    headers: {
      "Content-type": "application/json; charset=UTF-8",
      ...getAuthenticationHeaders("/list-top-pools"),
    },
  }).then((res) => res.json());
  await db.cacheTopPools(listTopPools);
  // cache dcl pools
  return "success";
};
