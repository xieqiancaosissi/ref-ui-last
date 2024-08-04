import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Big from "big.js";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useRouter } from "next/router";
import { LogoMobileIcon, MoreMobileIcon, LogoSmallMobileIcon } from "./icons2";
import Bridge from "./bridge";
import { useRefPrice } from "../../hooks/useRefPrice";
import { menuData, IMenuChild, routeMapIds } from "./menuData";
// CSR,
const WalletConnect = dynamic(() => import("./walletConnect"), {
  ssr: false,
});
const BuyNearButton = dynamic(() => import("../buyNear/button"), {
  ssr: false,
});
export default function MenuMobile() {
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [oneLevelMenuId, setOneLevelMenuId] = useState("trade");
  const [twoLevelMenuId, setTwoLevelMenuId] = useState("swap");
  const [twoLevelMenuShow, setTwoLevelMenuShow] = useState<boolean>(true);
  const [oneLevelHoverId, setOneLevelHoverId] = useState<string>();
  const menuList = menuData();
  const router = useRouter();
  const { refPrice, priceLoading } = useRefPrice();
  useEffect(() => {
    const clickEvent = (e: any) => {
      const path = e.composedPath();
      const el = path.find(
        (el: any) => el.id == "menuContent" || el.id == "menuButton"
      );
      if (!el) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener("click", clickEvent);
    return () => {
      document.removeEventListener("click", clickEvent);
    };
  }, []);
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
  function show() {
    setShowMoreMenu(true);
  }
  return (
    <div className="flex items-center px-4 h-[45px] bg-dark-240">
      <div className="flexBetween w-full">
        <LogoMobileIcon />
        <div className="flex items-center gap-4">
          <WalletConnect />
          <MoreMobileIcon onClick={show} id="menuButton" />
        </div>
      </div>
      <div
        className={showMoreMenu ? "" : "hidden"}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          zIndex: 100,
          outline: "none",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <div
          id="menuContent"
          className="absolute right-0 bottom-8 top-0 min-w-[280px] w-3/4 bg-dark-140 py-3"
        >
          {/* top bar */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center h-[26px] rounded-full pl-0.5 pr-2 bg-modalGrayBg gap-1">
              <span className="flex items-center justify-center w-5 h-5 rounded-full px-0.5 border border-dark-100 bg-black">
                <LogoSmallMobileIcon />
              </span>
              {!priceLoading ? (
                <span className="text-white text-sm font-bold">
                  {refPrice && !isNaN(parseFloat(refPrice))
                    ? "$" + Big(refPrice).toFixed(2)
                    : "-"}
                </span>
              ) : (
                <SkeletonTheme
                  baseColor="rgba(106, 114, 121, 0.3)"
                  highlightColor="rgba(255, 255, 255, 0.3)"
                >
                  <Skeleton width={42} height={16} />
                </SkeletonTheme>
              )}
            </div>
            <div className="flex items-center gap-2">
              <BuyNearButton />
              <Bridge />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
