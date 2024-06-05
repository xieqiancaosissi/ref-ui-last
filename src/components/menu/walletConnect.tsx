import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Tooltip } from "react-tooltip";
import "react-loading-skeleton/dist/skeleton.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { motion } from "framer-motion";
import { DownArrowIcon, CopyIcon, DisconnectIcon, ChangeIcon } from "./icons";
import { useAccountStore } from "../../stores/account";
import { getCurrentWallet, getSelector } from "../../utils/wallet";
import type { Wallet } from "@near-wallet-selector/core";

export default function WalletConnect() {
  const [accountId, setAccountId] = useState<string | undefined>();
  const [currentWallet, setCurrentWallet] = useState<Wallet>();
  const [hover, setHover] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tipVisible, setTipVisible] = useState<boolean>(false);
  const accountStore = useAccountStore();
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
    open: { opacity: 1, height: "auto", transition: { duration: 0.5 } },
    closed: { opacity: 0, height: 0, transition: { duration: 0.5 } },
  };
  return (
    <div className="relative justify-self-end z-50">
      {!loading ? (
        <>
          {accountId ? (
            <div
              onMouseEnter={() => {
                setHover(true);
              }}
              onMouseLeave={() => {
                setHover(false);
              }}
            >
              <div className="flex items-center justify-center rounded border border-gray-70 px-2.5 cursor-pointer gap-2 h-9">
                {currentWallet?.metadata?.iconUrl ? (
                  <Image
                    src={currentWallet?.metadata?.iconUrl || ""}
                    width={14}
                    height={14}
                    alt=""
                  />
                ) : null}

                <span className="text-sm text-lightWhite-10 font-semibold">
                  {getAccountName(accountId)}
                </span>
                <DownArrowIcon className="ml-1 relative top-0.5" />
              </div>
              {/* hover menu */}
              <motion.div
                variants={variants}
                initial="closed"
                animate={hover ? "open" : "closed"}
              >
                <div className="absolute top-9 pt-1 right-0">
                  <div
                    className={`flex justify-between items-start rounded-xl bg-dark-10 border border-gray-70 py-5 ${
                      hover ? "" : "hidden"
                    }`}
                  >
                    <div className="flex flex-col pl-5">
                      <div className="flex items-center gap-1.5">
                        {currentWallet?.metadata?.iconUrl ? (
                          <Image
                            src={currentWallet.metadata.iconUrl}
                            width={14}
                            height={14}
                            alt=""
                          />
                        ) : null}

                        <span className="text-sm text-gray-80 whitespace-nowrap">
                          {currentWallet?.metadata?.name}
                        </span>
                      </div>
                      <div className="flex items-center mt-0.5 gap-1.5">
                        <span className="text-base text-lightWhite-10 font-bold  whitespace-nowrap">
                          {getAccountName(accountId)}
                        </span>
                        <div
                          data-tooltip-id="copy-tooltip"
                          data-tooltip-content={`${tipVisible ? "Copied" : ""}`}
                        >
                          <CopyToClipboard text={accountId}>
                            <CopyIcon
                              className="controlButton"
                              onClick={() => {
                                setTipVisible(true);
                              }}
                            />
                          </CopyToClipboard>
                          <Tooltip
                            id="copy-tooltip"
                            style={{
                              backgroundColor: "transparent",
                              color: "#fff",
                              padding: "0",
                              fontSize: "12px",
                            }}
                            openOnClick
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center pr-5 ml-10 gap-4">
                      <ChangeIcon
                        onClick={showWalletSelector}
                        className="controlButton"
                      />
                      <DisconnectIcon
                        onClick={signOut}
                        className="controlButton"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          ) : (
            <div
              onClick={showWalletSelector}
              className="flex items-center  justify-end h-9 rounded border border-primaryGreen px-4 font-semibold text-primaryGreen cursor-pointer"
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
    </div>
  );
}
