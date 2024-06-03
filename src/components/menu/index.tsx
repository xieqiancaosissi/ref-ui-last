import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { ArrowIcon } from "./icons";
import { menuData } from "./menuData";
const WalletConnect = dynamic(() => import("./walletConnect"), {
  ssr: false,
});

export default function Menu() {
  const [oneLevelMenuId, setOneLevelMenuId] = useState("trade");
  const [twoLevelMenuId, setTwoLevelMenuId] = useState("swap");
  const [twoLevelMenuShow, setTwoLevelMenuShow] = useState<boolean>(true);
  const menuList = menuData();
  const oneLevelData = useMemo(() => {
    let oneLevel;
    if (oneLevelMenuId) {
      oneLevel = menuList.find((item) => item.id === oneLevelMenuId);
    }
    return oneLevel;
  }, [oneLevelMenuId, menuList]);
  function chooseOneLevelMenu(id: string) {
    const choosedMenu = menuList.find((menu) => menu.id === id);
    if (oneLevelMenuId === id) {
      if (choosedMenu?.children) {
        setTwoLevelMenuShow(!twoLevelMenuShow);
      }
      return;
    }
    setOneLevelMenuId(id);
    if (choosedMenu?.children) {
      setTwoLevelMenuShow(true);
    }
  }
  function chooseTwoLevelMenu(id: string) {
    setTwoLevelMenuId(id);
  }
  return (
    <div>
      {/* one level menu */}
      <div
        className="flex items-center justify-between text-white px-5"
        style={{ height: "50px" }}
      >
        <Image src="/images/logo.svg" width={127} height={17} alt="" />
        <div className="flex items-center gap-12">
          {menuList.map((menu) => {
            return (
              <div
                key={menu.id}
                className={`flex items-center gap-1.5 cursor-pointer ${
                  oneLevelMenuId === menu.id ? "text-green-10" : "text-gray-10"
                }`}
                onClick={() => {
                  chooseOneLevelMenu(menu.id);
                }}
              >
                {menu.label}
                {menu.children ? (
                  <ArrowIcon
                    className={`${
                      oneLevelMenuId === menu.id && twoLevelMenuShow
                        ? "transform rotate-180"
                        : ""
                    }`}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
        <WalletConnect />
      </div>
      {/* two level menu */}
      {oneLevelData?.children ? (
        <div
          className={`flex items-center justify-center bg-gray-20 bg-opacity-40 gap-6 border-b border-white border-opacity-10 ${
            twoLevelMenuShow ? "" : "hidden"
          }`}
          style={{ height: "50px" }}
        >
          {oneLevelData.children.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => {
                  chooseTwoLevelMenu(item.id);
                }}
                className={`flex items-center h-9 rounded cursor-pointer font-bold text-base gap-2 px-5 border-2 ${
                  twoLevelMenuId === item.id
                    ? "bg-gray-40 text-white border-gray-40"
                    : "text-gray-10  border-gray-30"
                }`}
              >
                <span
                  className={`${
                    twoLevelMenuId === item.id ? "text-primaryGreen" : ""
                  }`}
                >
                  {item.icon}
                </span>{" "}
                {item.label}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
