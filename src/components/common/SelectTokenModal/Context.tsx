import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import React, { createContext } from "react";
export interface ISelectTokenContext {
  onRequestClose: () => void;
  onSelect: (token: ITokenMetadata) => void;
  searchText: string;
}
export const SelectTokenContext = createContext<ISelectTokenContext>({
  onRequestClose: () => ({}),
  onSelect: () => ({}),
  searchText: "",
});
