import React, { useState, useContext } from "react";
import { isMobile } from "@/utils/device";
import { toPrecision, toReadableNumber } from "@/utils/numbers";
import { toInternationalCurrencySystem_number } from "@/utils/uiNumber";
import { unlock_lp } from "@/services/lplock";
import Modal from "react-modal";
function UnLockedModal(props: any) {
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
    ></Modal>
  );
}

export default UnLockedModal;
