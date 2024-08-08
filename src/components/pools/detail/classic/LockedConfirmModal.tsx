import React, { useState } from "react";
import Modal from "react-modal";
import Big from "big.js";
import { isMobile } from "@/utils/device";
import { LpModalCloseIcon } from "../../icon";
import { secToTime } from "@/utils/time";
import { ButtonTextWrapper } from "@/components/common/Button";
function LockedConfirmModal(props: any) {
  const { isOpen, onRequestClose, months, onLock } = props;
  const [lockLoading, setLockLoading] = useState(false);
  const cardWidth = isMobile() ? "95vw" : "380px";
  function doLock() {
    setLockLoading(true);
    onLock();
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div
        className=" rounded bg-dark-10 p-5 pt-4 text-white"
        style={{
          width: cardWidth,
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-white text-lg font-medium">
            Lock Instructions
          </div>
          <LpModalCloseIcon
            className="cursor-pointer text-black hover:opacity-80"
            onClick={onRequestClose}
          />
        </div>
        <p className="mt-4 mb-12 text-sm text-gray-60">
          Your LP Token will be unlocked on{" "}
          {secToTime(
            Big(new Date().getTime() / 1000).plus(
              +(months || 0) * 30 * 24 * 3600
            )
          )}
          . Please confirm this operation again.
        </p>
        <div className="flex justify-center">
          <div
            onClick={doLock}
            className={`cursor-pointer rounded frcc mt-2 w-29 h-9 outline-none border hover:opacity-85 border-green-10 text-green-10 ${
              lockLoading ? "opacity-40" : ""
            }`}
          >
            <ButtonTextWrapper
              loading={lockLoading}
              Text={() => <span className="frcc">Got it!</span>}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default LockedConfirmModal;
