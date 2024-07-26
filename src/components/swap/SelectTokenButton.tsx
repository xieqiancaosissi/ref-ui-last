import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import SelectTokenModal from "../../components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "../../components/swap/icons";
import { useEffect, useState } from "react";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { getTokenUIId } from "@/services/swap/swapUtils";
import {
  usePersistSwapStore,
  useSwapStore,
  IPersistSwapStore,
} from "@/stores/swap";

interface ISelectTokenButtonProps {
  className?: string;
  isIn?: boolean;
  isOut?: boolean;
}
export default function SelectTokenButton(props: ISelectTokenButtonProps) {
  const { isIn, isOut } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectToken, setSelectToken] = useState<ITokenMetadata>();
  const persistSwapStore: IPersistSwapStore = usePersistSwapStore();
  const swapStore = useSwapStore();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const showToken = isIn ? tokenIn : tokenOut;
  useEffect(() => {
    if (selectToken?.id) {
      if (isIn) {
        swapStore.setTokenIn(selectToken);
        persistSwapStore.setTokenInId(getTokenUIId(selectToken));
      } else if (isOut) {
        swapStore.setTokenOut(selectToken);
        persistSwapStore.setTokenOutId(getTokenUIId(selectToken));
      }
    }
  }, [getTokenUIId(selectToken)]);
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }
  function onSelect(token: ITokenMetadata) {
    setSelectToken(token);
  }
  return (
    <div>
      {showToken ? (
        <div
          className="flex items-center cursor-pointer flex-shrink-0"
          onClick={showModal}
        >
          <div
            className="flex items-center justify-center relative overflow-hidden rounded-full border border-gray-110"
            style={{
              width: "24px",
              height: "24px",
            }}
          >
            <img
              className="flex-shrink-0 w-6 h-6"
              src={showToken.icon || "/images/placeholder.svg"}
              alt=""
            />
            {showToken.isRisk ? (
              <span
                className="italic text-white bg-black bg-opacity-70 absolute bottom-0"
                style={{ width: "24px", height: "10px" }}
              >
                <label
                  className="text-sm block transform scale-50 relative font-extrabold"
                  style={{ top: "-5px", left: "-1px" }}
                >
                  TKN
                </label>
              </span>
            ) : null}
          </div>
          <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
            {showToken.symbol}
          </span>
          <ArrowDownIcon className="text-gray-50" />
        </div>
      ) : (
        <SkeletonTheme baseColor="#212B35" highlightColor="#2A3643">
          <Skeleton height={20} width={80} />
        </SkeletonTheme>
      )}

      {isOpen ? (
        <SelectTokenModal
          isOpen={isOpen}
          onRequestClose={hideModal}
          onSelect={onSelect}
        />
      ) : null}
    </div>
  );
}
