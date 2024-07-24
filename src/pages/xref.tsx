import CustomTooltip from "@/components/customTooltip/customTooltip";
import {
  XrefArrow,
  XrefLogo,
  XrefSmallLogo,
  XrefTitle,
} from "@/components/xref/icon";
import {
  formatWithCommas,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import React, { useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { TokenMetadata } from "@/services/ft-contract";
import { useAccountStore } from "@/stores/account";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import getConfig from "@/utils/config";
import { XREF_TOKEN_DECIMALS, getPrice, metadata } from "@/services/xref";
import { InputView } from "@/components/xref/InputView";
import { QuestionMark } from "@/components/farm/icon";

const {
  XREF_TOKEN_ID,
  REF_TOKEN_ID,
  TOTAL_PLATFORM_FEE_REVENUE,
  CUMULATIVE_REF_BUYBACK,
} = getConfig();
const DECIMALS_XREF_REF_TRANSTER = 8;
export default function XrefPage(props: any) {
  const [tab, setTab] = useState(0);
  const [apr, setApr] = useState("");
  const [refBalance, setRefBalance] = useState<string | null>(null);
  const [xrefBalance, setXrefBalance] = useState<string | null>(null);
  const [refToken, setRefToken] = useState<TokenMetadata | null>(null);
  const [xrefMetaData, setXrefMetaData] = useState<XrefMetaData | null>(null);
  const [totalDataArray, setTotalDataArray] = useState<string[]>([]);
  const [rate, setRate] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { getIsSignedIn } = useAccountStore();
  const isSignedIn = getIsSignedIn();
  const displayBalance = (max: string | null) => {
    if (!isSignedIn) {
      return "-";
    }
    if (max === null || max === undefined) {
      return "0";
    }
    const formattedMax = new BigNumber(max);
    if (formattedMax.isEqualTo("0")) {
      return "0";
    } else {
      return toPrecision(max, 3, true);
    }
  };

  useEffect(() => {
    ftGetBalance(XREF_TOKEN_ID).then(async (data: any) => {
      const token = await ftGetTokenMetadata(XREF_TOKEN_ID);
      const { decimals } = token;
      const balance = toReadableNumber(decimals, data);
      setXrefBalance(balance);
    });
    metadata().then((data) => {
      const {
        locked_token_amount,
        reward_per_sec,
        cur_locked_token_amount,
        supply,
        account_number,
      } = data;
      setXrefMetaData(data);
      if (new BigNumber(locked_token_amount).isGreaterThan("0")) {
        const apr =
          (1 / locked_token_amount) *
          (Number(reward_per_sec) * 365 * 24 * 60 * 60 * 100);
        setApr(apr.toString());
      }
      ftGetBalance(REF_TOKEN_ID).then(async (data: any) => {
        const token = await ftGetTokenMetadata(REF_TOKEN_ID);
        setRefToken(token);
        const { decimals } = token;
        const balance = toReadableNumber(decimals, data);
        setRefBalance(balance);
      });
      const joinAmount = toPrecision(
        (account_number || "0").toString(),
        0,
        true
      );
      const totalFee = `${toPrecision(
        TOTAL_PLATFORM_FEE_REVENUE.toString(),
        2,
        true
      )}`;
      const refAmount = toPrecision(
        toReadableNumber(XREF_TOKEN_DECIMALS, cur_locked_token_amount || "0"),
        2,
        true
      );
      const xrefAmount = toPrecision(
        toReadableNumber(XREF_TOKEN_DECIMALS, supply || "0"),
        2,
        true
      );
      const totalBuyBack = `${toPrecision(
        CUMULATIVE_REF_BUYBACK.toString(),
        2,
        true
      )}`;
      const revenueBooster = "x1";
      setTotalDataArray([
        joinAmount,
        totalFee,
        refAmount,
        xrefAmount,
        totalBuyBack,
        revenueBooster,
      ]);
    });
    getPrice().then((data) => {
      const rate = toReadableNumber(DECIMALS_XREF_REF_TRANSTER, data);
      setRate(rate);
    });
  }, [isSignedIn]);
  function getXrefAprTip() {
    if (refToken && xrefMetaData) {
      const reward_per_sec = xrefMetaData.reward_per_sec;
      const week_rewards = new BigNumber(reward_per_sec)
        .multipliedBy(7 * 24 * 60 * 60)
        .toFixed(0);
      const amount = toReadableNumber(refToken.decimals, week_rewards);
      const displayAmount = formatWithCommas(toPrecision(amount, 2));
      const content = "Total REF/week";
      return `<div class="flex flex-col">
          <span class="text-xs text-gray-150">${content}</span>
          <div class="flex items-center justify-between mt-3">
            <image class="w-5 h-5 rounded-full mr-7" src="${refToken.icon}"/>
            <label class="text-xs text-gray-150">${displayAmount}</label>
          </div>
      </div>`;
    }
  }
  const displayApr = () => {
    if (!apr) {
      return "-";
    }
    const aprBig = new BigNumber(apr);
    if (aprBig.isEqualTo(0)) {
      return "0";
    } else if (aprBig.isLessThan(0.01)) {
      return "<0.01";
    } else {
      return aprBig.toFixed(2, 1);
    }
  };
  const displayTotalREF = () => {
    const bigAmount = new BigNumber(xrefBalance || "0");
    const rateValue = rate || "0";
    const receive = bigAmount.multipliedBy(new BigNumber(rateValue));
    if (!isSignedIn) {
      return "-";
    } else if (receive.isEqualTo(0)) {
      return 0;
    } else if (receive.isLessThan(0.001)) {
      return "<0.001";
    } else {
      return (
        <>
          <label className="font-sans mr-0.5">≈</label>
          {toPrecision(receive.valueOf(), 3, true)}
        </>
      );
    }
  };
  function getYourRewardsTip() {
    if (refToken && xrefMetaData) {
      const { locked_token_amount, reward_per_sec } = xrefMetaData;
      const bigAmount = new BigNumber(xrefBalance || "0");
      const rateValue = rate || "0";
      const userReceiveRef = bigAmount.multipliedBy(rateValue);
      const totalRef = toReadableNumber(refToken.decimals, locked_token_amount);
      const percent = new BigNumber(userReceiveRef).dividedBy(totalRef);
      const week_rewards = new BigNumber(reward_per_sec)
        .multipliedBy(7 * 24 * 60 * 60)
        .toFixed();
      const week_rewards_amount = toReadableNumber(
        refToken.decimals,
        week_rewards
      );
      const user_get_rewards_per_week =
        percent.multipliedBy(week_rewards_amount);
      let displayAmount = "";
      if (user_get_rewards_per_week.isEqualTo(0)) {
        displayAmount = "0";
      } else if (user_get_rewards_per_week.isLessThan("0.001")) {
        displayAmount = "<0.001";
      } else {
        displayAmount = formatWithCommas(user_get_rewards_per_week.toFixed(2));
      }
      const content = "REF/week you will get";
      return `<div class="flex flex-col">
          <span class="text-xs text-gray-150">${content}</span>
          <div class="flex items-center justify-between mt-3">
            <image class="w-5 h-5 rounded-full mr-7" src="${refToken.icon}"/>
            <label class="text-xs text-gray-150">${displayAmount}</label>
          </div>
      </div>`;
    }
  }
  const switchTab = (tab: number) => {
    setTab(tab);
  };
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };
  const analysisText: any = {
    first: {
      title: "Number of Unique Stakers",
    },
    second: {
      title: "Revenue Shared with xREF Holders",
      tipContent:
        "This number corresponds to the cumulative shared trading fee revenue to xREF holders. It is equal to 75% of the total platform fee revenue. It will differ from the actual REF token buyback amount due to price fluctuations.",
      unit: "REF",
    },
    third: {
      title: "Total REF Staked",
      unit: "REF",
    },
    fourth: {
      title: "Total xREF Minted",
      unit: "xREF",
    },
    fifth: {
      title: "Cumulative REF Buyback",
      unit: "REF",
    },
    sixth: {
      title: "Yearly Revenue Booster",
    },
  };
  return (
    <div style={pageStyle} className="text-white">
      <div className="w-4/12 m-auto flex flex-col items-center">
        <XrefLogo className="mb-4" />
        <XrefTitle className="mb-3.5" />
        <p className="text-sm text-gray-190 text-center mb-10">
          By staking REF, you have the opportunity to earn fees generated by the
          protocol. Any REF holders can have a share in the revenue earned by
          Ref Finance. 
        </p>
        <div className="frcc w-full mb-2.5">
          <div className="flex-1 mr-2.5 bg-dark-120 bg-opacity-40 rounded-lg py-3.5 px-4">
            <p className="text-gray-50 text-sm mb-1.5">Staking APR</p>
            <div className="text-2xl">
              <div
                className="text-white text-left"
                data-class="reactTip"
                data-tooltip-id={"xrefAprId"}
                data-place="top"
                data-tooltip-html={getXrefAprTip()}
              >
                <span className="text-2xl text-white">
                  {displayApr() + "%"}
                </span>
                <CustomTooltip id={"xrefAprId"} />
              </div>
            </div>
          </div>
          <div className="flex-1 bg-dark-120 bg-opacity-40 rounded-lg py-3.5 px-4">
            <p className="text-sm mb-1.5 flex items-center">
              <XrefSmallLogo className="mr-1" />
              xREF <span className="text-gray-50 ml-1">Balance</span>
            </p>
            <div className="text-2xl frcb" title={xrefBalance || ""}>
              {displayBalance(xrefBalance!)}
              <div
                className="text-left text-sm text-gray-50"
                data-class="reactTip"
                data-tooltip-id={"youGetId"}
                data-place="top"
                data-tooltip-html={getYourRewardsTip()}
              >
                {displayTotalREF()}REF
                <CustomTooltip id={"youGetId"} />
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-lg bg-dark-120 bg-opacity-40 p-5 w-full">
          <div
            className="flex items-center h-12 rounded-md p-1 border"
            style={{ borderColor: "rgba(255, 255, 255, 0.16" }}
          >
            <label
              onClick={() => switchTab(0)}
              className={`rounded frcc text-base flex-grow h-full cursor-pointer mr-1 ${
                tab == 0 ? "bg-white bg-opacity-10" : "text-whiteOpacity"
              }`}
            >
              Stake
            </label>
            <label
              onClick={() => switchTab(1)}
              className={`rounded frcc text-base flex-grow h-full cursor-pointer ${
                tab == 1 ? "bg-white bg-opacity-10" : "text-whiteOpacity"
              }`}
            >
              Unstake
            </label>
          </div>
          {/* ref stake*/}
          <InputView
            tab={tab}
            max={refBalance}
            rate={rate}
            hidden={tab != 0 ? "hidden" : ""}
          ></InputView>
          {/* xref unstake */}
          <InputView
            tab={tab}
            max={xrefBalance}
            rate={rate}
            hidden={tab != 1 ? "hidden" : ""}
          ></InputView>
          <div className="mt-6 frcb text-sm text-gray-10 ">
            <p>Details</p>
            <XrefArrow
              className={`cursor-pointer hover:text-primaryGreen ${
                showDetails ? " transform rotate-180" : ""
              }`}
              onClick={toggleDetails}
            />
          </div>
          {showDetails ? (
            <div className="border border-gray-50 rounded px-3 py-4 mt-1.5 text-sm text-gray-50 mb-4">
              {Object.values(analysisText).map((value, index: number) => {
                const item = value as AnalysisTextItem;
                return (
                  <div className="frcb mb-2.5" key={index}>
                    <p>
                      {item.title}
                      {item.tipContent ? (
                        <>
                          <span
                            className="relative top-0.5 inline-block ml-1"
                            data-type="info"
                            data-place="right"
                            data-multiline={true}
                            data-class="reactTip"
                            data-tooltip-html={item.tipContent}
                            data-tooltip-id="yourRewardsId"
                          >
                            <QuestionMark />
                          </span>
                          <CustomTooltip
                            style={{ width: "25%" }}
                            id="yourRewardsId"
                          />
                        </>
                      ) : null}
                    </p>
                    <div className="frcc">
                      <p className="text-white">{totalDataArray[index]}</p>
                      <p className="ml-1.5">{item.unit}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  backgroundImage: `url('https://assets.ref.finance/images/XrefBg.png')`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  height: "100%",
  minHeight: "90vh",
  margin: "-50px 0 0 0",
  padding: "90px 0 24px 0",
  backgroundColor: "#000a0a",
};

export interface XrefMetaData {
  version: string;
  owner_id: string;
  locked_token: string;
  undistributed_reward: string;
  locked_token_amount: string;
  cur_undistributed_reward: string;
  cur_locked_token_amount: string;
  supply: string;
  prev_distribution_time_in_sec: number;
  reward_genesis_time_in_sec: number;
  reward_per_sec: string;
  account_number: number;
}

interface AnalysisTextItem {
  title: any;
  tipContent: any;
  unit: any;
}
