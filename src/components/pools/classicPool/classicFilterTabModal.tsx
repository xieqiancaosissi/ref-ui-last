import React, { useState } from "react";
import Modal from "react-modal";
import { tabList } from "./config";

export default function ClassicFilterTabModal(props: any) {
  const { isOpen, onRequestClose, setMobilePros } = props;
  const [isActive, setActive] = useState("");
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
      style={{
        overlay: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, 30%)",
        },
      }}
    >
      <div
        className="h-77"
        style={{
          background: "#1B242C",
          border: "1px solid #1D2932",
          width: "100vw",
          borderRadius: "24px 24px 0 0",
        }}
      >
        <div className="text-xs cursor-pointer flex flex-col items-center">
          {tabList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  text-white
                  flex items-center justify-between
                  w-11/12
                  h-12
                  mt-3
                  px-3.5
                  text-sm
                  rounded
                  ${item.key == isActive ? "bg-gray-20" : ""}                  
                `}
                onClick={() => {
                  setActive(item.key);
                  setMobilePros({
                    which: "classicTabChange",
                    key: item,
                  });
                  onRequestClose();
                }}
              >
                <span>{item.value}</span>
                <div className="w-5 h-5 rounded-full border border-green-10 frcc">
                  {item.key == isActive && (
                    <div className="w-3 h-3 rounded-full bg-green-10"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
