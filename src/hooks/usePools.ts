import { useState, useEffect, useCallback } from "react";
import { usePoolStore } from "@/stores/pool";
import { useAccountStore } from "@/stores/account";
import {
  getSearchResult,
  getClassicPoolSwapRecentTransaction,
  getClassicPoolLiquidtyRecentTransaction,
} from "@/services/pool";
import { ftGetTokenMetadata } from "@/services/token";
import {
  DCLPoolSwapTransaction,
  DCLPoolLiquidtyRecentTransaction,
  LimitOrderRecentTransaction,
  getDCLPoolSwapRecentTransaction,
  getDCLPoolLiquidtyRecentTransaction,
  getLimitOrderRecentTransaction,
} from "@/services/indexer";
import { getPoolDetails } from "@/services/pool_detail";
import { getSharesInPool } from "@/services/pool";
import { getStakedListByAccountId } from "@/services/farm";
import _ from "lodash";

import { PoolInfo } from "@/services/swapV3";
import { getAllTokenPrices } from "@/services/farm";
import BigNumber from "bignumber.js";
import { toReadableNumber } from "@/utils/numbers";
import getConfigV2 from "@/utils/configV2";
import getConfig from "@/utils/config";
import { refSwapV3ViewFunction } from "@/utils/contract";
import { useSwapStore } from "@/stores/swap";
import { refFiViewFunction } from "@/utils/contract";
import { STABLE_LP_TOKEN_DECIMALS } from "@/utils/constant";
import { toNonDivisibleNumber } from "@/utils/numbers";
import { StablePool } from "@/interfaces/swap";

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

    const promises = list.flatMap((item) =>
      item?.token_account_ids?.map((tokenId: string) => {
        return ftGetTokenMetadata(tokenId);
      })
    );

    Promise.all(promises)
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
          rates: item?.rates ||
            item?.degens || [
              "1000000000000000000000000",
              "1000000000000000000000000",
              "1000000000000000000000000",
              "1000000000000000000000000",
            ],
          amp: item?.amp || 240,
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
  }, [list[0]]);

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

export const useDCLPoolTransaction = ({
  pool_id,
}: {
  pool_id: string | number;
}) => {
  const [swapRecent, setSwapRecent] = useState<DCLPoolSwapTransaction[]>([]);

  const [lqRecent, setLqRecent] = useState<DCLPoolLiquidtyRecentTransaction[]>(
    []
  );

  const [limitOrderRecent, setLimitOrderRecent] = useState<
    LimitOrderRecentTransaction[]
  >([]);

  useEffect(() => {
    getDCLPoolSwapRecentTransaction({
      pool_id,
    }).then(setSwapRecent);

    getDCLPoolLiquidtyRecentTransaction({
      pool_id,
    }).then(setLqRecent);

    getLimitOrderRecentTransaction({
      pool_id,
    }).then(setLimitOrderRecent);
  }, []);
  return {
    swapTransactions: swapRecent,
    liquidityTransactions: lqRecent,
    limitOrderTransactions: limitOrderRecent,
  };
};

// get stable shares

export const usePool = (id: number | string) => {
  const accountStore = useAccountStore();

  const isSignedIn = accountStore.isSignedIn;

  const [pool, setPool] = useState<any>();
  const [shares, setShares] = useState<string>("0");
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  const [v2StakeList, setV2StakeList] = useState<Record<string, string>>({});

  const [finalStakeList, setFinalStakeList] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id))
      .then(setShares)
      .catch(() => setShares);

    getStakedListByAccountId({})
      .then(({ stakedList, finalStakeList, v2StakedList }) => {
        setStakeList(stakedList);
        setV2StakeList(v2StakedList);
        setFinalStakeList(finalStakeList);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }, [id, isSignedIn]);

  return {
    pool,
    shares,
    stakeList,
    v2StakeList,
    finalStakeList,
  };
};

export const listPools = async () => {
  const res = await refSwapV3ViewFunction({
    methodName: "list_pools",
  });

  return res.filter(
    (p: any) => !getConfig().DCL_POOL_BLACK_LIST.includes(p?.pool_id)
  );
};

export const useAllPoolsV2 = (forPool?: boolean) => {
  const [allPools, setAllPools] = useState<PoolInfo[]>();
  const swapStore = useSwapStore();
  const tokenPriceList = swapStore.getAllTokenPrices();
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      swapStore.setAllTokenPrices(res);
    });
  }, []);

  useEffect(() => {
    if (!Object.keys(tokenPriceList || {}).length) return;

    listPools()
      .then((list: PoolInfo[]) => {
        let final = list;
        if (forPool) {
          final = list.filter(
            (p: any) =>
              !getConfigV2().BLACK_LIST_DCL_POOL_IDS_IN_POOLS.includes(
                p.pool_id
              )
          );
        } else {
          final = list.filter((p: any) =>
            getConfigV2().WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS.includes(
              p.pool_id
            )
          );
        }
        return Promise.all(
          final.map(async (p: any) => {
            const token_x: any = p.token_x;
            const token_y: any = p.token_y;

            p.token_x_metadata = await ftGetTokenMetadata(token_x);
            p.token_y_metadata = await ftGetTokenMetadata(token_y);
            const pricex = tokenPriceList[token_x]?.price || 0;
            const pricey = tokenPriceList[token_y]?.price || 0;
            const {
              total_x,
              total_y,
              total_fee_x_charged,
              total_fee_y_charged,
            }: any = p;
            const totalX = new BigNumber(total_x)
              .minus(total_fee_x_charged)
              .toFixed();
            const totalY = new BigNumber(total_y)
              .minus(total_fee_y_charged)
              .toFixed();
            const tvlx =
              Number(toReadableNumber(p.token_x_metadata.decimals, totalX)) *
              Number(pricex);
            const tvly =
              Number(toReadableNumber(p.token_y_metadata.decimals, totalY)) *
              Number(pricey);

            p.tvl = tvlx + tvly;
            p.tvlUnreal = Object.keys(tokenPriceList).length === 0;

            return p;
          })
        );
      })
      .then(setAllPools);
  }, [Object.keys(tokenPriceList || {}).length]);
  return allPools;
};
