import React, { useState } from "react";
import Modal from "react-modal";
import { CreatePoolTitle, CreatePoolClose } from "@/components/pools/icon";
import Fee from "./createPoolFee/index";
import TokenInput from "./createPoolInput/index";
import { addSimpleLiquidityPool } from "@/services/pool";

export default function CreatePoolModal({
  isOpen,
  onRequestClose,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
}) {
  const [createFee, setCreateFee] = useState(0);
  const [token, setToken] = useState(["", ""]);

  const handleFee = (e: any) => {
    setCreateFee(e * 100);
  };

  const handleToken = (e: { index: number; value: string }) => {
    const newToken = [...token];
    newToken[e.index] = e.value;
    setToken(newToken);
  };

  const createPool = () => {
    addSimpleLiquidityPool(token, createFee);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div className="w-108">
        {/* create pool title */}
        <div className="h-13 px-4 flex items-center justify-between">
          <CreatePoolTitle />
          <CreatePoolClose
            className="hover:scale-110 hover:cursor-pointer"
            onClick={() => {
              onRequestClose();
            }}
          />
        </div>
        <div className="h-110 rounded-lg bg-dark-10 p-4 flex flex-col justify-between">
          <div>
            {/* select token */}
            <div className="flex justify-between">
              <TokenInput title="Token" index={0} handleToken={handleToken} />
              <TokenInput title="Pair" index={1} handleToken={handleToken} />
            </div>
            {/* fee */}
            <Fee getherFee={handleFee} />
          </div>
          <div
            onClick={() => createPool()}
            className="w-full bg-createPoolLinear text-black text-base font-bold frcc h-10 rounded-lg cursor-pointer hover:opacity-85"
          >
            Create
          </div>
        </div>
      </div>
    </Modal>
  );
}
