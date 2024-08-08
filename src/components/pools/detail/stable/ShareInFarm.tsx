import React, { useState } from "react";
import { percent, toPrecision } from "@/utils/numbers";
import { FormattedMessage, useIntl } from "react-intl";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";
import { StableFarmIcon } from "../../icon";
import { FiArrowUpRight } from "react-icons/fi";
import { ArrowRightUpIcon } from "@/components/yours/components/icon";

export const ShareInFarm = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
  inStr,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
  inStr?: string;
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
      className={`items-start inline-flex text-xs rounded-full py-0.5 cursor-pointer mb-1.5`}
      onMouseEnter={() => setHovet(true)}
      onMouseLeave={() => setHovet(false)}
    >
      {/* <FarmDot inFarm={Number(farmShare) > 0} className="mr-1 flex-shrink-0" /> */}
      <div
        className={`self-start whitespace-nowrap w-full flex items-center ${
          forStable ? `${hover ? "text-white" : "text-gray-10"}` : ""
        }`}
      >
        <span className={`text-left`}>
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? "< 0.1"
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{" "}
        </span>
        &nbsp;
        <span className="underline mr-1">
          {inStr ? (
            inStr
          ) : (
            <FormattedMessage id="in_farm" defaultMessage="in Farm" />
          )}
        </span>
        <ArrowRightUpIcon></ArrowRightUpIcon>
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
    <div className="frcc ml-10">
      {/* <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" /> */}
      <StableFarmIcon />
      <div className="self-start whitespace-nowrap flex items-center">
        <span className="text-white ml-1 mr-2">
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? "< 0.1"
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}
        </span>
        <span>In</span>
        <div
          onClick={() => toFarm()}
          className="underline cursor-pointer ml-1 hover:text-white"
        >
          <span className="text-gradientFrom mr-1">
            {version && <span className="mr-1">{version} Farms</span>}
          </span>
        </div>
        <FiArrowUpRight className="hover:text-green-10" />
      </div>
    </div>
  );
};
