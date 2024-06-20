import React, { useState, useEffect } from "react";
import { tabList, classicHeader } from "./config";
import styles from "./classic.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import PoolRow from "../classicPoolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { usePoolSearch } from "@/hooks/usePools";
import PoolDocTips from "@/components/pools/poolDocTips/index";

export default function Classic({ searchValue }: { searchValue: string }) {
  const [isActive, setActive] = useState("");
  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const [isChecked, setIsChecked] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const handlePageChange = (newPage: number, newSize: number) => {
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

  const { poolList, totalItems, isLoading } = usePoolSearch({
    isChecked,
    sortKey: sortMap.key,
    sortOrder: sortMap.sort,
    currentPage,
    isActive,
    searchValue,
  });

  // depency change init currentpage
  useEffect(() => {
    setCurrentPage(1);
  }, [sortMap.key, sortMap.sort, isChecked, isActive, searchValue]);

  return (
    <>
      <PoolDocTips
        tips="Classic pools are based on the Uniswap v2 algorithm.Learn more"
        src="https://guide.ref.finance/products/guides/liquidity-management/classic-pools"
      />
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
                    isActive == item.key
                      ? "text-white bg-gray-100 "
                      : "text-gray-60 bg-poolTabBgOpacity15"
                  }
                  ${styles.tab}
                `}
                  onClick={() => {
                    setActive(item.key);
                    setCurrentPage(1);
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
                onChange={() => {
                  handleCheckboxChange(event);
                  setCurrentPage(1);
                }}
              />
              <span className={styles.checkmark}></span>
              <span className={styles.checkPlaceholder}>
                Hide low TVL pools
              </span>
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
                  key={item.key + Math.random() + index}
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
        <PoolRow list={poolList} loading={isLoading} />

        {/* pagination */}
        <div className="w-276 my-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={100}
            onChangePage={handlePageChange}
            onPageSizeChange={handleSizeChange}
          />
        </div>
      </div>
    </>
  );
}
