import React, { useState } from "react";
import Modal from "react-modal";
import { isMobile } from "../../../utils/device";
export default function SelectTokenModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const cardWidth = isMobile() ? "95vw" : "430px";
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    ></Modal>
  );
}
