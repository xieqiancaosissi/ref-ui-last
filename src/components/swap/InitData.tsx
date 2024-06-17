import { useSelectTokens } from "../../hooks/useSelectTokens";
import {
  useDefaultBalanceTokens,
  useAutoBalanceTokens,
} from "../../hooks/useBalanceTokens";

export default function InitData() {
  const { defaultList = [], autoList = [], totalList } = useSelectTokens();
  useDefaultBalanceTokens(defaultList);
  useAutoBalanceTokens(autoList);
  return null;
}
