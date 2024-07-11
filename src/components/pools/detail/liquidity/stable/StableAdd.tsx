import React from "react";
import Modal from "react-modal";
import { LockLpTitleIcon, LpModalCloseIcon } from "@/components/pools/icon";
export default function StableAdd(props: any) {
  const { isOpen, onRequestClose } = props;
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
      <div>
        <div className="flex items-center justify-between">
          <LockLpTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        <div className="w-108 min-h-110 rounded-lg bg-dark-10 px-4 py-5">
          {/* title */}
        </div>
      </div>
    </Modal>
  );
}
