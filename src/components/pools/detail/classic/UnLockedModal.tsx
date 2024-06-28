import React, { useState, useContext } from "react";
import { isMobile } from "@/utils/device";
import { toPrecision, toReadableNumber } from "@/utils/numbers";
import { unlock_lp } from "@/services/lplock";
import Modal from "react-modal";
import { UnLockLpTitleIcon, LpModalCloseIcon } from "@/components/pools/icon";
import {
  UnlockWithoutCircleBlack,
  LpUnlockWithDivIcon,
} from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn/index";
import styles from "./style.module.css";

function UnLockedModal(props: any) {
  const { pureIdList } = useRiskTokens();
  const { isOpen, onRequestClose, tokens, lockedData } = props;
  const [unlock_loading, set_unlock_loading] = useState<boolean>(false);
  const cardWidth = isMobile() ? "95vw" : "28vw";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const balance = toPrecision(
    toReadableNumber(24, lockedData?.locked_balance || "0"),
    8
  );
  function unlock() {
    set_unlock_loading(true);
    unlock_lp({
      token_id: lockedData.token_id,
      amount: lockedData.locked_balance,
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div className="w-108 h-92 rounded-lg bg-dark-10 px-4 py-5">
        {/* title */}
        <div className="flex items-center justify-between">
          <UnLockLpTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer"
            onClick={onRequestClose}
          />
        </div>

        <div className="flex items-center  text-sm mt-7 text-gray-60">
          <span>My Locking</span>
        </div>
        {/*  */}
        <div
          className="flex items-center justify-between px-3 rounded-lg mt-4 "
          style={{ height: "65px", background: "rgba(0,0,0,.2)" }}
        >
          <div className="text-white text-xl focus:outline-none appearance-none leading-tight px-2.5 w-full flex items-center">
            <span className="text-white gotham_bold text-2xl mr-2">
              {balance}
            </span>
            <LpUnlockWithDivIcon />
          </div>
          <div
            className={`flex items-center flex-shrink-0 bg-primaryText bg-opacity-10 rounded-full p-1 ${styles.tokenImgContainer}`}
          >
            {tokens?.map((ite: any, ind: number) => (
              <TokenIconComponent
                key={ite.tokenId + ind}
                ite={ite}
                tokenIcons={tokenIcons}
                pureIdList={pureIdList}
                ind={ind}
              />
            ))}
          </div>
        </div>

        <div
          onClick={unlock}
          className={`flex-shrink-0 mt-36 h-12 text-center text-sm text-white focus:outline-none font-semibold cursor-pointer`}
        >
          <div className="poolBtnStyle">
            <UnlockWithoutCircleBlack />
            <span className="ml-2">Unlock</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default UnLockedModal;
