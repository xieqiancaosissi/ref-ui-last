import React, { useState } from "react";
import Modal from "react-modal";
import Big from "big.js";
import { isMobile } from "@/utils/device";
import { LpModalCloseIcon } from "../../icon";
import { secToTime } from "@/utils/time";
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
        className=" rounded-lg bg-dark-10 p-5 pt-4 text-white"
        style={{
          width: cardWidth,
        }}
      >
        <div className="title flex items-center justify-between">
          <div className="text-white text-xl gotham_bold">
            Lock Instructions
          </div>
          <LpModalCloseIcon
            className="cursor-pointer text-black"
            onClick={onRequestClose}
          />
        </div>
        <p className="mt-3 mb-2 text-sm text-white">
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
            className={`bg-senderHot px-3 py-1 gotham_bold cursor-pointer rounded-md mt-2 w-20 outline-none ${
              lockLoading ? "opacity-40" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-base text-boxBorder">
              Got it!
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default LockedConfirmModal;
