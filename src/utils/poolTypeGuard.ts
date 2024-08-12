type PoolKind = "SIMPLE_POOL" | "DCL" | "RATED_SWAP" | "STABLE_SWAP" | string;

interface PoolResponse {
  pool_kind: PoolKind;
}

export const PoolRouterGuard = (
  res: PoolResponse,
  targetKind: PoolKind,
  fromStable?: boolean
): string => {
  if (targetKind && res.pool_kind === targetKind) {
    return "";
  }
  switch (res.pool_kind) {
    case "SIMPLE_POOL":
      return "/pool/classic";
    case "DCL":
      return "/pool/dcl";
    case "RATED_SWAP":
    case "STABLE_SWAP":
      return fromStable ? "" : "/pool/stable";
    default:
      return "/pool/unknown"; //
  }
};
