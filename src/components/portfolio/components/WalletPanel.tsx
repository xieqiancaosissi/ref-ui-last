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
      set_ref_tokens(tokens_ref);
      set_near_tokens(tokens_near);
      set_dcl_tokens(tokens_dcl);
      set_aurora_tokens(tokens_aurora);
      set_ref_total_value(total_value_ref);
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
    target =
      near_total_value + ref_total_value + dcl_total_value + aurora_total_value;
    return display_value_withCommas(target);
  }
  return (
    <>
      <div className="bg-gray-20 bg-opacity-40 p-4 rounded">
        <div className="flex items-center text-gray-50 text-xs w-full mb-5">
          <div className="w-3/6">Token</div>
          <div className="w-2/6">Balance</div>
          <div className="w-1/5 flex items-center justify-end">Value</div>
        </div>
        <div style={{ height: "40vh", overflow: "auto" }}>
          {(!userTokens || !balances || !auroaBalances || !DCLAccountBalance) &&
          isSignedIn ? (
            <div className="flex justify-between">
              <SkeletonTheme
                baseColor="rgba(33, 43, 53, 0.3)"
                highlightColor="#2A3643"
              >
                <Skeleton width={320} height={60} count={4} className="mt-4" />
              </SkeletonTheme>
            </div>
          ) : (
            <>
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
              {ref_tokens.map((token: TokenMetadata) => {
                return (
                  <WalletTokenList
                    key={token.id + "ref"}
                    token={token}
                    tokenBalance={token?.ref ?? 0}
                    showTokenPrice={showTokenPrice}
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
                  />
                );
              })}
              {aurora_tokens.map((token: TokenMetadata) => {
                return (
                  <WalletTokenList
                    key={token.id + "aurora"}
                    token={token}
                    tokenBalance={token?.aurora ?? 0}
                    showTokenPrice={showTokenPrice}
                  />
                );
              })}
            </>
          )}
        </div>
      </div>
      <div className="frcb mt-6 px-4">
        <p className="text-gray-50 text-sm">Total</p>
        <p className="text-base">{showTotalValue()}</p>
      </div>
    </>
  );
}
