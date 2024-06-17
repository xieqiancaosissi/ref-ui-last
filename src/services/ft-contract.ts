export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  ref?: number | string;
  near?: number | string;
  aurora?: number | string;
  total?: number;
  onRef?: boolean;
  onTri?: boolean;
  amountLabel?: string;
  amount?: number;
  dcl?: number | string;
  nearNonVisible?: number | string;
  t_value?: string;
  isRisk?: boolean;
  isUserToken?: boolean;
  isDefaultWhiteToken?: boolean;
}
