import Image from "next/image";
import SelectTokenModal from "../../components/common/SelectTokenModal/Index";
import { ArrowDownIcon } from "../../components/swap/icons";
import { useState } from "react";

export default function SelectTokenButton(props: any) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }
  return (
    <div>
      <div
        className="flex items-center cursor-pointer flex-shrink-0"
        onClick={showModal}
      >
        <Image width="20" height="20" alt="" src="/images/memeMenu.svg" />
        <span className="text-white font-bold text-base ml-1.5 mr-2.5 ">
          NEAR
        </span>
        <ArrowDownIcon className="text-gray-50" />
      </div>
      <SelectTokenModal isOpen={isOpen} onRequestClose={hideModal} />
    </div>
  );
}
