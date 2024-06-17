import { useMemo } from "react";
import { useSelectTokens } from "./useSelectTokens";

export const useRiskTokens = () => {
  const tokens = useSelectTokens();
  const pureIdList: any = [];
  const allRiskTokens = useMemo(() => {
    return tokens?.filter((token) => {
      token.isRisk && pureIdList.push(token.id);
      return token.isRisk;
    });
  }, [tokens]);
  return { allRiskTokens: allRiskTokens || [], pureIdList };
};
