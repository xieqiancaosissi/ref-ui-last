import { useEffect, useState } from "react";
import Modal from "react-modal";
import { CloseIcon } from "@/components/common/Icons";

export default function BridgeConfirmModal(props: any) {
  const { isOpen, onRequestClose, bridgeData } = props;
  function jump() {
    if (bridgeData.link) {
      window.open(bridgeData.link);
      onRequestClose();
    }
  }
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div className="rounded-lg border border-green-10 px-7 pt-5 pb-7 bg-dark-10 text-gray-60">
        {/* close button */}
        <div className="flex items-center justify-end">
          <CloseIcon
            className=" hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        {/* Logo */}
        <div
          className="flex items-center justify-center mt-6"
          style={{ transform: "scale(200%)" }}
        >
          {bridgeData?.icon}
        </div>
        {/* text */}
        <div className="text-gray-60 text-sm my-9">
          Redirecting to{" "}
          <span className="underline text-white cursor-pointer" onClick={jump}>
            {bridgeData.name}
          </span>
          , not affiliated with Ref.
        </div>
        {/* button */}
        <div
          onClick={jump}
          className="flex items-center justify-center h-[42px] rounded bg-greenGradient text-base font-bold text-black cursor-pointer"
        >
          I Understand
        </div>
      </div>
    </Modal>
  );
}
