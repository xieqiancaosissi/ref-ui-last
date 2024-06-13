import { useState, useEffect, useCallback } from "react";
import { usePoolStore } from "@/stores/pool";
import { getSearchResult } from "@/services/pool";
import _ from "lodash";
//
type UsePoolSearchProps = {
  isChecked: boolean;
  sortKey: string;
  sortOrder: string;
  currentPage: number | null;
  isActive: string;
  searchValue: string;
};

//
type UsePoolSearchResult = {
  poolList: any[];
  totalItems: number;
  isLoading: boolean;
};

export const usePoolSearch = ({
  isChecked,
  sortKey,
  sortOrder,
  currentPage,
  isActive,
  searchValue,
}: UsePoolSearchProps): UsePoolSearchResult => {
  //
  const [totalItems, setTotalItems] = useState(0);
  const [poolList, setPoolList] = useState([]);
  const poolStore = usePoolStore();
  // use debounce
  const debouncedHandleChange = useCallback(
    _.debounce(
      (sortKey, currentPage, isActive, isChecked, sortOrder, searchValue) => {
        getSearchResult({
          type: "classic",
          sort: sortKey,
          limit: "100",
          offset: currentPage ? (((currentPage - 1) * 100) as any) : "0",
          farm: isActive == "farm",
          hide_low_pool: isChecked,
          order: sortOrder,
          token_type: "",
          token_list: searchValue,
          pool_id_list: "",
          onlyUseId: false,
          labels: isActive, //all | farm | new | meme | other
        })
          .then((res: any) => {
            setTotalItems(res.total);
            setPoolList(res?.list?.length > 0 ? res.list : []);
          })
          .catch((error) => {
            console.error("Error fetching poollist results:", error);
          })
          .finally(() => {
            poolStore.setPoolListLoading(false);
          });
      },
      500
    ),
    []
  ); //

  useEffect(() => {
    poolStore.setPoolListLoading(true);
    //
    debouncedHandleChange(
      sortKey,
      currentPage,
      isActive,
      isChecked,
      sortOrder,
      searchValue
    );
    //
  }, [isChecked, sortKey, sortOrder, currentPage, isActive, searchValue]);

  return { poolList, totalItems, isLoading: poolStore.getPoolListLoading() };
};
