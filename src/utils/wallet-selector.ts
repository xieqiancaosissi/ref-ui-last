import { map, distinctUntilChanged } from "rxjs";

import { NetworkId, setupWalletSelector } from "@near-wallet-selector/core";
import type { WalletSelector, AccountState } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import type { WalletSelectorModal } from "@near-wallet-selector/modal-ui";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupLedger } from "@near-wallet-selector/ledger";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupNeth } from "@near-wallet-selector/neth";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet";
import { setupKeypom } from "@keypom/selector";
import "@near-wallet-selector/modal-ui/styles.css";
import getConfig from "./config";
import getOrderlyConfig from "./orderlyConfig";
declare global {
  interface Window {
    selector: WalletSelector & { getAccountId: () => string };
    selectorSubscription: any;
    modal: WalletSelectorModal;
    accountId: string;
    sender?: any;
  }
}
interface GetWalletSelectorArgs {
  onAccountChange: (accountId: string) => Promise<void>;
}
export async function getWalletSelector({
  onAccountChange,
}: GetWalletSelectorArgs) {
  const KEYPOM_OPTIONS = {
    beginTrial: {
      landing: {
        title: "Welcome!",
      },
    },
    wallets: [
      {
        name: "MyNEARWallet",
        description: "Secure your account with a Seed Phrase",
        redirectUrl: `https://${
          getConfig().networkId
        }.mynearwallet.com/linkdrop/ACCOUNT_ID/SECRET_KEY`,
        iconUrl: "INSERT_ICON_URL_HERE",
      },
    ],
  };
  const selector = await setupWalletSelector({
    network: getConfig().networkId as NetworkId,
    debug: false,
    modules: [
      setupMyNearWallet(),
      setupHereWallet(),
      setupSender(),
      setupMeteorWallet(),
      setupNearMobileWallet({
        dAppMetadata: {
          name: "ref finance",
          logoUrl: "https://assets.ref.finance/images/REF-black-logo.png",
          url: "https://app.ref.finance",
        },
      }),
      setupNeth({
        gas: "300000000000000",
        bundle: false,
      }) as any,
      setupNightly(),
      setupLedger(),
      setupWalletConnect({
        projectId: "87e549918631f833447b56c15354e450",

        metadata: {
          name: "ref finance",
          description: "Example dApp used by NEAR Wallet Selector",
          url: "https://github.com/ref-finance/ref-ui",
          icons: ["https://avatars.githubusercontent.com/u/37784886"],
        },
        chainId: `near:${getConfig().networkId}`,
      }),
      setupKeypom({
        networkId: getConfig().networkId as NetworkId,
        signInContractId: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
        trialAccountSpecs: {
          url: "/trial-accounts/ACCOUNT_ID#SECRET_KEY",
          modalOptions: KEYPOM_OPTIONS,
        },
        instantSignInSpecs: {
          url: "/#instant-url/ACCOUNT_ID#SECRET_KEY/MODULE_ID",
        },
      }),
    ],
  });
  const modal = setupModal(selector, {
    contractId: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
  });
  const { observable }: { observable: any } = selector.store;
  const subscription = observable
    .pipe(
      map((s: any) => s.accounts),
      distinctUntilChanged()
    )
    .subscribe((nextAccounts: any) => {
      console.info("Accounts Update", nextAccounts);
      window.accountId = nextAccounts[0]?.accountId;
      onAccountChange(window.accountId || "");
    });
  window.selector = selector as WalletSelector & { getAccountId: () => string };
  window.modal = modal;
  window.selectorSubscription = subscription;
}
