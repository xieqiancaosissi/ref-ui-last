import React, { useEffect, useState } from "react";
import { percent, toPrecision } from "@/utils/numbers";
import { FormattedMessage, useIntl } from "react-intl";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { StableFarmIcon } from "../../icon";
import { FiArrowUpRight } from "react-icons/fi";
import { ArrowRightUpIcon } from "@/components/yours/components/icon";
import { toReadableNumber } from "@/utils/numbers";
import { get_shadow_records } from "@/services/farm";
import { useShadowRecord } from "@/hooks/useStableShares";
import { scientificNotationToString } from "@/utils/numbers";
import { useNewPoolData } from "@/hooks/useStableShares";

export const ShareInBurrow = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
  inStr,
  from,
  onlyShowStake,
  poolId,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  inStr?: string;
  from?: string;
  onlyShowStake?: boolean;
  poolId?: string | number;
}) => {
  const farmShare = Number(farmStake).toLocaleString("fullwide", {
    useGrouping: false,
  });
  const { shadowRecords } = useShadowRecord(poolId);
  const shadowRecordsKey = "shadow_in_burrow";
  const inBurrowAmount =
    shadowRecords?.[Number(poolId)]?.[shadowRecordsKey] || 0;

  const [hover, setHovet] = useState<boolean>(false);
  const farmSharePercent = userTotalShare.isGreaterThan(0)
    ? percent(
        farmShare,
        userTotalShare
          .toNumber()
          .toLocaleString("fullwide", { useGrouping: false })
      ).toString()
    : "0";

  return (
    <div
      className={`items-start inline-flex xsm:text-xs lg:text-xs rounded-full py-0.5 cursor-pointer ${
        from == "stable" ? "xsm:ml-1.5 lg:ml-2" : "mb-1.5"
      }`}
      onMouseEnter={() => setHovet(true)}
      onMouseLeave={() => setHovet(false)}
    >
      {/* <FarmDot inFarm={Number(farmShare) > 0} className="mr-1 flex-shrink-0" /> */}
      <div className={`self-start whitespace-nowrap w-full flex items-center`}>
        <span className={`text-left`}>
          {onlyShowStake
            ? toPrecision(
                toReadableNumber(
                  24,
                  scientificNotationToString(inBurrowAmount.toString())
                ),
                2
              )
            : `${
                Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
                  ? "< 0.1"
                  : toPrecision(farmSharePercent, 2, false, false)
              }% `}
        </span>
        &nbsp;
        <span className="underline mr-1 text-gray-10  frcc">
          {inStr ? (
            inStr
          ) : (
            <FormattedMessage id="in_farm" defaultMessage="in Farm" />
          )}
          <FiArrowUpRight />
        </span>
        {/* <ArrowRightUpIcon></ArrowRightUpIcon> */}
        {version && <span className={`ml-1 w-4`}>{version}</span>}
        {hover && forStable && (
          <span className="ml-0.5">{/* <HiOutlineExternalLink /> */}</span>
        )}
      </div>
    </div>
  );
};

export const ShareInFarm = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
  inStr,
  from,
  onlyShowStake,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  inStr?: string;
  from?: string;
  onlyShowStake?: boolean;
}) => {
  const farmShare = Number(farmStake).toLocaleString("fullwide", {
    useGrouping: false,
  });

  const [hover, setHovet] = useState<boolean>(false);
  const farmSharePercent = userTotalShare.isGreaterThan(0)
    ? percent(
        farmShare,
        userTotalShare
          .toNumber()
          .toLocaleString("fullwide", { useGrouping: false })
      ).toString()
    : "0";

  const hundredPercent = Number(farmSharePercent) === 100;
  const zeroPercent = Number(farmSharePercent) === 0;

  return (
    <div
      className={`items-start inline-flex xsm:text-xs lg:text-xs rounded-full py-0.5 cursor-pointer ${
        from == "stable" ? "xsm:ml-1.5 lg:ml-2" : "mb-1.5"
      }`}
      onMouseEnter={() => setHovet(true)}
      onMouseLeave={() => setHovet(false)}
    >
      {/* <FarmDot inFarm={Number(farmShare) > 0} className="mr-1 flex-shrink-0" /> */}
      <div className={`self-start whitespace-nowrap w-full flex items-center`}>
        <span className={`text-left`}>
          {onlyShowStake
            ? Number(
                toReadableNumber(
                  24,
                  new BigNumber(farmStake).multipliedBy(7).toFixed()
                )
              ).toFixed(2)
            : `${
                Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
                  ? "< 0.1"
                  : toPrecision(farmSharePercent, 2, false, false)
              }% `}
        </span>
        &nbsp;
        <span className="underline mr-1 text-gray-10  frcc">
          {inStr ? (
            inStr
          ) : (
            <FormattedMessage id="in_farm" defaultMessage="in Farm" />
          )}
          <FiArrowUpRight />
        </span>
        {/* <ArrowRightUpIcon></ArrowRightUpIcon> */}
        {version && <span className={`ml-1 w-4`}>{version}</span>}
        {hover && forStable && (
          <span className="ml-0.5">{/* <HiOutlineExternalLink /> */}</span>
        )}
      </div>
    </div>
  );
};

export const ShareInFarmV2 = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
  poolId,
  onlyEndedFarm,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  poolId?: number;
  onlyEndedFarm?: boolean;
}) => {
  const router = useRouter();

  const farmShare = Number(farmStake).toLocaleString("fullwide", {
    useGrouping: false,
  });

  const farmSharePercent = userTotalShare.isGreaterThan(0)
    ? percent(
        farmShare,
        userTotalShare
          .toNumber()
          .toLocaleString("fullwide", { useGrouping: false })
      ).toString()
    : "0";

  const toFarm = () => {
    const key = `/farms/${poolId}-${onlyEndedFarm ? "e" : "r"}`;
    router.push(key);
  };

  return (
    <div className="frcc mx-5 text-xs">
      {/* <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" /> */}
      <StableFarmIcon />
      <div className="self-start whitespace-nowrap flex items-center text-gray-60 ">
        <span className="text-white ml-1 mr-2">
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? "< 0.1"
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}
        </span>
        <div
          onClick={() => toFarm()}
          className="underline cursor-pointer ml-0.5 frcc"
        >
          <span className="text-gradientFrom">
            {version && <span>In {version} Farms</span>}
          </span>
          <FiArrowUpRight />
        </div>
      </div>
    </div>
  );
};

export const PoolAvailableAmount = ({
  pool,
  shares,
  className = "",
}: {
  pool: any;
  shares: any;
  className: any;
}) => {
  const { newPool } = useNewPoolData({ pool, shares });
  useEffect(() => {
    console.log(newPool?.availableShare, "1");
  }, [newPool]);
  return (
    <span className={className} title={newPool?.availableShareNonDivisible}>
      {toPrecision(newPool?.availableShare, 3)}
    </span>
  );
};
