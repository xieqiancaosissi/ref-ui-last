import { useEffect, useState } from "react";
import Big from "big.js";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { useSwapStore } from "@/stores/swap";
import { useLimitStore } from "@/stores/limitOrder";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { formatTokenPrice } from "@/utils/uiNumber";
import { getMax } from "@/services/swap/swapUtils";

const SelectDclPoolButton = dynamic(() => import("./SelectDclPoolButton"), {
  ssr: false,
});
const SelectTokenBalance = dynamic(() => import("./SelectTokenBalance"), {
  ssr: false,
});
interface IInputProps {
  token: ITokenMetadata;
  className?: string;
  isIn?: boolean;
  isOut?: boolean;
}
export default function Input(props: IInputProps) {
  const { className, token, isIn, isOut } = props;
  const [amount, setAmount] = useState<string>("");
  const [showNearTip, setShowNearTip] = useState<boolean>(false);
  const swapStore = useSwapStore();
  const limitStore = useLimitStore();
  const tokenOutAmount = limitStore.getTokenOutAmount();
  const tokenInAmount = limitStore.getTokenInAmount();
  const allTokenPrices = swapStore.getAllTokenPrices();
  const isNEAR = getTokenUIId(token) == "near";
  const symbolsArr = ["e", "E", "+", "-"];
  useEffect(() => {
    if (isIn) {
      limitStore.setTokenInAmount(amount);
    }
  }, [amount, isIn]);
  useEffect(() => {
    if (isOut) {
      limitStore.setTokenOutAmount(amount);
    }
  }, [amount, isOut]);
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
  function getTokenValue() {
    return formatTokenPrice(
      new Big(amount || 0).mul(allTokenPrices[token?.id]?.price || 0).toFixed()
    );
  }
  return (
    <div
      className={twMerge(
        `flex items-center flex-col bg-dark-60 rounded w-full p-3.5 border border-transparent hover:border-green-10`,
        className
      )}
    >
      <div className="flex items-center justify-between w-full gap-2">
        <input
          step="any"
          type="number"
          placeholder="0.0"
          value={isOut ? tokenOutAmount : tokenInAmount}
          className="flex-grow w-1 bg-transparent outline-none font-bold text-white text-2xl"
          onChange={changeAmount}
          onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
        />
        <SelectDclPoolButton isIn={isIn} isOut={isOut} />
      </div>
      <div className="flex items-center justify-between w-full text-sm text-gray-50 mt-2.5">
        <span>{getTokenValue()}</span>
        <div className="flex items-center gap-0.5">
          Balance:
          <SelectTokenBalance
            isIn={isIn}
            setMaxAmount={setMaxAmount}
            token={token}
          />
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
