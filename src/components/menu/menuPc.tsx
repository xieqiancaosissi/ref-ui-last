import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/router";
import { MenuContainer } from "./icons";
import Bridge from "./bridge";
import { menuData, IMenuChild, routeMapIds } from "./menuData";
// CSR,
const WalletConnect = dynamic(() => import("./walletConnect"), {
  ssr: false,
});
const BuyNearButton = dynamic(() => import("../buyNear/button"), {
  ssr: false,
});
export default function MenuPc() {
  const [oneLevelMenuId, setOneLevelMenuId] = useState("trade");
  const [twoLevelMenuId, setTwoLevelMenuId] = useState("swap");
  const [twoLevelMenuShow, setTwoLevelMenuShow] = useState<boolean>(true);
  const [oneLevelHoverId, setOneLevelHoverId] = useState<string>();
  const menuList = menuData();
  const router = useRouter();
  const oneLevelData = useMemo(() => {
    let oneLevel;
    if (oneLevelHoverId) {
      oneLevel = menuList.find((item) => item.id === oneLevelHoverId);
    }
    return oneLevel;
  }, [oneLevelHoverId, menuList]);
  useEffect(() => {
    chooseMenuByRoute(router.route);
  }, [router.route]);
  function chooseOneLevelMenu(id: string) {
    const choosedMenu = menuList.find((menu) => menu.id === id);
    if (!choosedMenu) {
      return;
    }
    if (oneLevelMenuId === id) {
      if (choosedMenu?.children) {
        setTwoLevelMenuShow(!twoLevelMenuShow);
      }
      return;
    }
    setOneLevelMenuId(id);
    if (choosedMenu?.children) {
      setTwoLevelMenuShow(true);
    } else if (choosedMenu?.path) {
      router.push(choosedMenu.path);
      setTwoLevelMenuId("");
    }
  }
  function chooseTwoLevelMenu(item: IMenuChild) {
    setTwoLevelMenuId(item.id);
    if (item.path) {
      router.push(item.path);
    } else if (item.externalLink) {
      window.open(item.externalLink);
    }
  }
  function chooseMenuByRoute(route: string) {
    const target = Object.entries(routeMapIds).find(([, value]) => {
      return value.includes(route);
    });
    if (target) {
      const arr = target[0].split("-");
      setOneLevelMenuId(arr[0]);
      if (arr[1]) {
        setTwoLevelMenuId(arr[1]);
      } else {
        setTwoLevelMenuId("");
      }
    }
  }
  // for stable detail css style
  const [extraBack, setExtraBack] = useState("transparent");
  const [extraWidth, setExtraWidth] = useState("60%");
  useEffect(() => {
    setExtraBack("transparent");
    setExtraWidth("60%");
    if (
      router.route.indexOf("pool/stable") != -1 ||
      router.route.indexOf("yours") != -1
    ) {
      setExtraBack("rgba(33, 43, 53, 0.4)");
      setExtraWidth("100%");
    }
  }, [router.route]);
  return (
    <div className="fixed w-full" style={{ zIndex: "99" }}>
      <div
        className="grid grid-cols-3 items-center text-white px-5 border-b border-white border-opacity-10 bg-primaryDark"
        style={{ height: "46px" }}
      >
        <Image src="/images/logo.svg" width={127} height={17} alt="" />
        {/* one level menu */}
        <div className="justify-self-center flex items-center gap-12">
          {menuList.map((menu) => {
            return (
              <div
                key={menu.id}
                className={`flex items-center gap-1.5 cursor-pointer font-bold text-base hover:text-green-10 ${
                  oneLevelMenuId === menu.id ? "text-green-10" : "text-gray-10"
                }`}
                onClick={() => {
                  if (menu.path && !menu.children) {
                    chooseOneLevelMenu(menu.id);
                  }
                }}
                onMouseEnter={() => {
                  setOneLevelHoverId(menu.id);
                }}
              >
                {menu.icon}
                {menu.label}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2.5 justify-self-end">
          <BuyNearButton />
          <Bridge />
          <WalletConnect />
        </div>
      </div>
      {/* two level menu */}
      {oneLevelData?.children ? (
        <div
          className={`flex items-center justify-center relative gap-6 z-40 ${
            twoLevelMenuShow ? "" : "hidden"
          }`}
          style={{
            height: "46px",
            background: extraBack,
            width: extraWidth,
            margin: "0 auto",
          }}
          onMouseLeave={() => {
            setOneLevelHoverId("");
          }}
        >
          {oneLevelData.children.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => {
                  chooseTwoLevelMenu(item);
                }}
                className={`flex items-center h-9 rounded cursor-pointer text-base gap-2 px-5 hover:text-white ${
                  twoLevelMenuId === item.id ? "text-white" : "text-gray-10"
                }`}
              >
                <span
                  className={`${
                    twoLevelMenuId === item.id ? "text-white" : ""
                  }`}
                >
                  {item.icon}
                </span>{" "}
                {item.label}
              </div>
            );
          })}
          <MenuContainer
            className={`absolute transform ${
              oneLevelData.children.length > 3 ? "scale-x-100" : "scale-x-75"
            }`}
            style={{ zIndex: "-1", backdropFilter: "blur(6px)" }}
          />
        </div>
      ) : null}
    </div>
  );
}
