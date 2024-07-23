import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import styles from "./style.module.css";
import TokenDetail from "@/components/pools/detail/classic/tokenDetail";
import { CollectStar } from "@/components/pools/icon";
import TokenFeeAndCureentPrice from "@/components/pools/detail/classic/tokenFeeAndCureentPrice";
import { getAllTokenPrices } from "@/services/farm";
import TvlAndVolumeCharts from "@/components/pools/detail/classic/TvlAndVolumeCharts";
import OverallLocking from "@/components/pools/detail/classic/overallLocking";
import PoolComposition from "@/components/pools/detail/classic/PoolComposition";
import RecentTransaction from "@/components/pools/detail/classic/RecentTransaction";
import {
  addPoolToWatchList,
  removePoolFromWatchList,
  getPoolsDetailById,
} from "@/services/pool";
import NoLiquidity from "@/components/pools/detail/liquidity/NoLiquidity";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";
import { useWatchList } from "@/hooks/useWatchlist";
import { usePoolStore } from "@/stores/pool";
import BigNumber from "bignumber.js";
import { useFarmStake } from "@/hooks/useStableShares";
import { toRealSymbol } from "@/services/farm";
import { Icon } from "@/components/pools/detail/liquidity/IconCom";
import { useAccountStore } from "@/stores/account";
import { Pool } from "@/interfaces/swap";
import { TokenMetadata } from "@/services/ft-contract";
import {
  calculateFairShare,
  toInternationalCurrencySystem,
  divide,
  multiply,
  toRoundedReadableNumber,
  toReadableNumber,
  toPrecision,
} from "@/utils/numbers";
import { getVEPoolId, useAccountInfo } from "@/services/referendum";
import getConfig from "@/utils/config";
import MyShares from "@/components/pools/detail/liquidity/classic/Myshare";
import {
  useSeedFarms,
  useSeedDetail,
  usePool,
  useTokenMetadata,
} from "@/hooks/usePools";
import { getEffectiveFarmList, openUrl } from "@/services/commonV3";
import { FarmBoost } from "@/services/farm";
import {
  Fire,
  FarmBoardInDetailPool,
} from "@/components/pools/detail/liquidity/icon";
import { Images } from "@/components/pools/detail/liquidity/components/liquidityComComp";
import ClassicAdd from "@/components/pools/detail/liquidity/classic/ClassicAdd";
import ClassicRemove from "@/components/pools/detail/liquidity/classic/ClassicRemove";
import { useRiskTokens } from "@/hooks/useRiskTokens";

export default function ClassicPoolDetail() {
  const router = useRouter();
  const { pureIdList } = useRiskTokens();
  const poolId = router.query.id || "";
  const poolStore = usePoolStore();
  const accountStore = useAccountStore();
  const { currentwatchListId, accountId } = useWatchList();
  const [poolDetail, setPoolDetail] = useState<any>(null);
  const [isCollect, setIsCollect] = useState(false);
  const [tokenPriceList, setTokenPriceList] = useState<any>(null);
  const { updatedMapList } = useTokenMetadata([poolDetail]);
  const TransactionTabList = [
    { key: "swap", value: "Swap" },
    { key: "liquidity", value: "Liquidity" },
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
    poolStore.setPoolActiveTab("classic");
  }, []);

  const collectPool = () => {
    if (!accountId) window.modal.show();
    if (isCollect) {
      removePoolFromWatchList({ pool_id: poolId.toString() });
    } else {
      addPoolToWatchList({ pool_id: poolId.toString() });
    }
    setIsCollect((previos) => !previos);
  };

  // liquidity

  const addLiquidity = () => {
    // const pool_name = get_pool_name(poolDetail.id);
    // router.push(`/liquidity/${pool_name}`);
  };

  const [showFunding, setShowFunding] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const {
    pool,
    shares,
    finalStakeList: stakeList,
  } = usePool(poolId.toString());

  const farmStakeTotal = useFarmStake({ poolId: Number(poolId), stakeList });

  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString("fullwide", { useGrouping: false });

  const haveShare = Number(userTotalShareToString) > 0;

  const tokenAmountShareRaw = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    return toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });
  };

  const tokenAmountShare = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    const value = toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });

    return Number(value) == 0
      ? "0"
      : Number(value) < 0.001 && Number(value) > 0
      ? "< 0.001"
      : toInternationalCurrencySystem(value, 3);
  };

  const tokenInfoPC = ({ token }: { token: TokenMetadata }) => {
    return tokenAmountShare(
      pool,
      token,
      new BigNumber(userTotalShareToString)
        .plus(Number(getVEPoolId()) === Number(pool.id) ? lptAmount : "0")
        .toNumber()
        .toFixed()
    );
  };

  const { lptAmount, fetchDoneVOTEAccountInfo } =
    !!getConfig().REF_VE_CONTRACT_ID && +poolId === Number(getVEPoolId())
      ? // eslint-disable-next-line react-hooks/rules-of-hooks
        useAccountInfo()
      : { lptAmount: "0", fetchDoneVOTEAccountInfo: true };

  const usdValue = useMemo(() => {
    try {
      if (!userTotalShareToString || !pool) return "-";

      const rawRes = multiply(
        new BigNumber(userTotalShareToString)
          .plus(
            Number(getVEPoolId()) === Number(pool.id) ? lptAmount || "0" : "0"
          )
          .toNumber()
          .toFixed(),
        divide(poolDetail?.tvl?.toString(), pool?.shareSupply)
      );

      return `$${
        Number(rawRes) == 0 ? "0" : toInternationalCurrencySystem(rawRes, 2)
      }`;
    } catch (error) {
      return "-";
    }
  }, [poolDetail?.tvl, userTotalShareToString, pool]);

  // farm
  const seedFarms = useSeedFarms(poolId.toString());
  const seedDetail = useSeedDetail(poolId.toString());

  function totalTvlPerWeekDisplay() {
    const farms = seedFarms;
    const rewardTokenIconMap: any = {};
    let totalPrice = 0;
    const effectiveFarms = getEffectiveFarmList(farms);
    effectiveFarms.forEach((farm: FarmBoost) => {
      const { id, decimals, icon }: any = farm.token_meta_data;
      const { daily_reward } = farm.terms;
      rewardTokenIconMap[id] = icon;
      const tokenPrice = tokenPriceList?.[id]?.price;
      if (tokenPrice && tokenPrice != "N/A") {
        const tokenAmount = toReadableNumber(decimals, daily_reward);
        totalPrice += +new BigNumber(tokenAmount)
          .multipliedBy(tokenPrice)
          .toFixed();
      }
    });
    totalPrice = +new BigNumber(totalPrice).multipliedBy(7).toFixed();
    const totalPriceDisplay =
      totalPrice == 0
        ? "-"
        : "$" + toInternationalCurrencySystem(totalPrice.toString(), 2);
    return totalPriceDisplay;
  }
  const [getBaseApr, setBaseApr] = useState({
    displayApr: "",
    rawApr: 0,
  });
  function BaseApr() {
    if (pool?.shareSupply) {
      const farms = seedFarms;

      let totalReward = 0;
      const effectiveFarms = getEffectiveFarmList(farms);
      effectiveFarms.forEach((farm: any) => {
        const reward_token_price = Number(
          tokenPriceList?.[farm.token_meta_data.id]?.price || 0
        );

        totalReward =
          totalReward + Number(farm.yearReward) * reward_token_price;
      });

      const poolShares = Number(toReadableNumber(24, pool.shareSupply));

      const seedTvl =
        !poolShares || !seedDetail
          ? 0
          : (Number(
              toReadableNumber(
                seedDetail.seed_decimal,
                seedDetail.total_seed_power
              )
            ) *
              (poolDetail?.tvl || 0)) /
            poolShares;

      const baseAprAll = !seedTvl ? 0 : totalReward / seedTvl;
      setBaseApr({
        displayApr:
          !seedDetail || !seedFarms
            ? "-"
            : `${toPrecision((baseAprAll * 100).toString(), 2)}%`,
        rawApr: !poolDetail?.tvl || !seedDetail || !seedFarms ? 0 : baseAprAll,
      });
    }
  }

  useEffect(() => {
    BaseApr();
  }, [seedDetail, seedFarms]);

  const [showAdd, setShowAdd] = useState(false);
  const hideAdd = () => {
    setShowAdd(false);
  };

  const [showRemove, setShowRemove] = useState(false);
  const hideRemove = () => {
    setShowRemove(false);
  };

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
            <TokenFeeAndCureentPrice
              poolDetail={poolDetail}
              tokenPriceList={tokenPriceList}
            />
          </>
        )}
      </div>
      {/* main */}
      <div className="flex w-270 mt-2">
        {/* left */}

        <div className="w-183">
          {/* charts */}
          <div className="min-h-135">
            {poolDetail ? (
              <TvlAndVolumeCharts poolId={poolId} />
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
            {poolDetail && updatedMapList?.length > 0 ? (
              <PoolComposition
                poolDetail={poolDetail}
                tokenPriceList={tokenPriceList}
                updatedMapList={updatedMapList}
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
          <div>
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
                      } ${index == 0 ? "mr-2" : ""}`}
                    >
                      {item.value}
                    </div>
                  );
                })}
              </div>
            </div>
            {/*  */}
            {poolDetail && updatedMapList?.length > 0 && (
              <RecentTransaction
                activeTab={transactionActive}
                poolId={poolId}
                updatedMapList={updatedMapList}
              />
            )}
          </div>
        </div>

        {/* right liquidity */}
        <div className="w-80 ml-auto">
          {(!haveShare || !poolId) && (
            <NoLiquidity add={() => addLiquidity()} isLoading={false} />
          )}
          {haveShare && pool?.id && updatedMapList?.length > 0 && (
            <div className="w-80 h-58 p-4 rounded bg-refPublicBoxDarkBg flex flex-col ">
              <div className="flex items-center justify-between text-white">
                <span className="whitespace-nowrap">Your Liquidity</span>

                <MyShares
                  shares={shares}
                  totalShares={pool.shareSupply}
                  poolId={pool.id}
                  stakeList={stakeList}
                  lptAmount={lptAmount}
                />
              </div>

              <div className="w-full text-right text-sm mb-7 ">
                {!accountStore.isSignedIn ? (
                  "-"
                ) : usdValue === "-" ? (
                  "-"
                ) : (
                  <div className="flex items-center relative top-1.5 justify-between">
                    <span className="whitespace-nowrap text-gray-50">
                      Estimate Value
                    </span>

                    <span className="text-gray-50 font-normal">{usdValue}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col text-center text-base">
                {updatedMapList[0]?.token_account_ids?.map(
                  (token: any, index: number) => (
                    <div
                      key={index + "classic" + token.symbol}
                      className="flex items-center justify-between mb-3"
                    >
                      <div className="flex items-center">
                        <Icon icon={token.icon} className="h-7 w-7 mr-2" />
                        <div className="flex items-start flex-col">
                          <div className="flex items-center text-gray-10 text-sm">
                            {toRealSymbol(token.symbol)}
                          </div>
                        </div>
                      </div>
                      <div
                        className="flex items-center text-gray-10 text-sm"
                        title={tokenAmountShareRaw(
                          pool,
                          token,
                          new BigNumber(userTotalShareToString)
                            .plus(
                              Number(getVEPoolId()) === Number(poolId)
                                ? lptAmount
                                : "0"
                            )
                            .toNumber()
                            .toFixed()
                        )}
                      >
                        {tokenInfoPC({ token })}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="flex items-center w-full mt-2">
                <div className={`pr-2 ${haveShare ? "w-1/2" : "w-full"} `}>
                  <div
                    className={`poolBtnStyleBase w-35 h-10  mr-2.5 text-sm cursor-pointer hover:opacity-90 `}
                    onClick={() => setShowAdd(true)}
                    // disabled={disable_add}
                  >
                    Add
                  </div>
                </div>
                {haveShare && (
                  <div className="pl-2 w-1/2">
                    <div
                      onClick={() => {
                        if (+userTotalShareToString == 0) return;
                        setShowRemove(true);
                      }}
                      // disabled={Number(userTotalShareToString) == 0}
                      className={`w-full ${
                        Number(userTotalShareToString) == 0
                          ? "border-gray-90 text-gray-60 cursor-not-allowed"
                          : "border-green-10 text-green-10 cursor-pointer "
                      }  border rounded-md frcc w-35 h-10 text-sm hover:opacity-80 `}
                    >
                      Remove
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* farm */}
          {seedFarms && pool?.id && updatedMapList.length > 0 && (
            <div className="flex flex-col mt-4 relative z-30 bg-refPublicBoxDarkBg rounded">
              <div className="flex items-center mx-4 xs:mx-7 md:mx-7 mt-4 lg:mt-5 justify-between">
                <div className="text-white whitespace-nowrap">Farm APR</div>

                <div
                  className="rounded-lg flex items-center px-2 py-0.5"
                  style={{
                    background: "#17252E",
                  }}
                >
                  <Images
                    className="mr-1"
                    tokens={seedFarms.map((farm: any) => farm.token_meta_data)}
                    size="4"
                    isRewardDisplay
                    borderStyle="1px solid #00C6A2"
                  />
                  <span className="text-xs text-gray-50">
                    {totalTvlPerWeekDisplay()}
                    /week
                  </span>
                </div>
              </div>

              <div className="flex items-center mx-4 xs:mx-7 md:mx-7 mt-3 min-h-18 justify-between">
                <div className="text-green-10 flex items-center text-lg">
                  <span className="mr-2">{getBaseApr.displayApr}</span>
                  <Fire />
                </div>

                <div
                  className="border border-green-10 rounded-md text-green-10 frcc w-35 h-10 text-sm cursor-pointer hover:opacity-80"
                  onClick={() => {
                    openUrl(`/farms/${poolId}-r`);
                  }}
                >
                  Farm Now!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* add */}
      {updatedMapList[0]?.token_account_ids && poolDetail && (
        <>
          <ClassicAdd
            isOpen={showAdd}
            onRequestClose={hideAdd}
            poolDetail={poolDetail}
            pureIdList={pureIdList}
            updatedMapList={updatedMapList}
          />

          <ClassicRemove
            isOpen={showRemove}
            onRequestClose={hideRemove}
            poolDetail={poolDetail}
            pureIdList={pureIdList}
            updatedMapList={updatedMapList}
          />
        </>
      )}
    </div>
  );
}
