import { TokenMetadata } from "@/services/ft-contract";
import { useTokenBalances } from "@/services/token";
import { getAccountId } from "@/utils/wallet";
import { useContext, useEffect, useState } from "react";
import { OverviewContextType, OverviewData } from "../index";
import { NEARXIDS } from "@/services/swap/swapConfig";
import { WRAP_NEAR_CONTRACT_ID } from "@/services/wrap-near";
import BigNumber from "bignumber.js";
import Big from "big.js";
import {
  toInternationalCurrencySystem,
  toReadableNumber,
} from "@/utils/numbers";
import {
  auroraAddr,
  display_number_internationalCurrencySystemLongString,
  display_value,
  display_value_withCommas,
  useAuroraBalancesNearMapping,
  useDCLAccountBalance,
  useUserRegisteredTokensAllAndNearBalance,
} from "@/services/aurora";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { divide } from "mathjs";
import { WalletTokenList } from "./WalletTokenList";
import {
  AuroraIcon,
  AuroraIconActive,
  MyNearWalltIcon,
  WalletWithdraw,
} from "./icon";
import { CopyIcon } from "@/components/menu/icons";
import CopyToClipboard from "react-copy-to-clipboard";

export default function WalletPanel() {
  const {
    tokenPriceList,
    isSignedIn,
    accountId,
    is_mobile,
    set_wallet_assets_value_done,
    set_wallet_assets_value,
    setUserTokens,
  } = useContext(OverviewData) as OverviewContextType;
  const [tabList, setTabList] = useState([{ name: "NEAR", tag: "near" }]);
  const [activeTab, setActiveTab] = useState("near");
  const [near_tokens, set_near_tokens] = useState<TokenMetadata[]>([]);
  const [ref_tokens, set_ref_tokens] = useState<TokenMetadata[]>([]);
  const [dcl_tokens, set_dcl_tokens] = useState<TokenMetadata[]>([]);
  const [aurora_tokens, set_aurora_tokens] = useState<TokenMetadata[]>([]);
  const [ref_total_value, set_ref_total_value] = useState<string>("0");
  const [near_total_value, set_near_total_value] = useState<string>("0");
  const [dcl_total_value, set_dcl_total_value] = useState<string>("0");
  const [aurora_total_value, set_aurora_total_value] = useState<string>("0");
  const auroraAddress = auroraAddr(getAccountId() || "");
  const userTokens = useUserRegisteredTokensAllAndNearBalance();
  const balances = useTokenBalances(); // inner account balance
  const auroaBalances = useAuroraBalancesNearMapping(auroraAddress);
  const displayAuroraAddress = `${auroraAddress?.substring(
    0,
    6
  )}...${auroraAddress?.substring(
    auroraAddress.length - 6,
    auroraAddress.length
  )}`;
  const DCLAccountBalance = useDCLAccountBalance(!!accountId);
  const is_tokens_loading =
    !userTokens || !balances || !auroaBalances || !DCLAccountBalance;
  useEffect(() => {
    if (!is_tokens_loading) {
      userTokens.forEach((token: TokenMetadata) => {
        const { decimals, id, nearNonVisible } = token;
        token.ref =
          id === NEARXIDS[0]
            ? "0"
            : toReadableNumber(decimals, balances[id] || "0");
        token.near = toReadableNumber(
          decimals,
          (nearNonVisible || "0").toString()
        );
        token.dcl = toReadableNumber(decimals, DCLAccountBalance[id] || "0");
        token.aurora = toReadableNumber(
          decimals,
          auroaBalances[id] || "0"
        ).toString();
      });
    }
  }, [tokenPriceList, userTokens, is_tokens_loading]);
  useEffect(() => {
    if (!is_tokens_loading) {
      const ref_tokens_temp: TokenMetadata[] = [];
      const near_tokens_temp: TokenMetadata[] = [];
      const dcl_tokens_temp: TokenMetadata[] = [];
      const aurora_tokens_temp: TokenMetadata[] = [];
      userTokens.forEach((token: TokenMetadata) => {
        const { ref, near, aurora, dcl, id } = token;
        if (id === NEARXIDS[0]) return;
        if (ref && +ref > 0) {
          ref_tokens_temp.push(token);
        }
        if (near && +near > 0) {
          near_tokens_temp.push(token);
        }
        if (dcl && +dcl > 0) {
          dcl_tokens_temp.push(token);
        }
        if (aurora && +aurora > 0) {
          aurora_tokens_temp.push(token);
        }
      });
      const { tokens: tokens_near, total_value: total_value_near } =
        token_data_process(near_tokens_temp, "near");
      const { tokens: tokens_ref, total_value: total_value_ref } =
        token_data_process(ref_tokens_temp, "ref");
      const { tokens: tokens_dcl, total_value: total_value_dcl } =
        token_data_process(dcl_tokens_temp, "dcl");
      const { tokens: tokens_aurora, total_value: total_value_aurora } =
        token_data_process(aurora_tokens_temp, "aurora");
      const refValue = parseFloat(total_value_ref);
      const dclValue = parseFloat(total_value_dcl);
      const combinedValue = refValue + dclValue;
      set_ref_tokens(tokens_ref);
      set_near_tokens(tokens_near);
      set_dcl_tokens(tokens_dcl);
      set_aurora_tokens(tokens_aurora);
      set_ref_total_value(combinedValue.toString());
      set_near_total_value(total_value_near);
      set_dcl_total_value(total_value_dcl);
      set_aurora_total_value(total_value_aurora);
      set_wallet_assets_value(
        Big(total_value_ref || 0)
          .plus(total_value_near || 0)
          .plus(total_value_dcl || 0)
          .plus(total_value_aurora || 0)
          .toFixed()
      );
      set_wallet_assets_value_done(true);
      const tab_list = [{ name: "NEAR", tag: "near" }];
      if (tokens_ref?.length > 0) {
        tab_list.push({
          name: "REF",
          tag: "ref",
        });
      }
      // if (tokens_dcl?.length > 0) {
      //   tab_list.push({ name: "DCL", tag: "dcl" });
      // }
      setTabList(JSON.parse(JSON.stringify(tab_list)));
    }
  }, [tokenPriceList, userTokens, is_tokens_loading]);
  useEffect(() => {
    if (userTokens) {
      setUserTokens(userTokens);
    }
  }, [userTokens]);
  function token_data_process(
    target_tokens: TokenMetadata[],
    accountType: keyof TokenMetadata
  ) {
    const tokens = JSON.parse(JSON.stringify(target_tokens || []));
    tokens.forEach((token: TokenMetadata) => {
      const token_num = token[accountType] || "0";
      const token_price =
        tokenPriceList[token.id == "NEAR" ? WRAP_NEAR_CONTRACT_ID : token.id]
          ?.price || "0";
      const token_value = new BigNumber(token_num as string).multipliedBy(
        token_price
      );
      token.t_value = token_value.toFixed();
    });
    tokens.sort((tokenB: TokenMetadata, tokenA: TokenMetadata) => {
      const a_value = new BigNumber(tokenA.t_value || "0");
      const b_value = new BigNumber(tokenB.t_value || "0");
      return a_value.minus(b_value).toNumber();
    });
    const total_value = tokens.reduce((acc: string, cur: TokenMetadata) => {
      return new BigNumber(acc).plus(cur.t_value || "0").toFixed();
    }, "0");

    return { tokens, total_value };
  }
  function showTokenPrice(token: TokenMetadata) {
    const token_price =
      tokenPriceList[token.id == "NEAR" ? WRAP_NEAR_CONTRACT_ID : token.id]
        ?.price || "0";
    return display_value(token_price);
  }
  function showTotalValue() {
    let target = "0";
    if (activeTab == "near") {
      target = near_total_value;
    } else if (activeTab == "ref") {
      target = ref_total_value;
    } else if (activeTab == "dcl") {
      target = dcl_total_value;
    } else if (activeTab == "aurora") {
      target = aurora_total_value;
    }
    return display_value_withCommas(target);
  }
  return (
    <>
      <div className="mb-2.5 flex items-center">
        {tabList.map((item: any, index: number) => {
          return (
            <span
              key={item.tag}
              onClick={() => {
                setActiveTab(item.tag);
              }}
              className={`frcc border border-gray-100 rounded-md h-7 p-1.5 mr-2.5 text-xs cursor-pointer hover:bg-portfolioLightGreyColor xsm:h-9 ${
                index != tabList.length - 1 ? "mr-0.5" : ""
              } ${
                activeTab == item.tag
                  ? "bg-gray-100 text-white"
                  : "text-gray-60"
              }`}
            >
              {item.tag == "near" && <MyNearWalltIcon className="mr-1" />}
              {item.tag == "ref" ? "REF(Inner)" : item.name}
            </span>
          );
        })}
        {aurora_tokens?.length > 0 ? (
          activeTab == "aurora" ? (
            <AuroraIconActive className="cursor-pointer"></AuroraIconActive>
          ) : (
            <AuroraIcon
              onClick={() => {
                setActiveTab("aurora");
              }}
              className="text-primaryText hover:text-portfolioLightGreenColor cursor-pointer"
            ></AuroraIcon>
          )
        ) : null}
        <div
          className={`flex flex-col ml-2.5 xsm:hidden ${
            activeTab == "aurora" ? "" : "hidden"
          }`}
        >
          <p className="text-xs text-gray-60"> Mapping Account</p>
          <p className="text-xs text-white frcc">
            {displayAuroraAddress}
            <CopyToClipboard text={auroraAddress}>
              <CopyIcon className="text-gray-60 hover:text-white cursor-pointer ml-1.5"></CopyIcon>
            </CopyToClipboard>
          </p>
        </div>
      </div>
      <div
        className={`flex mb-4 lg:hidden ${
          activeTab == "aurora" ? "" : "hidden"
        }`}
      >
        <p className="text-xs text-gray-60 mr-1"> Mapping Account:</p>
        <p className="text-xs text-white flex">
          {displayAuroraAddress}
          <CopyToClipboard text={auroraAddress}>
            <CopyIcon className="text-gray-60 hover:text-white cursor-pointer ml-1.5"></CopyIcon>
          </CopyToClipboard>
        </p>
      </div>
      <div className="bg-gray-20 bg-opacity-40 p-4 rounded">
        <div className="flex items-center text-gray-50 text-xs w-full mb-5">
          <div className="w-3/6">Token</div>
          <div className="w-2/6">Balance</div>
          <div className="w-1/5 flex items-center justify-end">Value</div>
        </div>
        <div style={{ height: "34vh", overflow: "auto" }} className="pr-2.5">
          {(!userTokens || !balances || !auroaBalances || !DCLAccountBalance) &&
          isSignedIn ? (
            <div className="flex justify-between">
              <SkeletonTheme
                baseColor="rgba(33, 43, 53, 0.3)"
                highlightColor="#2A3643"
              >
                <Skeleton width={320} height={52} count={4} className="mt-4" />
              </SkeletonTheme>
            </div>
          ) : (
            <>
              <div className={`${activeTab == "near" ? "" : "hidden"}`}>
                {near_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "near"}
                      token={token}
                      tokenBalance={token?.near ?? 0}
                      showTokenPrice={showTokenPrice}
                    />
                  );
                })}
              </div>
              <div className={`${activeTab == "ref" ? "" : "hidden"}`}>
                {ref_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "ref"}
                      token={token}
                      tokenBalance={token?.ref ?? 0}
                      showTokenPrice={showTokenPrice}
                      showWithdraw={true}
                    />
                  );
                })}
                {dcl_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "dcl"}
                      token={token}
                      tokenBalance={token?.dcl ?? 0}
                      showTokenPrice={showTokenPrice}
                      showWithdraw={true}
                    />
                  );
                })}
              </div>
              {/* <div className={`${activeTab == "dcl" ? "" : "hidden"}`}>
                {dcl_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "dcl"}
                      token={token}
                      tokenBalance={token?.dcl ?? 0}
                      showTokenPrice={showTokenPrice}
                      showWithdraw={true}
                    />
                  );
                })}
              </div> */}
              <div className={`${activeTab == "aurora" ? "" : "hidden"}`}>
                {aurora_tokens.map((token: TokenMetadata) => {
                  return (
                    <WalletTokenList
                      key={token.id + "aurora"}
                      token={token}
                      tokenBalance={token?.aurora ?? 0}
                      showTokenPrice={showTokenPrice}
                      showWithdraw={true}
                      isAurora={true}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="frcb mt-6 px-4">
        <p className="text-gray-50 text-sm">Total</p>
        <p className="text-base xsm:text-primaryGreen">{showTotalValue()}</p>
      </div>
    </>
  );
}
