import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getWalletSelector } from "../../utils/wallet-selector";
import { DownArrowIcon, CopyIcon, DisconnectIcon, ChangeIcon } from "./icons";
import { useAccountStore } from "../../stores/account";
import { getCurrentWallet, getSelector } from "../../utils/wallet";
import type { Wallet } from "@near-wallet-selector/core";

export default function WalletConnect() {
  const [accountId, setAccountId] = useState<string | undefined>();
  const [currentWallet, setCurrentWallet] = useState<Wallet>();
  const [hover, setHover] = useState<boolean>(false);
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
  async function init() {
    await getWalletSelector({ onAccountChange: changeAccount });
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
  return (
    <div className="relative">
      {/* login in  */}
      {accountId ? (
        <div
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
        >
          <div className="flex items-center justify-center rounded border border-gray-70 h-9 px-2.5 cursor-pointer gap-2">
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
                  <CopyIcon className="controlButton" />
                </div>
              </div>
              <div className="flex items-center pr-5 ml-10 gap-4">
                <ChangeIcon
                  onClick={showWalletSelector}
                  className="controlButton"
                />
                <DisconnectIcon onClick={signOut} className="controlButton" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={showWalletSelector}
          className="flex items-center justify-center h-9 rounded border border-primaryGreen px-4 font-semibold text-primaryGreen cursor-pointer"
        >
          Connect Wallet
        </div>
      )}
    </div>
  );
}
