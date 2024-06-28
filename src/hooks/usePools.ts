import { useState, useEffect, useCallback } from "react";
import { usePoolStore } from "@/stores/pool";
import {
  getSearchResult,
  getClassicPoolSwapRecentTransaction,
  getClassicPoolLiquidtyRecentTransaction,
} from "@/services/pool";
import { ftGetTokenMetadata } from "@/services/token";

import _ from "lodash";
//
type UsePoolSearchProps = {
  isChecked: boolean;
  sortKey: string;
  sortOrder: string;
  currentPage: number | null;
  isActive: string;
  searchValue: string;
  poolType?: string;
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
  poolType,
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
          type: poolType || "classic",
          sort: sortKey,
          limit: "20",
          offset: currentPage ? (((currentPage - 1) * 20) as any) : "0",
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
      500,
      { leading: false }
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
  }, [currentPage, isChecked, sortKey, sortOrder, isActive, searchValue]);

  return { poolList, totalItems, isLoading: poolStore.getPoolListLoading() };
};

// deal list to get token src
export const useTokenMetadata = (list: Array<any>) => {
  const [isDealed, setIsDealed] = useState(false);
  const [updatedMapList, setUpdatedList] = useState<Array<any>>([]);

  useEffect(() => {
    let updatedList = [...list];
    setIsDealed(false);

    Promise.all(
      list.flatMap((item) =>
        item?.token_account_ids?.map((tokenId: string) =>
          ftGetTokenMetadata(tokenId)
        )
      )
    )
      .then((metadataResults) => {
        const metadataMap = new Map(
          metadataResults.map((metadata) => [metadata?.id, metadata])
        );

        updatedList = updatedList.map((item) => ({
          ...item,
          token_account_ids: item?.token_account_ids?.map(
            (tokenId: string, index: number) => ({
              tokenId,
              id: tokenId,
              icon: metadataMap.get(tokenId)?.icon,
              decimals: metadataMap.get(tokenId)?.decimals,
              symbol:
                item?.token_symbols[index] == "wNEAR"
                  ? "NEAR"
                  : item?.token_symbols[index],
            })
          ),
          supplies: item?.amounts
            ? item.amounts.reduce(
                (
                  acc: { [tokenId: string]: string },
                  amount: string,
                  i: number
                ) => {
                  acc[item.token_account_ids[i]] = amount;
                  return acc;
                },
                {}
              )
            : {},
          token_symbols: item?.token_symbols.map((item: string) => {
            return item == "wNEAR" ? "NEAR" : item;
          }),
        }));

        setUpdatedList(updatedList);
      })
      .finally(() => {
        setIsDealed(true);
      })
      .catch((error) => {
        console.error("error:", error);
      });
  }, [list]);

  return { isDealed, updatedMapList };
};

export const checkIsHighRisk = (pureIdList: any, arr: any) => {
  const returnMap: any = [];
  arr.token_account_ids?.map((item: any, index: number) => {
    if (pureIdList.includes(item.tokenId)) {
      const waitpushIte = item;
      Object.assign(waitpushIte, {
        symbol: arr.token_symbols[index],
      });
      returnMap.push(waitpushIte);
    }
  });
  if (returnMap.length == 1) {
    return {
      risk: true,
      symbol: returnMap[0].symbol,
      tips: `${returnMap[0].symbol} is uncertified token with high risk.`,
    };
  } else if (returnMap.length == 2) {
    return {
      risk: true,
      symbol: returnMap[0].symbol,
      symbol1: returnMap[1].symbol,
      tips: `${returnMap[0].symbol} and ${returnMap[1].symbol} are uncertified token with high risk.`,
    };
  } else {
    return {
      risk: false,
    };
  }
};

export const useClassicPoolTransaction = ({
  pool_id,
}: {
  pool_id: string | number;
}) => {
  const [swapRecent, setSwapRecent] = useState<any[]>([]);

  const [lqRecent, setLqRecent] = useState<any[]>([]);

  useEffect(() => {
    getClassicPoolSwapRecentTransaction({
      pool_id,
    }).then(setSwapRecent);

    getClassicPoolLiquidtyRecentTransaction({
      pool_id,
    }).then(setLqRecent);
  }, []);

  return { swapTransaction: swapRecent, liquidityTransactions: lqRecent };
};
