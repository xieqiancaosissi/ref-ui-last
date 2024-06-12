import React, { useState, useEffect } from "react";
import { tabList, classicHeader } from "./config";
import styles from "./classic.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import PoolRow from "../../pools/poolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { getSearchResult } from "@/services/pool";

export default function Classic() {
  const [isActive, setActive] = useState("All");
  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const [isChecked, setIsChecked] = useState(false);
  const [poolList, setPoolList] = useState([]);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [totalItems, setTotalItems] = useState(0);
  const handlePageChange = ({
    newPage,
    newSize,
  }: {
    newPage: any;
    newSize: any;
  }) => {
    setCurrentPage(newPage);
  };
  const handleSizeChange = (newSize: number) => {
    setPageSize(newSize);
  };
  // pagination end

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };

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

  useEffect(() => {
    getSearchResult({
      type: "classic",
      sort: sortMap.key,
      limit: "100",
      offset: "0",
      farm: isActive == "farm",
      hide_low_pool: isChecked,
      order: sortMap.sort,
      token_type: "",
      token_list: "",
      pool_id_list: "",
      onlyUseId: false,
    }).then((res: any) => {
      if (res.total > 0) {
        setTotalItems(res.total);
        setPoolList(res.list);
      }
    });
  }, [isChecked]);

  return (
    <div className="flex flex-col items-center  w-full mt-8">
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
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
            <span className={styles.checkmark}></span>
            <span className={styles.checkPlaceholder}>Hide low TVL pools</span>
          </label>
        </div>
      </div>

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
      <PoolRow list={poolList} />
      {/* pagination */}
      <div className="w-276 mt-4">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={pageSize}
          onChangePage={handlePageChange}
          onPageSizeChange={handleSizeChange}
        />
      </div>
    </div>
  );
}
