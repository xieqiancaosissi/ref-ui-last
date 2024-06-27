import React, { useEffect, useState } from "react";
import { getAllWatchListFromDb } from "@/services/pool";
import { getAccountId } from "@/utils/wallet";
export const useWatchList = () => {
  const [watchListId, setIdList] = useState<any>([]);
  useEffect(() => {
    getAllWatchListFromDb({ account: getAccountId() }).then((res) => {
      const id: any = [];
      res.map((item) => {
        id.push(item.pool_id);
      });
      setIdList(id);
    });
  }, []);
  return { watchListId };
};
