import { useMemo } from "react";
import { useSelectTokens } from "./useSelectTokens";

export const useRiskTokens = () => {
  const { totalList } = useSelectTokens();
  const pureIdList: any = [];
  const allRiskTokens = useMemo(() => {
    return totalList?.filter((token) => {
      token.isRisk && pureIdList.push(token.id);
      return token.isRisk;
    });
  }, [totalList]);
  return { allRiskTokens: allRiskTokens || [], pureIdList };
};
