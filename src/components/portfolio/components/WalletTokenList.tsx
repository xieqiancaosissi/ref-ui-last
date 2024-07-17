import {
  display_number_internationalCurrencySystemLongString,
  display_value,
} from "@/services/aurora";
import { TokenMetadata } from "@/services/ft-contract";
import Big from "big.js";
import React from "react";

type Props = {
  token: TokenMetadata;
  tokenBalance: number | string;
  showTokenPrice: any;
  showWithdraw?: boolean;
};

export const WalletTokenList = ({
  token,
  tokenBalance,
  showTokenPrice,
}: Props) => {
  const { ref, dcl, id, decimals } = token || {};
  const isRefClassic = Number(ref) > 0;
  const isDCL = Number(dcl) > 0;

  return (
    <div className="flex items-center w-full mb-6">
      <div className="w-3/6 flex items-center">
        <img className="w-6 h-6 rounded-3xl mr-2.5" src={token.icon} alt={""} />
        <div className="text-sm">
          <p className="w-24 overflow-hidden whitespace-nowrap overflow-ellipsis">
            {token.symbol}
          </p>
          <p className="text-gray-50 text-xs">{showTokenPrice(token)}</p>
        </div>
      </div>
      <div className="w-2/6 text-sm">
        {display_number_internationalCurrencySystemLongString(
          Big(tokenBalance || 0).toFixed()
        )}
      </div>
      <div className="w-1/5 flex items-center justify-end text-sm">
        {display_value(String(token?.t_value))}
      </div>
    </div>
  );
};
