import React, { useEffect, useState } from "react";
import styles from "../yours.module.css";
import { ItemNumDivActive, ItemNumDivDisable } from "../icon";

export default function YoursTab(props: any) {
  const { setCurrentModule } = props;
  const [isActive, setActive] = useState("pools");
  const YoursTabsList = [
    {
      key: "pools",
      value: "Pools",
    },
    {
      key: "farms",
      value: "Farms",
    },
  ];
  return (
    <div
      className="bg-dark-45 w-full h-17 fixed frcc"
      style={{
        top: "232px",
        zIndex: "99",
      }}
    >
      <div className="flex items-center w-276">
        <div className={styles.filterPoolType}>
          {YoursTabsList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-poolsTypelinearGrayBg rounded"
                      : "text-gray-60"
                  }
                   w-29 h-8 frcc text-base relative
                `}
                onClick={() => {
                  setActive(item.key);
                  setCurrentModule(item.key);
                }}
              >
                {item.value}
                {/* tag */}
                <div
                  className={
                    isActive == item.key ? styles.tagActive : styles.tagDisable
                  }
                >
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
