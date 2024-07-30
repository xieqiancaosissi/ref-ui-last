import { useEffect, useState } from "react";
import { useAccountStore } from "@/stores/account";
import { getAccountNearBalance } from "@/services/token";
import poolStyle from "@/components/pools/pool.module.css";
import { SearchIcon, Star, MobileArrowUp } from "@/components/pools/icon";
import Charts from "@/components/pools/charts/charts";
import Classic from "@/components/pools/classicPool/classic";
import Stable from "@/components/pools/stablePool/stablePool";
import Dcl from "@/components/pools/dclPool/dcl";
import CreatePool from "@/components/pools/createPoolModal/index";
import _ from "lodash";
import { useRiskTokens } from "@/hooks/useRiskTokens";
import { usePoolStore } from "@/stores/pool";
import ClassicFilterTabModal from "@/components/pools/classicPool/classicFilterTabModal";

export default function Farms() {
  const accountStore = useAccountStore();
  const accountId = accountStore.getAccountId();
  const poolStore = usePoolStore();
  const [isActive, setActive] = useState(poolStore.poolActiveTab);
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
      key: "degen",
      value: "Degen",
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
  const [mobilePros, setMobilePros] = useState<any>({});
  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 500);

  const sendSearchValue = (e: any) => {
    setSearchValue(e.target.value);
    debouncedSendSearchValue(e);
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

  const { pureIdList } = useRiskTokens();

  const pure = pureIdList;
  const componentElements = components.map(
    ({ id, Component }) => (
      <div
        key={id}
        className={`${isActive !== id ? "opacity-0 fixed" : "opacity-100"}`}
        style={{ zIndex: isActive !== id ? -100 : undefined }}
      >
        <Component
          searchValue={searchValueToUse}
          pureIdList={pure}
          mobilePros={mobilePros}
        />
      </div>
    )

    // {
    //   return (
    //     isActive == id && (
    //       <Component searchValue={searchValueToUse} pureIdList={pure} />
    //     )
    //   );
    // }
  );

  const [classicOpen, setClassicOpen] = useState(false);
  useEffect(() => {
    if (mobilePros?.which == "classicTabChange") {
      // setSearchValue()
    }
  }, [mobilePros]);

  return (
    <>
      {/* PC */}
      <div className="xsm:hidden">
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
                      : "text-gray-50 bg-gray-40 cursor-not-allowed"
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

      {/* Mobile */}
      <div className="lg:hidden  my-4 px-4 box-border">
        <div className="w-full flex items-center ">
          <div className={poolStyle.filterPoolType}>
            {poolTypeList.map((item, index) => {
              return (
                <>
                  <div
                    key={item.key + index}
                    className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-poolsTypelinearGrayBg rounded"
                      : "text-gray-60"
                  }
                   w-1/4 max-w-25 h-8 frcc text-base 
                  
                   ${item.key == "watchlist" && "xsm:hidden"}
                `}
                    onClick={() => {
                      setActive(item.key);
                    }}
                  >
                    {item.key == "watchlist" && <Star />}
                    {item.value}
                  </div>
                </>
              );
            })}
          </div>
          <div
            className={`lg:hidden w-9 h-9 frcc border border-gray-90 rounded ml-0.5 mr-3 flex-shrink-0 ${
              isActive == "watchlist"
                ? "text-white bg-poolsTypelinearGrayBg rounded"
                : "text-gray-60"
            }`}
            onClick={() => {
              setActive("watchlist");
            }}
          >
            <Star />
          </div>
        </div>
        {/* search & create pool */}
        <div className="flex items-center my-4">
          {/* <div className={poolStyle.filterSeacrhInputContainer}>
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
          </div> */}
          <div className="frcc w-9 h-9 border border-gray-40 rounded">
            <SearchIcon />
          </div>

          {/* isActive == 'classic' */}
          {isActive == "classic" && (
            <div className="w-65 mx-1">
              <div
                style={{
                  background: "rgba(126, 138, 147, 0.1)",
                }}
                className="flex justify-between items-center w-30 h-9 text-white border border-gray-40 rounded px-2 text-sm font-normal"
                onClick={() => {
                  setClassicOpen(true);
                }}
              >
                <span>{mobilePros?.key?.value || "All"}</span>
                <MobileArrowUp></MobileArrowUp>
              </div>
            </div>
          )}

          {/* create pool */}
          <div
            className={`frcc w-9 h-9 border border-gray-40 rounded text-3xl mx-2 ${
              accountId && isActive == "classic"
                ? "text-gray-60 cursor-pointer"
                : "text-gray-40 bg-gray-60 cursor-not-allowed"
            }`}
            onClick={() => {
              accountId && isActive == "classic" && showModal();
            }}
          >
            +
          </div>
        </div>

        {/* classic dcl stable */}
        <>{componentElements}</>

        <div className={poolStyle.chartsContainter}>
          {/* charts */}
          <div className="w-full fccc">
            <Charts title="TVL(Total Value Locked)" type="tvl"></Charts>
            <div className="my-4"></div>
            <Charts title="Volume(24h)" type="24h"></Charts>
          </div>
        </div>

        {/* watchlist */}

        {/* create pool */}
        <CreatePool isOpen={isOpen} onRequestClose={hideModal} />
      </div>

      {/* classic */}

      <ClassicFilterTabModal
        isOpen={classicOpen}
        onRequestClose={() => {
          setClassicOpen(false);
        }}
        setMobilePros={setMobilePros}
      ></ClassicFilterTabModal>
    </>
  );
}
