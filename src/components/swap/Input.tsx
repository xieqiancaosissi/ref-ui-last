import Image from "next/image";
import Big from "big.js";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { useSwapStore } from "@/stores/swap";
import { toPrecision } from "@/utils/numbers";
import { formatTokenPrice } from "@/utils/uiNumber";
import { MIN_RETAINED_NEAR_AMOUNT } from "@/utils/constant";
import getConfig from "@/utils/config";
import { getAllTokenPrices } from "@/services/farm";
import { TokenPrice } from "@/db/RefDatabase";
import { useEffect, useState } from "react";
const SelectTokenButton = dynamic(() => import("./SelectTokenButton"), {
  ssr: false,
});
interface IInputProps {
  className?: string;
  disable?: boolean;
  token: ITokenMetadata;
  isIn?: boolean;
  isOut?: boolean;
}
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
export default function Input(props: IInputProps) {
  const { className, disable, token, isIn, isOut } = props;
  const [amount, setAmount] = useState<string>("");
  const [showNearTip, setShowNearTip] = useState<boolean>(false);
  const [allTokenPrices, setAllTokenPrices] = useState<
    Record<string, TokenPrice>
  >({});
  const swapStore = useSwapStore();
  const tokenOutAmount = swapStore.getTokenOutAmount();
  const isNEAR = token?.id == WRAP_NEAR_CONTRACT_ID && token?.symbol == "NEAR";
  useEffect(() => {
    getAllTokenPrices().then((res) => {
      setAllTokenPrices(res);
    });
  }, []);
  useEffect(() => {
    if (isIn) {
      swapStore.setTokenInAmount(amount);
    }
  }, [amount, isIn]);
  useEffect(() => {
    if (isOut) {
      setAmount(tokenOutAmount);
    }
  }, [tokenOutAmount, isOut]);
  useEffect(() => {
    if (
      amount &&
      isIn &&
      token?.id &&
      isNEAR &&
      Big(amount).gt(getMax(token))
    ) {
      setShowNearTip(true);
    } else {
      setShowNearTip(false);
    }
  }, [amount, isIn, token?.id]);
  function changeAmount(e: any) {
    setAmount(e.target.value);
  }
  function setMaxAmount() {
    if (token) {
      setAmount(getMax(token));
    }
  }
  function getMax(token: ITokenMetadata): string {
    const { balance } = token;
    if (isNEAR) {
      const minusDiff = Big(balance || 0).minus(MIN_RETAINED_NEAR_AMOUNT);
      return minusDiff.gt(0) ? minusDiff.toFixed() : "0";
    }
    return balance || "";
  }
  function getTokenValue() {
    return formatTokenPrice(
      new Big(amount || 0).mul(allTokenPrices[token?.id]?.price || 0).toFixed()
    );
  }
  return (
    <div
      className={twMerge(
        `flex items-center flex-col bg-dark-60 rounded w-full p-3.5 border border-transparent ${
          disable ? "" : "hover:border-green-10"
        }`,
        className
      )}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <input
          step="any"
          type="number"
          placeholder="0.0"
          disabled={disable}
          value={amount}
          className="flex-grow w-1 bg-transparent outline-none font-bold text-white text-2xl"
          onChange={changeAmount}
        />
        <SelectTokenButton isIn={isIn} isOut={isOut} />
      </div>
      <div className="flex items-center justify-between w-full text-sm text-gray-50 mt-2.5">
        <span>{getTokenValue()}</span>
        <div className="flex items-center gap-0.5">
          Balance:
          <span
            onClick={() => {
              if (isIn) setMaxAmount();
            }}
            className={`${isIn ? "underline cursor-pointer" : ""}`}
          >
            {toPrecision(token?.balance || "0", 3)}
          </span>
        </div>
      </div>
      {/* near validation error tip */}
      <div
        className={`flex items-center px-2.5 py-1 bg-yellow-10 bg-opacity-15 rounded text-xs text-yellow-10 w-full mt-3 mb-1.5 ${
          showNearTip ? "" : "hidden"
        }`}
      >
        Must have 0.2N or more left in wallet for gas fee.
      </div>
    </div>
  );
}
