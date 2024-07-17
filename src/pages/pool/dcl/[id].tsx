import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getPoolsDetailById } from "@/services/pool";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/dcl/tokenDetail";
import { CollectStar, DCLIcon } from "@/components/pools/icon";
import TokenFeeAndCureentPrice from "@/components/pools/detail/dcl/tokenFeeAndCureentPrice";
import { getAllTokenPrices } from "@/services/farm";
import Charts from "@/components/pools/detail/dcl/Charts";
import OverallLocking from "@/components/pools/detail/dcl/overallLocking";
import PoolComposition from "@/components/pools/detail/dcl/PoolComposition";
import { useTokenMetadata } from "@/hooks/usePools";
import RecentTransaction from "@/components/pools/detail/dcl/RecentTransaction";
import { addPoolToWatchList, removePoolFromWatchList } from "@/services/pool";
import NoLiquidity from "@/components/pools/detail/liquidity/NoLiquidity";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useWatchList } from "@/hooks/useWatchlist";
import {
  PoolInfo,
  get_pool,
  list_liquidities,
  get_liquidity,
} from "@/services/swapV3";
import { ftGetTokensMetadata } from "@/services/token";
import BigNumber from "bignumber.js";
import { toReadableNumber } from "@/utils/numbers";
import { usePoolStore } from "@/stores/pool";
import {
  get_pool_name,
  allocation_rule_liquidities,
  get_matched_seeds_for_dcl_pool,
  UserLiquidityInfo,
  get_all_seeds,
} from "@/services/commonV3";
import { isMobile } from "@/utils/device";
import { useAccountStore } from "@/stores/account";
import { list_farmer_seeds, get_seed } from "@/services/farm";
import { Seed } from "@/services/farm";
import getConfig from "@/utils/config";
import dynamic from "next/dynamic";
import { UnclaimedFeesBox } from "@/components/pools/detail/liquidity/UnclaimedFeesBox";
import { RelatedFarmsBox } from "@/components/pools/detail/liquidity/RelatedFarmsBox";

const YourLiquidityBox = dynamic(
  () =>
    import(
      "@/components/pools/detail/liquidity/dclYourLiquidity/YourLiquidity"
    ),
  {
    ssr: false,
  }
);

const { REF_UNI_V3_SWAP_CONTRACT_ID } = getConfig();

export default function DCLPoolDetail() {
  const router = useRouter();
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.getIsSignedIn();
  const poolId = router.query.id || "";
  const poolStore = usePoolStore();
  const { currentwatchListId, accountId } = useWatchList();
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [poolDetailV3, setPoolDetailV3] = useState<PoolInfo | any>(null);
  const [tokens, setTokens] = useState([]);
  const [user_liquidities, set_user_liquidities] = useState<
    UserLiquidityInfo[]
  >([]);

  const [matched_seeds, set_matched_seeds] = useState<Seed[]>([]);

  const [sole_seed, set_sole_seed] = useState<Seed>();
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const TransactionTabList = [
    { key: "swap", value: "Swap" },
    { key: "liquidity", value: "Liquidity" },
    { key: "order", value: "Limit Order" },
  ];
  const [transactionActive, setTransactionActive] = useState("swap");
  //
  useEffect(() => {
    if (poolId) {
      getPoolsDetailById({ pool_id: poolId as any }).then((res) => {
        setPoolDetail(res);
      });

      if (currentwatchListId.length > 0) {
        setIsCollect(currentwatchListId.includes(poolId));
      }
    }
  }, [poolId, currentwatchListId]);

  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setTokenPriceList(res);
    });
    poolStore.setPoolActiveTab("dcl");
  }, []);

  useEffect(() => {
    if (poolDetail) {
      get_pool_detail();
    }
  }, [poolDetail]);

  const collectPool = () => {
    if (!accountId) window.modal.show();
    if (isCollect) {
      removePoolFromWatchList({ pool_id: poolId.toString() });
    } else {
      addPoolToWatchList({ pool_id: poolId.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  async function get_pool_detail() {
    const detail: PoolInfo | any = await get_pool(poolDetail.id);
    if (detail) {
      const { token_x, token_y } = detail;
      const metaData: Record<string, any> = await ftGetTokensMetadata([
        token_x,
        token_y,
      ]);
      detail.token_x_metadata = metaData[token_x];
      detail.token_y_metadata = metaData[token_y];
      setPoolDetailV3(detail);
    }
  }

  useEffect(() => {
    if (poolDetailV3?.token_x) {
      const {
        token_x,
        token_y,
        total_x,
        total_y,
        token_x_metadata,
        token_y_metadata,
        total_fee_x_charged,
        total_fee_y_charged,
      } = poolDetailV3;
      const pricex = tokenPriceList[token_x]?.price || 0;
      const pricey = tokenPriceList[token_y]?.price || 0;
      const totalX = new BigNumber(total_x)
        .minus(total_fee_x_charged)
        .toFixed();
      const totalY = new BigNumber(total_y)
        .minus(total_fee_y_charged)
        .toFixed();
      const amountx = toReadableNumber(token_x_metadata.decimals, totalX);
      const amounty = toReadableNumber(token_y_metadata.decimals, totalY);
      const tvlx = Number(amountx) * Number(pricex);
      const tvly = Number(amounty) * Number(pricey);
      const temp_list: any = [];
      const temp_tokenx = {
        meta: token_x_metadata,
        amount: amountx,
        tvl: tvlx,
      };
      const temp_tokeny = {
        meta: token_y_metadata,
        amount: amounty,
        tvl: tvly,
      };
      temp_list.push(temp_tokenx, temp_tokeny);
      setTokens(temp_list);
      console.log(temp_list, "temp");
    }
  }, [poolDetailV3]);

  // add liquidity

  const addLiquidity = () => {
    const pool_name = get_pool_name(poolDetail.id);
    router.push(`/liquidity/${pool_name}`);
  };

  async function get_matched_seeds() {
    const all_seeds = await get_all_seeds();
    const matched_seeds = get_matched_seeds_for_dcl_pool({
      seeds: all_seeds,
      pool_id: poolId.toString(),
    });
    const target = matched_seeds[0];
    if (target) {
      set_sole_seed(target);
      set_matched_seeds(matched_seeds);
    }
  }

  const [showSkection, setShowSkection] = useState(false);
  async function get_user_list_liquidities() {
    setShowSkection(true);
    let user_liquiditys_in_pool: UserLiquidityInfo[] = [];
    const liquidities = await list_liquidities();
    user_liquiditys_in_pool = liquidities.filter(
      (liquidity: UserLiquidityInfo) => {
        const { lpt_id }: any = liquidity;
        const pool_id = lpt_id.split("#")[0];
        if (pool_id == router.query.id) return true;
      }
    );
    const liquiditiesPromise = user_liquiditys_in_pool.map(
      (liquidity: UserLiquidityInfo) => {
        return get_liquidity((liquidity as any).lpt_id);
      }
    );
    const user_liqudities_final = await Promise.all(liquiditiesPromise);

    // get user seeds
    if (user_liqudities_final.length > 0) {
      const user_seeds_map = await list_farmer_seeds();
      const target_seed_ids = Object.keys(user_seeds_map).filter(
        (seed_id: string) => {
          const [contractId, mft_id] = seed_id.split("@");
          if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
            const [fixRange, pool_id, left_point, right_point] =
              mft_id.split("&");
            return pool_id == router.query.id;
          }
        }
      );
      if (target_seed_ids.length > 0) {
        const seedsPromise = target_seed_ids.map((seed_id: string) => {
          return get_seed(seed_id);
        });
        const target_seeds = await Promise.all(seedsPromise);
        target_seeds.forEach((seed: Seed) => {
          const { free_amount, locked_amount } = user_seeds_map[seed.seed_id];
          const user_seed_amount = new BigNumber(free_amount)
            .plus(locked_amount)
            .toFixed();
          allocation_rule_liquidities({
            list: user_liqudities_final,
            user_seed_amount,
            seed,
          });
        });
      }
    }
    set_user_liquidities(user_liqudities_final);
    setShowSkection(false);
  }

  useEffect(() => {
    get_matched_seeds();
  }, []);

  //
  useEffect(() => {
    if (!isSignedIn) return;
    get_user_list_liquidities();
  }, [isSignedIn]);

  return (
    <div className="w-full fccc h-full">
      {/* return */}
      <div className="w-270 cursor-pointer text-base text-gray-60 mb-3 mt-8 hover:text-white">
        <span onClick={() => router.push("/pools")}>{`<  Pools`}</span>
      </div>

      {/* title */}
      <div className="w-270 min-h-10 flex items-center">
        {poolDetail && updatedMapList?.length > 0 && (
          <>
            <TokenDetail {...poolDetail} updatedMapList={updatedMapList} />
            {/*  */}
            <span className=" text-2xl text-white font-bold ml-1 mr-2">
              {poolDetail?.token_symbols
                ?.map((item: any) => (item == "wNEAR" ? (item = "NEAR") : item))
                .join("-")}
            </span>
            <DCLIcon className="mr-2" />

            {/* farm tag */}
            {poolDetail.is_farm && (
              <div
                className={` bg-farmTagBg text-farmApyColor frcc text-xs italic w-13 h-5 rounded-xl mr-2`}
              >
                Farms
              </div>
            )}

            {/* watchlist */}
            <CollectStar
              iscollect={!accountId ? "false" : isCollect.toString()}
              className="cursor-pointer"
              onClick={() => collectPool()}
            />

            {/* fee */}
            <TokenFeeAndCureentPrice poolDetail={poolDetail} />
          </>
        )}
      </div>
      {/* main */}
      <div className="flex w-270 mt-2">
        {/* left */}

        <div className="w-183">
          {/* charts */}
          <div className="min-h-135">
            {poolDetail && updatedMapList?.length > 0 ? (
              <Charts poolDetail={poolDetail} tokenPriceList={tokenPriceList} />
            ) : (
              <NoContent tips="Chart is Loading..." h="h-90" />
            )}
          </div>

          {/* tvl & Overall locking */}
          <div className="-mt-20">
            {poolDetail && updatedMapList?.length > 0 && (
              <OverallLocking
                poolDetail={poolDetail}
                updatedMapList={updatedMapList}
              />
            )}
          </div>

          {/* Pool composition */}
          <div>
            <h3 className="mt-12 mb-4 text-lg text-gray-50 font-bold">
              Pool Composition
            </h3>
            {poolDetail && tokens.length > 0 && updatedMapList?.length > 0 ? (
              <PoolComposition
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                updatedMapList={updatedMapList}
                tokens={tokens}
              />
            ) : (
              <SkeletonTheme
                baseColor="rgba(106, 114, 121, 0.3)"
                highlightColor="#9eff00"
              >
                <Skeleton width={732} height={60} count={2} />
              </SkeletonTheme>
            )}
          </div>

          {/* Recent Transaction */}
          <div className="mb-8">
            <div className="mt-12 mb-4 flex justify-between">
              <span className="text-lg text-gray-50 font-bold">
                Recent Transaction
              </span>
              <div className="flex items-center mr-0.5">
                {TransactionTabList.map((item, index) => {
                  return (
                    <div
                      key={item.key + "_" + index}
                      onClick={() => setTransactionActive(item.key)}
                      className={`cursor-pointer border border-gray-40 frcc text-sm font-medium px-2 py-1 rounded hover:text-white ${
                        item.key == transactionActive
                          ? "text-white bg-gray-40"
                          : "text-gray-60 bg-transparent"
                      } ${index == 1 ? "mx-2" : ""}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>
            </div>
            {/*  */}
            {poolDetail && tokens.length > 0 && updatedMapList?.length > 0 && (
              <RecentTransaction
                activeTab={transactionActive}
                poolId={poolId}
                updatedMapList={updatedMapList}
                tokens={tokens.map((t: any) => t.meta)}
              />
            )}
          </div>
        </div>

        {/* right liquidity */}
        <div className="w-80 ml-auto pt-12">
          {user_liquidities.length == 0 ? (
            <NoLiquidity add={() => addLiquidity()} isLoading={showSkection} />
          ) : (
            poolDetailV3?.token_x && (
              <>
                <YourLiquidityBox
                  poolDetail={poolDetailV3}
                  tokenPriceList={tokenPriceList}
                  liquidities={user_liquidities}
                  matched_seeds={matched_seeds}
                />
                <UnclaimedFeesBox
                  poolDetail={poolDetailV3}
                  tokenPriceList={tokenPriceList}
                  liquidities={user_liquidities}
                />
                {!isMobile() ? (
                  <RelatedFarmsBox
                    poolDetail={poolDetailV3}
                    tokenPriceList={tokenPriceList}
                    sole_seed={sole_seed}
                  ></RelatedFarmsBox>
                ) : null}
              </>
            )
          )}
        </div>
      </div>

      {/* dcl add liquidity */}
      {/* <AddYourLiquidityPageV3></AddYourLiquidityPageV3> */}
    </div>
  );
}
