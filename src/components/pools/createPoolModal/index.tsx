import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { CreatePoolTitle, CreatePoolClose } from "@/components/pools/icon";
import Fee from "./createPoolFee/index";
import TokenInput from "./createPoolInput/index";
import { addSimpleLiquidityPool, findSamePools } from "@/services/pool";
import InitData from "@/components/swap/InitData";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";

export default function CreatePoolModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const [createFee, setCreateFee] = useState(0);
  const [token, setToken] = useState(["", ""]);
  const [isDisabled, setDisabled] = useState(false);
  const [isSame, setSame] = useState(false);
  const [showSke, setShowSke] = useState(false);

  const handleFee = (e: any) => {
    setCreateFee(e * 100);
  };

  const handleToken = (e: { index: number; value: string }) => {
    const newToken = [...token];
    newToken[e.index] = e.value;
    setToken(newToken);
  };

  const createPool = () => {
    setShowSke(true);
    addSimpleLiquidityPool(token, createFee);
  };

  useEffect(() => {
    if (!token[0] || !token[1] || createFee < 0) {
      setDisabled(true);
      setSame(false);
    } else {
      findSamePools(token, createFee / 10000).then((res) => {
        if (res?.length > 0) {
          setDisabled(true);
          setSame(true);
        } else {
          setDisabled(false);
          setSame(false);
        }
      });
    }
  }, [token[0], token[1], createFee]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
        setToken(["", ""]);
      }}
      style={
        isMobile
          ? {
              overlay: {
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              },
              content: {
                transform: "translateX(-50%)",
                top: "auto",
                bottom: "32px",
                width: "100vw",
              },
            }
          : {
              overlay: {
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              },
            }
      }
    >
      <div className="lg:w-108 xsm:w-full">
        {/* for select token modal */}
        <InitData />
        {/* create pool title */}
        <div className="h-13 px-4 flex items-center justify-between xsm:hidden">
          <CreatePoolTitle />
          <CreatePoolClose
            className="hover:scale-110 hover:cursor-pointer"
            onClick={() => {
              onRequestClose();
              setToken(["", ""]);
            }}
          />
        </div>
        <div className="lg:h-110 xsm:w-full lg:rounded-lg xsm:rounded-xl bg-dark-10 p-4 flex flex-col justify-between">
          <div className="text-white text-lg lg:hidden mb-7">
            Create Classic pool
          </div>
          <div>
            {/* select token */}
            <div className="flex lg:justify-between xsm:flex-col">
              <TokenInput title="Token" index={0} handleToken={handleToken} />
              <TokenInput title="Pair" index={1} handleToken={handleToken} />
            </div>
            {/* fee */}
            <Fee getherFee={handleFee} />

            {/* for tips */}
            {isSame && (
              <div
                className="text-yellow-10 text-xs border h-11 lg:w-100 xsm:w-full rounded flex px-1 py-1 items-center lg:mt-10 xsm:mt-4"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>
                  This Pool already exists, you can switch to other fees or{" "}
                  <span className="underline cursor-pointer">
                    go to this pool
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* create pool and skeleton */}
          {showSke ? (
            <SkeletonTheme
              baseColor="rgba(33, 43, 53, 0.3)"
              highlightColor="#9EFF00"
            >
              <Skeleton width={400} height={40} count={1} className="mt-4" />
            </SkeletonTheme>
          ) : (
            <div
              onClick={() => {
                !isDisabled && createPool();
              }}
              className={`w-full text-base font-bold frcc h-10 rounded-lg xsm:my-4
                ${
                  isDisabled
                    ? "text-gray-50 bg-gray-40 cursor-not-allowed"
                    : "bg-createPoolLinear text-black hover:opacity-85 cursor-pointer"
                }
              `}
            >
              Create
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
