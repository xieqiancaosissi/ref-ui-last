import React, { useState } from "react";
import { tabList, classicHeader } from "./config";
import styles from "./classic.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import PoolRow from "../../pools/poolRow/poolRow";

export default function Classic() {
  const [isActive, setActive] = useState("All");
  const [sortMap, setSortMap] = useState({ key: "24h", sort: "desc" });
  const handleSort = (key: string) => {
    if (key === sortMap.key) {
      setSortMap((prevSortMap) => ({
        key: prevSortMap.key,
        sort: prevSortMap.sort === "desc" ? "asc" : "desc",
      }));
    } else {
      setSortMap({ key, sort: "desc" });
    }
  };

  return (
    <div className="fccc w-full mt-8">
      {/*  */}
      <div className="frc w-276 justify-between">
        {/* head tab & hide low tvl pools*/}
        <div className="text-xs cursor-pointer frcc">
          {tabList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  ${
                    isActive == item.value
                      ? "text-white bg-gray-100 "
                      : "text-gray-60 bg-poolTabBgOpacity15"
                  }
                  ${styles.tab}
                `}
                onClick={() => {
                  setActive(item.value);
                }}
              >
                {item.value}
              </div>
            );
          })}
        </div>
        <div className="text-white text-xs cursor-default">
          <label className={styles.customCheckbox}>
            <input type="checkbox" />
            <span className={styles.checkmark}></span>
            <span className={styles.checkPlaceholder}>Hide low TVL pools</span>
          </label>
        </div>
      </div>
      {/* pool */}
      <div className="w-276">
        {/* pool header */}
        <header className={styles.headDiv}>
          <div>Pools</div>
          <div>
            {classicHeader.map((item, index) => {
              return (
                <div
                  key={item.key}
                  className="frcc select-none"
                  onClick={() => handleSort(item.key)}
                >
                  <span>{item.value}</span>
                  <span className="ml-2">
                    {sortMap.key === item.key ? (
                      sortMap.sort === "desc" ? (
                        <DownArrowSelect />
                      ) : (
                        <UpArrow />
                      )
                    ) : (
                      <DownArrow />
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </header>
        {/* pool row */}
        <PoolRow></PoolRow>
      </div>
    </div>
  );
}
