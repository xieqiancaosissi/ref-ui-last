import React, { useState, useEffect } from "react";
import { dclHeader } from "./config";
import styles from "./dcl.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import { ExclamationIcon } from "@/components/common/Icons";
import PoolRow from "../dclPoolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { usePoolSearch } from "@/hooks/usePools";
import HoverTip from "@/components/common/Tips/index";

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
    poolType: "dcl",
  });

  // depency change init currentpage
  useEffect(() => {
    setCurrentPage(1);
  }, [sortMap.key, sortMap.sort, isChecked, isActive, searchValue]);

  return (
    <div className="flex flex-col items-center  w-full ">
      {/*  */}
      <div className={styles.dclTips}>
        <div>
          <ExclamationIcon />
          <span className="mx-1">
            Discretized Concentrated Liquidity (DCL) pools.
          </span>
          <span
            className={styles.learnMore}
            onClick={() => {
              window.open(
                "https://guide.ref.finance/products/guides/liquidity-management/ref-v2-pools",
                "_blank"
              );
            }}
          >
            Learn more
          </span>
        </div>
      </div>

      {/* pool header */}
      <header className={styles.headDiv}>
        <div>Pools</div>
        <div>
          {dclHeader.map((item, index) => {
            return (
              <div
                key={item.key}
                className="frcc select-none"
                onClick={() => handleSort(item.key)}
              >
                {item.tip && <HoverTip msg={item.tipMsg} />}
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
      <div className="w-276 mt-4">
        <Pagination
          totalItems={totalItems}
          itemsPerPage={100}
          onChangePage={handlePageChange}
          onPageSizeChange={handleSizeChange}
        />
      </div>
    </div>
  );
}
