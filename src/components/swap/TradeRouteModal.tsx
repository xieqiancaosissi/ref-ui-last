import { useMemo } from "react";
import Modal from "react-modal";
import { useSwapStore } from "@/stores/swap";
import {
  separateRoutes,
  getPoolAllocationPercents,
} from "@/services/swap/swapUtils";
import { getV3PoolId } from "@/services/swap/swapDclUtils";
import { Pool } from "@/interfaces/swap";
import TradeRouteHub from "@/components/swap/TradeRouteHub";
import { LeftBracket, RightBracket } from "@/components/swap/Bracket";
import Token from "@/components/swap/Token";
import { PolygonArrowIcon, RefMarketRouteIcon } from "./icons";
import { CloseIcon } from "@/components/common/Icons";

export default function TradeRouteModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const swapStore = useSwapStore();
  const estimates = swapStore.getEstimates();
  const avgFee = swapStore.getAvgFee();
  const tokenIn = swapStore.getTokenIn();
  const tokenOut = swapStore.getTokenOut();
  const best = swapStore.getBest();
  const identicalRoutes = separateRoutes(
    estimates,
    estimates[estimates.length - 1].outputToken ?? ""
  );
  const percents = useMemo(() => {
    try {
      const pools = identicalRoutes
        .map((r) => r[0])
        .map((hub) => hub.pool) as Pool[];
      return getPoolAllocationPercents(pools);
    } catch (error) {
      if (identicalRoutes.length === 0) return ["100"];
      else return identicalRoutes.map((r) => r[0].percent);
    }
  }, [JSON.stringify(identicalRoutes || []), best]);
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
        },
      }}
    >
      <div
        style={{ width: "680px" }}
        className="bg-dark-10 p-6 pb-8 rounded-lg"
      >
        {/* title */}
        <div className="flexBetween">
          <div className="flex items-center gap-3 text-white text-lg">
            <RefMarketRouteIcon /> Trade Route
          </div>
          <CloseIcon
            className="text-gray-50 hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        <div className="flexBetween mt-10">
          <Token icon={tokenIn.icon} size="26" />
          <LeftBracket size={identicalRoutes.length} />
          <div className="w-full mx-2 xsm:overflow-x-auto relative">
            {best == "v1" ? (
              <>
                {identicalRoutes.map((route, j) => {
                  return (
                    <div key={j} className="relative flexBetween my-3 ">
                      <span className="text-xs text-gray-180">
                        {percents[j]}%
                      </span>
                      {/* background line */}
                      <div
                        className="absolute border border-dashed left-8 opacity-30 border-gray-60 w-full"
                        style={{
                          width: "calc(100% - 32px)",
                        }}
                      ></div>
                      {/* pools have passed  */}
                      <div className="flex items-center">
                        {route[0].tokens
                          ?.slice(1, route[0].tokens.length)
                          .map((t, i) => {
                            return (
                              <>
                                <TradeRouteHub
                                  poolId={Number(route[i].pool?.id)}
                                  token={t}
                                  contract="Ref_Classic"
                                />
                                {t.id !==
                                  route[0].tokens?.[route[0].tokens.length - 1]
                                    ?.id && (
                                  <div className="relative mx-3 z-10">
                                    <PolygonArrowIcon />
                                  </div>
                                )}
                              </>
                            );
                          })}
                      </div>
                      <PolygonArrowIcon />
                    </div>
                  );
                })}
              </>
            ) : (
              <>
                <div className="relative flexBetween my-3">
                  <span className="text-xs text-gray-180">100%</span>
                  {/* background line */}
                  <div
                    className="absolute border border-dashed left-8 opacity-30 border-gray-60 w-full"
                    style={{
                      width: "calc(100% - 32px)",
                    }}
                  ></div>
                  {/* pools have passed  */}
                  <div className="flex items-center">
                    <TradeRouteHub
                      poolId={getV3PoolId(
                        tokenIn.id,
                        tokenOut.id,
                        +avgFee * 100
                      )}
                      token={tokenOut}
                      contract="Ref_DCL"
                    />
                  </div>
                  <PolygonArrowIcon />
                </div>
              </>
            )}
            {}
          </div>
          <RightBracket size={identicalRoutes.length} />
          <Token icon={tokenOut.icon} size="26" />
        </div>
      </div>
    </Modal>
  );
}
