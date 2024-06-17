import { useMemo } from "react";
import { useSelectTokens } from "./useSelectTokens";

export const useRiskTokens = () => {
  const { totalList } = useSelectTokens();

  const { allRiskTokens, pureIdList } = useMemo(() => {
    const filteredTokens = totalList?.filter((token) => token.isRisk) || [];

    const riskTokenIds = filteredTokens.map((token) => token.id);

    return {
      allRiskTokens: filteredTokens,
      pureIdList: riskTokenIds,
    };
  }, [totalList]);

  return { allRiskTokens, pureIdList };
};
