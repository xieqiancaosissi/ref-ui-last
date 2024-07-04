import React, { useState } from "react";
import {
  percent,
  percentLess,
  percentOf,
  subtraction,
  toInternationalCurrencySystem,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from "@/utils/numbers";
import { FormattedMessage, useIntl } from "react-intl";
import BigNumber from "bignumber.js";
import { Link } from "react-router-dom";
import { isMobile } from "@/utils/device";
import { useRouter } from "next/router";
import { StableFarmIcon } from "../../icon";
import { FiArrowUpRight } from "react-icons/fi";

export const ShareInFarm = ({
  farmStake,
  userTotalShare,
  forStable,
  version,
}: {
  farmStake: string | number;
  userTotalShare: BigNumber;
  forStable?: boolean;
  version?: string;
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
      className={`items-center inline-flex text-xs  rounded-full py-0.5 border  ${
        hover
          ? "border-gradientFrom text-gradientFrom"
          : "border-transparent text-gradientFrom"
      }  px-2 cursor-pointer`}
      onMouseEnter={() => setHovet(true)}
      onMouseLeave={() => setHovet(false)}
    >
      {/* <FarmDot inFarm={Number(farmShare) > 0} className="mr-1 flex-shrink-0" /> */}
      <div
        className={`self-start whitespace-nowrap w-full flex items-center ${
          forStable ? `${hover ? "text-white" : "text-primaryText"}` : ""
        }`}
      >
        <span
          className={`${
            hundredPercent ? "w-9" : zeroPercent ? "w-6" : "w-11"
          } text-center`}
        >
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? "< 0.1"
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{" "}
        </span>
        <span>
          &nbsp;
          <FormattedMessage id="in_farm" defaultMessage="in Farm" />
        </span>

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

      {/* <StableFarmIcon />
          <span className="text-white ml-1 mr-2">0.8%</span>
          <span>In</span>
          <span className=" underline cursor-pointer mx-1 hover:text-white">
            Classic Farms
          </span>
          <FiArrowUpRight className="hover:text-green-10" /> */}

      <StableFarmIcon />
      <div className="self-start whitespace-nowrap flex items-center">
        <span className="text-white ml-1 mr-2">
          {" "}
          {`${
            Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
              ? "< 0.1"
              : toPrecision(farmSharePercent, 2, false, false)
          }% `}{" "}
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
