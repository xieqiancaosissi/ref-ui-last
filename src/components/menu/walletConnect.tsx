import { useEffect, useState } from "react";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Tooltip } from "react-tooltip";
import "react-loading-skeleton/dist/skeleton.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { motion } from "framer-motion";
import {
  DownArrowIcon,
  CopyIcon,
  DisconnectIcon,
  ChangeIcon,
  KeyIcon,
} from "./icons";
import { useAccountStore } from "../../stores/account";
import { getCurrentWallet, getSelector } from "../../utils/wallet";
import type { Wallet } from "@near-wallet-selector/core";
import swapStyles from "../swap/swap.module.css";
import AccessKeyModal from "./AccessKeyModal";

export default function WalletConnect() {
  const [accountId, setAccountId] = useState<string | undefined>();
  const [currentWallet, setCurrentWallet] = useState<Wallet>();
  const [loading, setLoading] = useState<boolean>(true);
  const [tipVisible, setTipVisible] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const accountStore = useAccountStore();
  const [keyModalShow, setKeyModalShow] = useState<boolean>(false);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    get_current_wallet();
  }, [accountId]);

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
    window.modal.show();
  }

  async function signOut() {
    await currentWallet?.signOut();
  }

  const getAccountName = (accountId: string) => {
    const [account, network] = accountId.split(".");
    const niceAccountId = `${account.slice(0, 10)}...${network || ""}`;

    return account.length > 10 ? niceAccountId : accountId;
  };

  const variants = {
    open: {
      opacity: 1,
      y: 0,
      height: "calc(100vh - 86px)",
      width: "20%",
      transition: { duration: 0.5 },
    },
    closed: {
      opacity: 0,
      y: "-100%",
      height: 0,
      width: "20%",
      transition: { duration: 0.5 },
    },
  };

  const handleBackdropClick = (e: any) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  function showkeyModal() {
    // document.documentElement.style.overflow = "visible";
    setKeyModalShow(true);
  }

  function closeKeyModal() {
    setKeyModalShow(false);
  }
  return (
    <div className="relative justify-self-end z-50">
      {!loading ? (
        <>
          {accountId ? (
            <div onClick={() => setIsOpen(!isOpen)}>
              <div className="flex items-center justify-center rounded border border-gray-70 px-2.5 cursor-pointer gap-2 h-9">
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
                className={`fixed top-[50px] left-0 w-full h-[calc(100%-86px)] bg-black bg-opacity-50 ${
                  isOpen ? "block" : "hidden"
                }`}
                style={{
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
                onClick={handleBackdropClick}
              ></div>
              <motion.div
                className="fixed top-[50px] bottom-[36px] right-0 bg-dark-10 z-50"
                variants={variants}
                initial="closed"
                animate={isOpen ? "open" : "closed"}
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
                </div>
              </motion.div>
            </div>
          ) : (
            <div
              onClick={showWalletSelector}
              className="flex items-center justify-end h-9 rounded border border-primaryGreen px-4 font-semibold text-primaryGreen cursor-pointer"
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
    </div>
  );
}
