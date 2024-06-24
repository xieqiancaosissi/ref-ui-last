import React, { useState, useEffect } from "react";
import { dclHeader } from "./config";
import styles from "./dcl.module.css";
import { DownArrow, UpArrow, DownArrowSelect } from "../icon";
import { ExclamationIcon } from "@/components/common/Icons";
import PoolRow from "../dclPoolRow/poolRow";
import Pagination from "@/components/pagination/pagination";
import { usePoolSearch } from "@/hooks/usePools";
import HoverTip from "@/components/common/Tips/index";
import PoolDocTips from "@/components/pools/poolDocTips/index";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import NoContent from "@/components/common/NoContent";

export default function Classic({
  searchValue,
  pureIdList,
}: {
  searchValue: string;
  pureIdList: any;
}) {
  const [isActive, setActive] = useState("");
  const [sortMap, setSortMap] = useState({ key: "tvl", sort: "desc" });
  const [isChecked, setIsChecked] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);

  const handleCheckboxChange = (event: any) => {
    setIsChecked(event.target.checked);
  };
  const handlePageChange = (newPage: number, newSize: number) => {
    setCurrentPage(newPage);
    !isLoading &&
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
    <>
      <PoolDocTips
        tips="Discretized Concentrated Liquidity (DCL) pools."
        src="https://guide.ref.finance/products/guides/liquidity-management/ref-v2-pools"
      />
      <div className="flex flex-col items-center  w-full mt-8">
        {/*  */}
        <div className="frc w-276 justify-between">
          {/* head tab & hide low tvl pools*/}
          <div className="text-xs cursor-pointer frcc"></div>
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
            {dclHeader.map((item, index) => {
              return (
                <div
                  key={item.key}
                  className="frcc select-none"
                  onClick={() => handleSort(item.key)}
                >
                  {item.tip && (
                    <HoverTip msg={item.tipMsg} extraStyles={"w-78"} />
                  )}
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
        {/* {isLoading ? (
          <SkeletonTheme
            baseColor="rgba(33, 43, 53, 0.3)"
            highlightColor="#2A3643"
          >
            <Skeleton width={1100} height={56} count={5} className="mt-4" />
          </SkeletonTheme>
        ) : (
          <PoolRow
            list={poolList}
            loading={isLoading}
            pureIdList={pureIdList}
          />
        )} */}

        {poolList.length > 0 ? (
          <PoolRow
            list={poolList}
            loading={isLoading}
            pureIdList={pureIdList}
          />
        ) : (
          <NoContent />
        )}

        {/* pagination */}
        <div className="w-276 my-4">
          <Pagination
            totalItems={totalItems}
            itemsPerPage={20}
            onChangePage={handlePageChange}
            onPageSizeChange={handleSizeChange}
          />
        </div>
      </div>
    </>
  );
}
