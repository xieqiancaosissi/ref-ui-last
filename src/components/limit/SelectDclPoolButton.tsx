import Image from "next/image";
import { useEffect, useState } from "react";
import Big from "big.js";
import { twMerge } from "tailwind-merge";
import dynamic from "next/dynamic";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { useSwapStore } from "@/stores/swap";
import { getTokenUIId } from "@/services/swap/swapUtils";
import { formatTokenPrice } from "@/utils/uiNumber";
import { getMax } from "@/services/swap/swapUtils";
export default function SelectDclPoolButton() {
  return <div>Button</div>;
}
