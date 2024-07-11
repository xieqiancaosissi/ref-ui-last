import React from "react";
import { useRouter } from "next/router";
import StableAdd from "@/components/pools/detail/liquidity/stable/StableAdd";
import StableRemove from "@/components/pools/detail/liquidity/stable/StableRemove";
import Modal from "react-modal";
export default function Sauce() {
  const router = useRouter();

  return (
    <Modal
      isOpen={true}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      {router?.query?.type == "add" && <StableAdd />}
      {router?.query?.type == "remove" && <StableRemove />}
    </Modal>
  );
}
