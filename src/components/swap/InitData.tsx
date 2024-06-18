import React, { useEffect } from "react";
import { useSelectTokens } from "@/hooks/useSelectTokens";
import getConfigV2 from "@/utils/configV2";
import {
  useDefaultBalanceTokens,
  useAutoBalanceTokens,
} from "../../hooks/useBalanceTokens";
const configV2 = getConfigV2();
const { INIT_SWAP_PAIRS } = configV2;
export default function InitData() {
  const { defaultList = [], autoList = [] } = useSelectTokens();
  const defaultDisplayTokens = useDefaultBalanceTokens(defaultList);
  const autoDisplayTokens = useAutoBalanceTokens(autoList);
  // url 参数 -----> 本地 ------>init, -------->同步到前两处里面去
  // ids------> tokens---->塞入
  return null;
}
