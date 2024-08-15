import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import { CreatePoolTitle, CreatePoolClose } from "@/components/pools/icon";
import Fee from "./createPoolFee/index";
import TokenInput from "./createPoolInput/index";
import { addSimpleLiquidityPool, findSamePools } from "@/services/pool";
import InitData from "@/components/swap/InitData";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useRouter } from "next/router";
import { error } from "console";
import failToast from "@/components/common/toast/failToast";
import successToast from "@/components/common/toast/successToast";
import { checkTransactionStatus } from "@/utils/contract";
import { getURLInfo } from "@/utils/transactionsPopup";
import { getAccountId } from "@/utils/wallet";
import { useAccountStore } from "@/stores/account";
import { REF_FI_CONTRACT_ID } from "@/utils/contract";

export default function CreatePoolModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const router = useRouter();
  const [createFee, setCreateFee] = useState(0);
  const [token, setToken] = useState(["", ""]);
  const [isDisabled, setDisabled] = useState(false);
  const [isSame, setSame] = useState(false);
  const [showSke, setShowSke] = useState(false);
  const [sameId, setSameId] = useState("");
  const accountStore = useAccountStore();

  const [validTips, setValidTips] = useState({
    active: false,
    tip: "",
  });

  const handleFee = (e: any) => {
    setCreateFee(e * 100);
    if (!e) {
      setValidTips({
        active: true,
        tip: "Please input valid number",
      });
    } else {
      if (e * 100 < 1) {
        setValidTips({
          active: true,
          tip: "Please input number that more than or equal to 0.01",
        });
      } else {
        setValidTips({
          active: false,
          tip: "",
        });
      }
    }
  };

  const handleToken = (e: { index: number; value: string }) => {
    const newToken = [...token];
    newToken[e.index] = e.value;
    setToken(newToken);
  };

  // const { txHash } = getURLInfo();
  // useEffect(() => {
  //   if (txHash && accountStore.isSignedIn) {
  //     checkTransactionStatus(txHash).then((res) => {
  //       let status: any = res.status;

  //       if (
  //         res.transaction?.actions?.[0]?.FunctionCall?.method_name === "execute"
  //       ) {
  //         const receipt = res?.receipts_outcome?.find(
  //           (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
  //         );

  //         if (receipt) {
  //           status = receipt?.outcome?.status;
  //         }
  //       }

  //       const data: string | undefined = status.SuccessValue;

  //       if (data) {
  //         const buff = Buffer.from(data, "base64");
  //         const pool_id = buff.toString("ascii");

  //         router.push(`/pool/classic/${pool_id}`);
  //       } else {
  //         router.replace(`/pools`);
  //       }
  //     });
  //   }
  // }, [txHash]);

  const createPool = () => {
    setShowSke(true);
    addSimpleLiquidityPool(token, Math.floor(createFee))
      .then((res: any) => {
        let status;
        if (res.status == "success") {
          successToast();

          if (
            res.successResult[0].transaction?.actions[0]?.FunctionCall
              ?.method_name === "execute"
          ) {
            const receipt = res.successResult[0]?.receipts_outcome?.find(
              (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
            );

            if (receipt) {
              status = receipt?.outcome?.status;
            }
          }

          const data: string | undefined =
            res.successResult[0].status.SuccessValue || status.SuccessValue;

          if (data) {
            const buff = Buffer.from(data, "base64");
            const pool_id = buff.toString("ascii");

            router.push(`/pool/classic/${pool_id}`);
          } else {
            router.replace(`/pools`);
          }
        } else if (res.status == "error") {
          failToast(res.errorResult?.message);
        }
      })
      .catch((error: any) => {
        console.log(error, "addSimpleLiquidityPool error");
      })
      .finally(() => {
        setShowSke(false);
      });
  };

  useEffect(() => {
    if (
      !token[0] ||
      !token[1] ||
      createFee < 0 ||
      !createFee ||
      validTips.active
    ) {
      setDisabled(true);
      setSame(false);
    } else {
      findSamePools(token, Math.floor(createFee) / 10000).then((res) => {
        if (res?.length > 0 || validTips.active) {
          setDisabled(true);
          setSame(true);
          setSameId(res[0].id);
        } else {
          setDisabled(false);
          setSame(false);
        }
      });
    }
  }, [token[0], token[1], createFee, validTips]);

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

  const toThisPool = () => {
    router.push(`/pool/classic/${sameId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
        setToken(["", ""]);
        setShowSke(false);
      }}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        },
        content: {
          outline: "none",
          top: isMobile ? "auto" : "50%",
          left: isMobile ? "auto" : "50%",
          transform: isMobile ? "none" : "translate(-50%, -50%)",
          bottom: isMobile ? "32px" : "auto",
          width: isMobile ? "100%" : "auto",
        },
      }}
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
              setShowSke(false);
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
            {validTips.active && (
              <div
                className="text-yellow-10 text-xs border h-11 lg:w-100 xsm:w-full rounded flex px-1 py-1 items-center lg:mt-10 xsm:mt-4"
                style={{
                  borderColor: "rgba(230, 180, 1, 0.3)",
                  backgroundColor: "rgba(230, 180, 1, 0.14)",
                }}
              >
                <span>{validTips.tip}</span>
              </div>
            )}
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
                  <span
                    className="underline cursor-pointer"
                    onClick={() => toThisPool()}
                  >
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
