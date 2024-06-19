import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { getAccountNearBalance } from "@/services/token";
import poolStyle from "@/components/pools/pool.module.css";
import { SearchIcon, Star } from "@/components/pools/icon";
import Charts from "@/components/pools/charts/charts";
import Classic from "@/components/pools/classicPool/classic";
import Stable from "@/components/pools/stablePool/stablePool";
import Dcl from "@/components/pools/dclPool/dcl";
import CreatePool from "@/components/pools/createPoolModal/index";

export default function Farms() {
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();

  const [isActive, setActive] = useState("classic");
  const poolTypeList = [
    {
      key: "classic",
      value: "Classic",
    },
    {
      key: "stable",
      value: "Stable",
    },
    {
      key: "dcl",
      value: "DCL",
    },
    {
      key: "watchlist",
      value: "Watchlist",
    },
  ];

  const [keyWordsType, setKeyWordsType] = useState("token");
  const [searchValue, setSearchValue] = useState("");

  const sendSearchValue = (e: any) => {
    setSearchValue(e.target.value);
  };

  // create pool
  const [isOpen, setIsOpen] = useState<boolean>(false);
  function showModal() {
    setIsOpen(true);
  }
  function hideModal() {
    setIsOpen(false);
  }

  // map render pool components
  const searchValueToUse = keyWordsType === "token" ? searchValue : "";

  const components = [
    {
      id: "classic",
      Component: Classic,
    },
    {
      id: "stable",
      Component: Stable,
    },
    {
      id: "dcl",
      Component: Dcl,
    },
  ];

  const componentElements = components.map(({ id, Component }) => (
    <div
      key={id}
      className={`${isActive !== id ? "opacity-0 fixed" : "opacity-100"}`}
      style={{ zIndex: isActive !== id ? -100 : undefined }}
    >
      <Component searchValue={searchValueToUse} />
    </div>
  ));

  return (
    <div>
      {/* charts & pools filter */}
      <div className={poolStyle.chartsContainter}>
        {/* charts */}
        <div className="w-full frcc">
          <Charts title="TVL(Total Value Locked)" type="tvl"></Charts>
          <div className="ml-4 mr-4"></div>
          <Charts title="Volume(24h)" type="24h"></Charts>
        </div>

        {/* search input */}
        <div className="w-full frcc mt-4">
          <div className="w-270 flex justify-between">
            {/* pool tab */}
            <div className={poolStyle.filterPoolType}>
              {poolTypeList.map((item, index) => {
                return (
                  <div
                    key={item.key + index}
                    className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-poolsTypelinearGrayBg rounded"
                      : "text-gray-60"
                  }
                   w-25 h-8 frcc text-base 
                `}
                    onClick={() => {
                      setActive(item.key);
                    }}
                  >
                    {item.key == "watchlist" && <Star />}
                    {item.value}
                  </div>
                );
              })}
            </div>

            {/* search & create pool */}
            <div className="frcc">
              <div className={poolStyle.filterSeacrhInputContainer}>
                <div
                  onClick={() => {
                    keyWordsType == "token"
                      ? setKeyWordsType("id")
                      : setKeyWordsType("token");
                    setSearchValue("");
                  }}
                  className={`${poolStyle.filterSearchInputBefore} ${
                    keyWordsType == "token"
                      ? "bg-gray-20 text-gray-50"
                      : "bg-green-10 text-white"
                  }`}
                >
                  #
                </div>
                <input
                  type="text"
                  className={poolStyle.filterSearchInput}
                  placeholder={`Search pool by ${keyWordsType}`}
                  onChange={sendSearchValue}
                  value={searchValue}
                />
                <span className="hover:scale-110">
                  <SearchIcon />
                </span>
              </div>
              <div
                className={`${poolStyle.createPoolButton} ${
                  accountId && isActive == "classic"
                    ? "bg-createPoolLinear text-black cursor-pointer hover:opacity-85"
                    : "text-gray-50 bg-gray-40 cursor-default"
                }`}
                onClick={() => {
                  accountId && isActive == "classic" && showModal();
                }}
              >
                + Create Pool
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* classic dcl stable */}
      <>{componentElements}</>

      {/* watchlist */}

      {/* create pool */}
      <CreatePool isOpen={isOpen} onRequestClose={hideModal} />
    </div>
  );
}
