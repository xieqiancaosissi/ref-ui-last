import {
  AccountID,
  Address,
  CallArgs,
  Engine,
  FunctionCallArgsV2,
  parseHexString,
} from "@aurora-is-near/engine";
import { useEffect, useState } from "react";
import {
  ftGetBalance,
  ftGetTokenMetadata,
  getAccountNearBalance,
  getDepositableBalance,
  getGlobalWhitelist,
  getWhitelistedTokensAndNearTokens,
} from "./token";
import { defaultTokenList, getAuroraConfig } from "@/utils/auroraConfig";
import { Near, WalletConnection, keyStores } from "near-api-js";
import getConfig from "@/utils/config";
import { nearMetadata } from "./wrap-near";
import {
  formatWithCommas,
  scientificNotationToString,
  toInternationalCurrencySystem,
  toInternationalCurrencySystemLongString,
  toPrecision,
  toReadableNumber,
} from "@/utils/numbers";
import { useAccountStore } from "@/stores/account";
import Big from "big.js";
import { Erc20Abi } from "./abi/erc20";
import AbiCoder from "web3-eth-abi";
import { getAccountId } from "@/utils/wallet";
import { list_user_assets } from "./swapV3";
import BigNumber from "bignumber.js";
import { getStakedListByAccountId } from "./farm";
import { ILock, get_account } from "./lplock";
import { getSharesInPool } from "./pool";

const config = getConfig();
const keyStore = new keyStores.BrowserLocalStorageKeyStore();
const near = new Near({
  keyStore,
  headers: {},
  ...config,
});
const getAurora = () => {
  const aurora_walletConnection = new WalletConnection(near, "aurora");
  const account = new WalletConnection(
    near,
    config.REF_FARM_BOOST_CONTRACT_ID
  ).account();
  //@ts-ignore
  return new Engine(
    aurora_walletConnection,
    keyStore,
    account,
    getConfig().networkId,
    "aurora"
  );
};

export const toAddress = (address: string | any) => {
  return typeof address === "string"
    ? Address.parse(address).unwrapOrElse(() => Address.zero())
    : address;
};

export const getTokenNearAccount = async (auroraAddress: string) => {
  try {
    return (
      await getAurora().getNEP141Account(toAddress(auroraAddress))
    ).unwrap();
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
  // debugger
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

export const auroraAddr = (nearAccount: string) =>
  new AccountID(nearAccount).toAddress().toString();

export const useAuroraTokens = () => {
  const [tokens, setTokens] = useState<any>({});

  const tokenList = defaultTokenList;

  useEffect(() => {
    setTokens(
      Object.assign(
        {
          tokenAddresses: tokenList.tokens.map((t) => t.address),
          tokensByAddress: tokenList.tokens.reduce(
            (
              m: {
                [key: string]: {
                  address: string;
                  [key: string]: any;
                };
              },
              t: {
                address: string;
                [key: string]: any;
              }
            ) => {
              m[t.address] = t;
              return m;
            },
            {}
          ),
        },
        tokenList
      )
    );
  }, [tokenList]);

  return tokens;
};

export const fetchBalance = async (address: string) => {
  return scientificNotationToString(
    Big((await getAurora().getBalance(toAddress(address))).unwrap()).toString()
  );
};

export const decodeOutput = (abi: any[], methodName: string, buffer: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }
  // console.log(
  //   'xx',
  //   abiItem.outputs,
  //   AbiCoder.decodeParameters(abiItem.outputs, `0x${buffer.toString('hex')}`)
  // );
  return AbiCoder.decodeParameters(
    abiItem.outputs,
    `0x${buffer.toString("hex")}`
  );
};
export const buildInput = (abi: any[], methodName: string, params: any) => {
  const abiItem = abi.find((a) => a.name === methodName);
  if (!abiItem) {
    return null;
  }

  return AbiCoder.encodeFunctionCall(abiItem, params);
};

export const fetchErc20Balance = async (
  address: string,
  tokenAddress: string
) => {
  try {
    const input = buildInput(Erc20Abi, "balanceOf", [address]);
    const res = (
      await getAurora().view(
        toAddress(address),
        toAddress(tokenAddress),
        0,
        input
      )
    ).unwrap();

    const out = decodeOutput(Erc20Abi, "balanceOf", res);
    if (out && out[0] !== null && out[0] !== undefined) {
      return Big(out[0] as any);
    }
  } catch (e) {
    return false;
  }
};

// OK
export const useAuroraBalances = (address: string) => {
  const [tokenBalances, setTokenBalances] = useState(null);
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;

  const tokens = useAuroraTokens();

  useEffect(() => {
    if (!tokens?.tokenAddresses || !isSignedIn) return;

    const requestAddress = tokens.tokenAddresses.concat([
      getAuroraConfig().WETH,
    ]);

    Promise.all(
      requestAddress.map((add: string) =>
        add === getAuroraConfig().WETH
          ? fetchBalance(address)
          : fetchErc20Balance(address, add)
      )
    ).then((res) => {
      setTokenBalances(
        res.reduce((pre, cur, i) => {
          if (Number(cur) > 0)
            return {
              ...pre,
              [requestAddress[i]]: scientificNotationToString(cur.toString()),
            };
          else return pre;
        }, {})
      );
    });
  }, [tokens, isSignedIn, address]);

  return tokenBalances;
};

export const useAuroraBalancesNearMapping = (address: string) => {
  const auroraMapping = useAuroraBalances(address);

  const [nearMapping, setNearMapping] = useState(null);

  const accountId = getAccountId();

  const isSignedIn = !!accountId;

  useEffect(() => {
    if (!auroraMapping || !isSignedIn) return;
    const auroraAddresses = Object.keys(auroraMapping);

    getBatchTokenNearAcounts(auroraAddresses)
      .then((nearAccounts) => {
        return nearAccounts.reduce((pre, cur, i) => {
          return {
            ...pre,
            [cur]: Object.values(auroraMapping)[i],
          };
        }, {});
      })
      .then(setNearMapping);
  }, [auroraMapping, isSignedIn]);

  return nearMapping;
};

export const useDCLAccountBalance = (isSignedIn: boolean) => {
  const [assets, setAssets] = useState<any>();

  useEffect(() => {
    list_user_assets().then(setAssets);
  }, [isSignedIn]);

  return assets;
};

export function display_number_internationalCurrencySystemLongString(
  amount: string
) {
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<0.01";
  } else {
    return toInternationalCurrencySystemLongString(amount, 2);
  }
}
export function display_value(amount: string) {
  const accountId = getAccountId();
  if (!accountId) return "$-";
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "$0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<$0.01";
  } else {
    return `$${toInternationalCurrencySystem(amount, 2)}`;
  }
}

export function display_value_withCommas(amount: string) {
  const accountId = getAccountId();
  if (!accountId) return "$-";
  const amount_big = new BigNumber(amount);
  if (amount_big.isEqualTo("0")) {
    return "$0";
  } else if (amount_big.isLessThan("0.01")) {
    return "<$0.01";
  } else {
    return `$${formatWithCommas(toPrecision(amount, 2))}`;
  }
}

export const useStakeListByAccountId = () => {
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  const [v2StakeList, setV2StakeList] = useState<Record<string, string>>({});

  const [finalStakeList, setFinalStakeList] = useState<Record<string, string>>(
    {}
  );
  const [stakeListDone, setStakeListDone] = useState<boolean>(false);

  useEffect(() => {
    if (!isSignedIn) return;
    getStakedListByAccountId({})
      .then(({ stakedList, finalStakeList, v2StakedList }) => {
        setStakeList(stakedList);
        setV2StakeList(v2StakedList);
        setFinalStakeList(finalStakeList);
        setStakeListDone(true);
      })
      .catch((error) => {
        console.error("Failed to fetch staked list", error);
      });
  }, [isSignedIn]);

  return {
    stakeList,
    v2StakeList,
    finalStakeList,
    stakeListDone,
  };
};

export const useBatchTotalShares = (
  ids: (string | number)[],
  finalStakeList: Record<string, string>,
  stakeListDone: boolean
) => {
  const accountStore = useAccountStore();
  const isSignedIn = accountStore.isSignedIn;
  const [batchShares, setBatchShares] = useState<string[]>();
  const [batchFarmStake, setBatchFarmStake] = useState<(string | number)[]>();
  const [batchLpLocked, setBatchLpLocked] = useState<(string | number)[]>();
  const [sharesDone, setSharesDone] = useState<boolean>(false);
  const [accountLocked, setAccountLocked] = useState<Record<string, ILock>>();

  const getFarmStake = (pool_id: number) => {
    const farmStake = "0";

    const seedIdList: string[] = Object.keys(finalStakeList);
    let tempFarmStake: string | number = "0";
    seedIdList.forEach((seed) => {
      const id = Number(seed.split("@")[1]);
      if (id == pool_id) {
        tempFarmStake = BigNumber.sum(
          farmStake,
          finalStakeList[seed]
        ).valueOf();
      }
    });

    return tempFarmStake;
  };
  useEffect(() => {
    if (isSignedIn) {
      get_account().then((locked) => {
        setAccountLocked(locked?.locked_tokens || {});
      });
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (
      !ids ||
      !finalStakeList ||
      !isSignedIn ||
      !stakeListDone ||
      !accountLocked
    )
      return undefined;
    getShares();
  }, [
    ids?.join("-"),
    finalStakeList,
    isSignedIn,
    stakeListDone,
    accountLocked,
  ]);
  async function getShares() {
    const shareInPools = await Promise.all(
      ids.map((id) => getSharesInPool(Number(id)))
    );
    const shareInLocked = ids.map((id) => {
      const key = `${getConfig().REF_FI_CONTRACT_ID}@:${id}`;
      return accountLocked?.[key]?.locked_balance || "0";
    });
    const shareInFarms = ids.map((id) => getFarmStake(Number(id)));
    setBatchShares(shareInPools);
    setBatchFarmStake(shareInFarms);
    setBatchLpLocked(shareInLocked);
    setSharesDone(true);
  }
  return {
    sharesDone,
    shares: batchShares,
    batchTotalShares:
      ids?.map((id, index) => {
        return new Big(batchShares?.[index] || "0")
          .plus(new Big(batchFarmStake?.[index] || "0"))
          .plus(new Big(batchLpLocked?.[index] || "0"))
          .toNumber();
      }) || undefined,
  };
};
