import React, { useState, useContext, useMemo } from "react";
import Big from "big.js";
import { isMobile } from "@/utils/device";
import { toNonDivisibleNumber, toReadableNumber } from "@/utils/numbers";
import { formatWithCommas_number } from "@/utils/uiNumber";
import { lock_lp } from "@/services/lplock";
import Modal from "react-modal";
function LockedModal(props: any) {
  const {
    isOpen,
    onRequestClose,
    is_mft_registered,
    userShares,
    lockedData,
    pool,
    tokens,
  } = props;
  const [sliderAmount, setSliderAmount] = useState<string>("0");
  const [amount, setAmount] = useState<string>("");
  const [months, setMonths] = useState<string | number>("");
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const cardWidth = isMobile() ? "95vw" : "28vw";
  const cardHeight = isMobile() ? "90vh" : "80vh";
  const balance = toReadableNumber(24, userShares);
  const [new_unlock_time_sec, isInValidMonths] = useMemo(() => {
    const new_unlock_time_sec = Big(new Date().getTime() / 1000).plus(
      +(months || 0) * 30 * 24 * 3600
    );
    const old_unlock_time_sec = lockedData?.unlock_time_sec || 0;
    return [
      new_unlock_time_sec,
      Big(months || 0).gt(0) && new_unlock_time_sec.lte(old_unlock_time_sec),
    ];
  }, [lockedData, months]);
  function lock() {
    lock_lp({
      token_id: `:${pool.id}`,
      amount: Big(toNonDivisibleNumber(24, amount)).toFixed(0),
      unlock_time_sec: +new_unlock_time_sec.toFixed(0),
      is_mft_registered,
      // unlock_time_sec: 1715094000,
    });
  }
  function changeMonths(v: any) {
    if (v.indexOf(".") > -1) {
      setMonths(v.substring(0, v.indexOf(".")));
    } else if (+v > 1200) return;
    else {
      setMonths(v);
    }
  }
  function changeAmount(m: any) {
    setAmount(m);
  }
  const disabled =
    Big(amount || 0).lte(0) ||
    Big(months || 0).lte(0) ||
    isInValidMonths ||
    Big(amount || 0).gt(balance);
  function openConfirmModal() {
    setIsConfirmOpen(true);
  }
  function closeConfirmModal() {
    setIsConfirmOpen(false);
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

export default LockedModal;
