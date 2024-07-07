import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { ArrowDownIcon } from "../../components/swap/icons";
import { TokenMetadata } from "@/services/ft-contract";
import { IPoolDcl } from "@/interfaces/swapDcl";
import { useAccountTokenStore, IAccountTokenStore } from "@/stores/token";
import {
  useLimitStore,
  usePersistLimitStore,
  IPersistLimitStore,
} from "@/stores/limitOrder";
import { sort_tokens_by_base } from "@/services/commonV3";
const SelectDclTokenBox = dynamic(
  () => import("./SelectDclTokenBox/SelectDclToken"),
  { ssr: false }
);
export default function SelectDclPoolButton({
  isIn,
  isOut,
}: {
  isIn?: boolean;
  isOut?: boolean;
}) {
  const [show, setShow] = useState<boolean>(false);
  const accountTokenStore = useAccountTokenStore() as IAccountTokenStore;
  const defaultAccountBalances = accountTokenStore.getDefaultAccountTokens();
  const limitStore = useLimitStore();
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const cachedDclPool = persistLimitStore.getDclPool();
  const selectedToken = isIn
    ? limitStore.getTokenIn()
    : limitStore.getTokenOut();
  useEffect(() => {
    if (cachedDclPool?.pool_id && defaultAccountBalances?.length > 0) {
      const { token_x_metadata, token_y_metadata } = cachedDclPool;
      const tokens: TokenMetadata[] = sort_tokens_by_base([
        token_x_metadata as TokenMetadata,
        token_y_metadata as TokenMetadata,
      ]);
      const tokensWithBalance = tokens.map((token) =>
        defaultAccountBalances.find((t) => t.id == token.id)
      ) as ITokenMetadata[];
      limitStore.setTokenIn(tokensWithBalance[0]);
      limitStore.setTokenOut(tokensWithBalance[1]);
    }
  }, [cachedDclPool?.pool_id, JSON.stringify(defaultAccountBalances || [])]);
  useEffect(() => {
    const event = (e: any) => {
      const path = e.composedPath();
      const el = path.find((el: any) => el.id == "setDclToken");
      if (!el) {
        hideBox();
      }
    };
    document.addEventListener("click", event);
    return () => {
      document.removeEventListener("click", event);
    };
  }, []);
  function showBox() {
    setShow(true);
  }
  function hideBox() {
    setShow(false);
  }
  function selectEvent(p: IPoolDcl) {
    persistLimitStore.setDclPool(p);
    hideBox();
  }
  return (
    <div
      id="setDclToken"
      className="flex items-center cursor-pointer flex-shrink-0 relative id"
      onClick={showBox}
    >
      {selectedToken ? (
        <>
          <div
            className="flex justify-center relative overflow-hidden rounded-full border border-gray-110"
            style={{
              width: "24px",
              height: "24px",
            }}
          >
            <img
              className="flex-shrink-0 w-6 h-6"
              src={selectedToken.icon || "/images/placeholder.svg"}
              alt=""
            />
          </div>
          <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
            {selectedToken.symbol}
          </span>
          <ArrowDownIcon className="text-gray-50" />
        </>
      ) : (
        <SkeletonTheme baseColor="#212B35" highlightColor="#2A3643">
          <Skeleton height={20} width={80} />
        </SkeletonTheme>
      )}
      <SelectDclTokenBox show={show} onSelect={selectEvent} />
    </div>
  );
}
