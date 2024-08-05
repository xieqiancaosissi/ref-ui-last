import {
  batchWithdraw,
  batchWithdrawDCL,
  batchWithdrawFromAurora,
  display_number_internationalCurrencySystemLongString,
  display_value,
} from "@/services/aurora";
import { TokenMetadata } from "@/services/ft-contract";
import Big from "big.js";
import React, { useState } from "react";
import { WalletWithdraw } from "./icon";
import CustomTooltip from "@/components/customTooltip/customTooltip";
import { BeatLoader } from "react-spinners";

type Props = {
  token: TokenMetadata;
  tokenBalance: number | string;
  showTokenPrice: any;
  showWithdraw?: boolean;
  isAurora?: boolean;
};

export const WalletTokenList = ({
  token,
  tokenBalance,
  showTokenPrice,
  showWithdraw,
  isAurora,
}: Props) => {
  const [withdrawLoading, setWithdrawLoading] = useState<boolean>(false);
  const { ref, dcl, aurora, id, decimals } = token || {};
  const isRefClassic = Number(ref) > 0;
  const isDCL = Number(dcl) > 0;
  function getTip() {
    const result: string = `Withdraw`;
    return result;
  }
  const doWithDraw = async () => {
    if (!withdrawLoading) {
      try {
        setWithdrawLoading(true);
        if (isAurora) {
          await batchWithdrawFromAurora({
            [id]: {
              amount: aurora,
              decimals,
              id,
            },
          });
        } else if (isRefClassic) {
          await batchWithdraw({
            [id]: {
              amount: ref,
              decimals,
              id,
            },
          });
        } else if (isDCL) {
          await batchWithdrawDCL({
            [id]: {
              amount: dcl,
              decimals,
              id,
            },
          });
        }
      } catch (e) {
      } finally {
        setWithdrawLoading(false);
      }
    }
  };
  return (
    <div className="flex items-center w-full mb-6 text-white">
      <div className="w-3/6 flex items-center">
        <img className="w-6 h-6 rounded-3xl mr-2.5" src={token.icon} alt={""} />
        <div className="text-sm">
          <p className="w-24 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {token.symbol}
          </p>
          <p className="text-gray-50 text-xs">{showTokenPrice(token)}</p>
        </div>
      </div>
      <div className="w-2/6 text-sm flex items-center ">
        <span className={`${showWithdraw ? "text-primaryGreen" : ""}`}>
          {display_number_internationalCurrencySystemLongString(
            Big(tokenBalance || 0).toFixed()
          )}
        </span>
        <div className="ml-1.5">
          {showWithdraw &&
            (withdrawLoading ? (
              <BeatLoader size={4} color={"#ffffff"} />
            ) : (
              <div
                onClick={doWithDraw}
                data-class="reactTip"
                data-tooltip-id="showWithdrawId"
                data-place="top"
                data-tooltip-html={getTip()}
              >
                <WalletWithdraw className="text-gray-10 hover:text-white cursor-pointer" />
                <CustomTooltip id="showWithdrawId" className="text-gray-10" />
              </div>
            ))}
        </div>
      </div>
      <div className="w-1/5 flex items-center justify-end text-sm">
        {display_value(String(token?.t_value))}
      </div>
    </div>
  );
};
