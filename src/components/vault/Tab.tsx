import React, { useEffect, useMemo, useState, useContext } from "react";
import styles from "./index.module.css";
import { vaultTabList } from "./vaultConfig";

export default function Tab() {
  const [activeTab, setTabActive] = useState("");

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // ipad pro
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <div
      className="frcc lg:fixed w-full h-17 xsm:mt-12"
      style={{
        top: "230px",
        zIndex: "51",
        background: !isMobile ? "#0C171F" : "",
      }}
    >
      <div className="flex items-center lg:w-[1104px] xsm:w-full">
        <div className={`${styles.filterPoolType}`}>
          {vaultTabList().map((item, index) => {
            return (
              <div
                key={`${item.key}_${index}`}
                className={`
                ${
                  item.key == activeTab
                    ? "text-white bg-poolsTypelinearGrayBg rounded"
                    : "text-gray-60"
                }
                 lg:w-29 xsm:w-1/2 lg:h-8 xsm:h-9 frcc text-base relative
              `}
                onClick={() => setTabActive(item.key)}
              >
                <div className="flex flex-col items-start">
                  <div className={`flex items-center`}>
                    <span
                      className={`text-sm  ${
                        item.key == activeTab ? "text-white " : "text-gray-10"
                      }`}
                    >
                      {item.value}
                      <span>({item.count})</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
