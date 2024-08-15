import { useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Tooltip } from "react-tooltip";
import "react-loading-skeleton/dist/skeleton.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { twMerge } from "tailwind-merge";
import {
  DownArrowIcon,
  CopyIcon,
  DisconnectIcon,
  ChangeIcon,
  KeyIcon,
  TotalAssetsIcon,
} from "./icons";
import { useAccountStore } from "../../stores/account";
import { getCurrentWallet, getSelector } from "../../utils/wallet";
import type { Wallet } from "@near-wallet-selector/core";
import swapStyles from "../swap/swap.module.css";
import AccessKeyModal from "./AccessKeyModal";
import { useAppStore } from "@/stores/app";
import { showWalletSelectorModal } from "@/utils/wallet";
import { isMobile, useClientMobile } from "@/utils/device";
import InitData from "@/components/orderbook/initData";
import Guider from "./Guider";
import { LinkLine } from "./icons2";
const Overview = dynamic(() => import("../portfolio"), { ssr: false });
const is_mobile = isMobile();
export default function WalletConnect() {
  const [accountId, setAccountId] = useState<string | undefined>();
  const [currentWallet, setCurrentWallet] = useState<Wallet>();
  const [loading, setLoading] = useState<boolean>(true);
  const [tipVisible, setTipVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [keyModalShow, setKeyModalShow] = useState<boolean>(false);
  const appStore = useAppStore();
  const accountStore = useAccountStore();
  const [hover, setHover] = useState(false);
  const isSignedIn = accountStore.isSignedIn;
  const isInMemePage = window.location.pathname.includes("meme");
  const isMobile = useClientMobile();
  const [showGuider, setShowGuider] = useState<boolean>(
    !!(localStorage.getItem("ACCESS_MODAL_GUIDER") !== "1" && accountId)
  );
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const isKeyPomWallet = selectedWalletId == "keypom";
  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (accountId) {
      const guiderCondition =
        localStorage.getItem("ACCESS_MODAL_GUIDER") !== "1";
      setShowGuider(guiderCondition);
    }
  }, [accountId]);

  useEffect(() => {
    get_current_wallet();
  }, [selectedWalletId]);

  useEffect(() => {
    if (
      !window?.sender?.near ||
      getSelector()?.store?.getState()?.selectedWalletId !== "sender"
    )
      return;
    window?.sender?.near?.on(
      "accountChanged",
      async (changedAccountId: string) => {
        if (accountId !== changedAccountId) {
          window.location.reload();
        }
      }
    );
  }, [window?.sender, accountId]);

  useEffect(() => {
    let timer: any;
    if (tipVisible) {
      timer = setTimeout(() => {
        setTipVisible(false);
      }, 1000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [tipVisible]);

  async function init() {
    const { getWalletSelector } = await import("../../utils/wallet-selector");
    await getWalletSelector({ onAccountChange: changeAccount });
    setLoading(false);
  }

  async function changeAccount(accountId: string) {
    accountStore.setAccountId(accountId);
    accountStore.setIsSignedIn(!!accountId);
    accountStore.setWalletLoading(false);
    setAccountId(accountId);
  }

  async function get_current_wallet() {
    const wallet = await getCurrentWallet();
    setCurrentWallet(wallet);
  }

  function showWalletSelector() {
    setIsOpen(false);
    showWalletSelectorModal(appStore.setShowRiskModal);
  }

  async function signOut() {
    setIsOpen(false);
    await currentWallet?.signOut();
  }

  const getAccountName = (accountId: string) => {
    const [account, network] = accountId.split(".");
    const niceAccountId = `${account.slice(0, 10)}...${network || ""}`;

    return account.length > 10 ? niceAccountId : accountId;
  };

  const handleBackdropClick = (e: any) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  function showkeyModal() {
    setIsOpen(false);
    setKeyModalShow(true);
  }

  function closeKeyModal() {
    setKeyModalShow(false);
  }

  function clearGuilder() {
    setShowGuider(false);
    localStorage.setItem("ACCESS_MODAL_GUIDER", "1");
  }
  return (
    <div className="relative z-50">
      {!loading ? (
        <>
          {accountId ? (
            <div onClick={() => setIsOpen(!isOpen)}>
              <div className="flex items-center justify-center rounded border border-gray-70 px-2.5 cursor-pointer gap-2 h-9 xsm:h-8">
                {currentWallet?.metadata?.iconUrl ? (
                  <Image
                    src={currentWallet?.metadata?.iconUrl || ""}
                    width={14}
                    height={14}
                    style={{
                      width: "14px",
                      height: "14px",
                    }}
                    alt=""
                  />
                ) : null}

                <span className="text-sm text-lightWhite-10 font-semibold">
                  {getAccountName(accountId)}
                </span>
                <DownArrowIcon className="ml-1 relative top-0.5" />
              </div>
              {/* Click menu */}
              <div
                className={`fixed top-[46px] left-0 w-full h-[calc(100%-78px)] bg-black bg-opacity-50  ${
                  isOpen ? "block" : "hidden"
                }`}
                style={{
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
                onClick={handleBackdropClick}
              ></div>
              <div
                className={`fixed top-[46px] bottom-[35px] right-0 bg-dark-10 z-50 ${
                  isOpen ? "block" : "hidden"
                } ${is_mobile ? "w-full h-[300px]" : "w-[400px] h-auto"}`}
                onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
              >
                <div className="bg-dark-140 lg:border lg:border-gray-200 p-3.5 w-full h-full xsm:bg-dark-10">
                  <div className="frcb mb-3.5">
                    <div className="frcc">
                      {currentWallet?.metadata?.iconUrl ? (
                        <Image
                          src={currentWallet.metadata.iconUrl || ""}
                          width={14}
                          height={14}
                          style={{
                            width: "14px",
                            height: "14px",
                          }}
                          alt=""
                        />
                      ) : null}
                      <p className="ml-0.5 text-base text-gray-80">
                        {currentWallet?.metadata?.name}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <KeyIcon
                        onClick={showkeyModal}
                        className={swapStyles.controlButton}
                      />
                      <ChangeIcon
                        onClick={() => {
                          if (!isKeyPomWallet) {
                            showWalletSelector();
                          }
                        }}
                        className={` text-gray-10  ${
                          isKeyPomWallet
                            ? " cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:text-lightWhite-10"
                        }`}
                      />
                      <DisconnectIcon
                        onClick={() => {
                          if (!isKeyPomWallet) {
                            signOut();
                          }
                        }}
                        className={` text-gray-10  ${
                          isKeyPomWallet
                            ? " cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:text-lightWhite-10"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="frcc">
                    <span className="text-xl text-lightWhite-10 font-bold whitespace-nowrap mr-3">
                      {getAccountName(accountId)}
                    </span>
                    <div
                      data-tooltip-id="copy-tooltip"
                      data-tooltip-content={`${tipVisible ? "Copied" : ""}`}
                    >
                      <CopyToClipboard text={accountId}>
                        <CopyIcon
                          className={swapStyles.controlButton}
                          onClick={() => {
                            setTipVisible(true);
                          }}
                        />
                      </CopyToClipboard>
                      <Tooltip
                        id="copy-tooltip"
                        style={{
                          color: "#fff",
                          padding: "4px",
                          fontSize: "12px",
                          background: "#7E8A93",
                        }}
                        openOnClick
                      />
                    </div>
                  </div>
                  <Overview />
                </div>
              </div>
              {(isSignedIn && hover) || (showGuider && !isInMemePage) ? (
                <div
                  className={`absolute top-14 pt-2 right-0 w-64 xsm:hidden`}
                  style={{ zIndex: showGuider ? "1000" : "40" }}
                >
                  <div
                    className={`fixed top-[46px] bottom-[35px] right-0 bg-dark-10 z-40`}
                    style={{ width: "400px" }}
                    onClick={(e) => e.stopPropagation()} // Prevent click inside from closing
                  >
                    <div className="bg-dark-140 border border-gray-200 p-3.5 w-full h-full">
                      <div className="frcb mb-3.5">
                        <div className="frcc">
                          {currentWallet?.metadata?.iconUrl ? (
                            <Image
                              src={currentWallet.metadata.iconUrl || ""}
                              width={14}
                              height={14}
                              style={{
                                width: "14px",
                                height: "14px",
                              }}
                              alt=""
                            />
                          ) : null}
                          <p className="ml-0.5 text-base text-gray-80">
                            {currentWallet?.metadata?.name}
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <KeyIcon
                            onClick={showkeyModal}
                            className={swapStyles.controlButton}
                          />
                          <ChangeIcon
                            onClick={showWalletSelector}
                            className={swapStyles.controlButton}
                          />
                          <DisconnectIcon
                            onClick={signOut}
                            className={swapStyles.controlButton}
                          />
                        </div>
                      </div>
                      <div className="frcc blur">
                        <span className="text-xl text-lightWhite-10 font-bold whitespace-nowrap mr-3">
                          {getAccountName(accountId)}
                        </span>
                        <div
                          data-tooltip-id="copy-tooltip"
                          data-tooltip-content={`${tipVisible ? "Copied" : ""}`}
                        >
                          <CopyToClipboard text={accountId}>
                            <CopyIcon
                              className={swapStyles.controlButton}
                              onClick={() => {
                                setTipVisible(true);
                              }}
                            />
                          </CopyToClipboard>
                          <Tooltip
                            id="copy-tooltip"
                            style={{
                              color: "#fff",
                              padding: "4px",
                              fontSize: "12px",
                              background: "#7E8A93",
                            }}
                            openOnClick
                          />
                        </div>
                      </div>
                      <div className="blur">
                        <Overview />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
              <InitData />
            </div>
          ) : (
            <div
              onClick={showWalletSelector}
              className="flex items-center justify-end h-9 text-sm rounded border border-primaryGreen px-4 font-semibold text-primaryGreen cursor-pointer"
            >
              Connect Wallet
            </div>
          )}
        </>
      ) : (
        <SkeletonTheme baseColor="#1B242C" highlightColor="#9EFF00">
          <Skeleton height={36} width={138} />
        </SkeletonTheme>
      )}

      {accountId && keyModalShow ? (
        <AccessKeyModal isOpen={keyModalShow} onRequestClose={closeKeyModal} />
      ) : null}
      {showGuider && !isMobile && !isInMemePage ? (
        <div className="xsm:hidden">
          <Guider clearGuilder={clearGuilder} />
          <LinkLine
            className="absolute"
            style={{ zIndex: "1001", right: "76px", top: "82px" }}
          />
        </div>
      ) : null}
    </div>
  );
}
