import React, { useState } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { isMobile } from "../../../utils/device";
import { CloseIcon, SearchIcon } from "../Icons";
import AssetTable from "./AssetTable";
import Styles from "./modal.module.css";
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
    >
      <div
        style={{
          width: cardWidth,
        }}
        className="rounded-lg bg-dark-70 py-6"
      >
        {/* title */}
        <div className="flexBetween px-6">
          <span className="text-lg text-white font-bold">Selected a Token</span>
          <CloseIcon
            className="text-dark-80 hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        {/* search box */}
        <div
          className="flex items-center rounded-md border border-gray-90 bg-black bg-opacity-40 mt-3.5 px-2.5 mx-6"
          style={{
            height: "46px",
          }}
        >
          <SearchIcon />
          <input
            className="ml-1.5 outline-none text-sm text-gray-50 flex-grow bg-transparent"
            placeholder="Search name or paste address..."
          />
        </div>
        <div
          className={`overflow-y-auto px-6 ${Styles.card}`}
          style={{ height: "400px" }}
        >
          {/* common tokens */}
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            {[1, 2, 3, 4, 5, 6].map((item) => {
              return (
                <div
                  className="flex items-center gap-1.5 pl-2 pr-3.5 py-0.5 border border-gray-70 hover:bg-gray-70 cursor-pointer"
                  style={{ borderRadius: "40px" }}
                  key={item}
                >
                  <Image
                    width="26"
                    height="26"
                    className="rounded-full"
                    src="/images/memeMenu.svg"
                    alt=""
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-white">NEAR</span>
                    <span className="text-xs text-gray-50">$32.6</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* assets table */}
          <AssetTable />
        </div>
      </div>
    </Modal>
  );
}
