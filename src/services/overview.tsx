import { useEffect, useState } from "react";
import {
  ftGetBalance,
  ftGetTokenMetadata,
  getAccountNearBalance,
  getGlobalWhitelist,
  getWhitelistedTokensAndNearTokens,
} from "./token";
import { defaultTokenList, getAuroraConfig } from "@/utils/auroraConfig";
import { Near, WalletConnection, keyStores } from "near-api-js";
import getConfig from "@/utils/config";
import { keyStore } from "@/utils/orderlyUtils";
import { getAccount } from "@/utils/near";
import { nearMetadata } from "./wrap-near";
import { toReadableNumber } from "@/utils/numbers";

class AuroraWalletConnection extends WalletConnection {
  async _completeSignInWithAccessKey() {
    const currentUrl = new URL(window.location.href);
    const publicKey = currentUrl.searchParams.get("public_key") || "";
    const allKeys = (currentUrl.searchParams.get("all_keys") || "").split(",");
    const accountId = currentUrl.searchParams.get("account_id") || "";
    // TODO: Handle errors during login
    if (accountId) {
      this._authData = {
        accountId,
        allKeys,
      };
      window.localStorage.setItem(
        this._authDataKey,
        JSON.stringify(this._authData)
      );
      if (publicKey) {
        await this._moveKeyFromTempToPermanent(accountId, publicKey);
      }
    }
    // currentUrl.searchParams.delete('public_key');
    // currentUrl.searchParams.delete('all_keys');
    // currentUrl.searchParams.delete('account_id');
    // currentUrl.searchParams.delete('meta');
    // currentUrl.searchParams.delete('transactionHashes');
    // window.history.replaceState({}, document.title, currentUrl.toString());
  }
}
const config = getConfig();
const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  headers: {},
  ...config,
});
const getAurora = () => {
  const aurora_walletConnection = new AuroraWalletConnection(near, "aurora");

  //@ts-ignore
  return new Engine(
    aurora_walletConnection,
    keyStore,
    getAccount(),
    getConfig().networkId,
    "aurora"
  );
};

export const getTokenNearAccount = async (auroraAddress: string) => {
  try {
    return (await getAurora().getNEP141Account(auroraAddress)).unwrap();
  } catch (error) {}
};

export const getBatchTokenNearAcounts = async (ids: string[]) => {
  return await Promise.all(
    ids.map((id) =>
      id === getAuroraConfig().WETH
        ? "aurora"
        : getTokenNearAccount(id).then((res) => res?.id)
    )
  );
};

export const getTriTokenIdsOnRef = async () => {
  const auroraTokens = defaultTokenList.tokens;
  const allSupportPairs = getAuroraConfig().Pairs;
  const symbolToAddress: Record<string, string> = auroraTokens.reduce(
    (pre, cur) => {
      return {
        ...pre,
        [cur.symbol]: cur.address,
      };
    },
    {}
  );

  const idsOnPair = Object.keys(allSupportPairs)
    .map((pairName: string) => {
      const names = pairName.split("-");
      return names.map((n) => {
        if (n === "ETH") return getAuroraConfig().WETH;
        else return symbolToAddress[n];
      });
    })
    .flat();

  const ids = await getBatchTokenNearAcounts(idsOnPair);

  return ids?.filter((id: string) => !!id) || [];
};

export const useUserRegisteredTokensAllAndNearBalance = () => {
  const [tokens, setTokens] = useState<any[]>();

  useEffect(() => {
    getWhitelistedTokensAndNearTokens()
      .then(async (tokenList) => {
        const triTokenIds = await getTriTokenIdsOnRef();

        const newList = [...new Set((triTokenIds || []).concat(tokenList))];

        const walletBalancePromise = Promise.all(
          [nearMetadata.id, ...newList].map((tokenId) => {
            return getDepositableBalance(tokenId);
          })
        );
        const tokenMetadataPromise = Promise.all(
          newList.map((tokenId) => ftGetTokenMetadata(tokenId, true))
        );
        return Promise.all([tokenMetadataPromise, walletBalancePromise]);
      })
      .then((result) => {
        const arr = result[0];
        arr.unshift(nearMetadata);
        arr.forEach((token, index) => {
          token.near = result[1][index];
          token.nearNonVisible = result[1][index];
        });
        setTokens(arr);
      });
  }, []);

  return tokens;
};

export const getDepositableBalance = async (
  tokenId: string,
  decimals: number = 0
) => {
  if (tokenId === "NEAR") {
    return getAccountNearBalance().then(({ available }: any) => {
      return toReadableNumber(decimals, available);
    });
  } else if (tokenId) {
    return ftGetBalance(tokenId)
      .then((res: string) => {
        return toReadableNumber(decimals, res);
      })
      .catch((res: any) => "0");
  } else {
    return "";
  }
};
