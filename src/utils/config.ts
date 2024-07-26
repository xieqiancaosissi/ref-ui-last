import { getSelectedRpc } from "./rpc";
export default function getConfig(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  const RPC = getSelectedRpc();
  switch (env) {
    case "production":
    case "mainnet":
      return {
        networkId: "mainnet",
        nodeUrl: RPC.url,
        walletUrl: "https://wallet.near.org",
        myNearWalletUrl: "https://app.mynearwallet.com/",
        helperUrl: "https://api.kitwallet.app",
        explorerUrl: "https://nearblocks.io",
        pikespeakUrl: "https://pikespeak.ai",
        nearExplorerUrl: "https://explorer.near.org/",
        indexerUrl: "https://api.ref.finance",
        indexerUrlcclp: "https://apiself.cclp.finance",
        indexerOld: "https://indexer.ref.finance",
        sodakiApiUrl: "https://api.stats.ref.finance/api",
        newSodakiApiUrl: "https://api.data-service.ref.finance/api",
        txIdApiUrl: "https://api3.nearblocks.io",
        memeRankApiUrl: "https://api.ref.finance",
        tvlAnd24hUrl: "https://test.api.cclp.finance",
        blackList: ["1371#3", "2769#2"],
        REF_FI_CONTRACT_ID: "v2.ref-finance.near",
        WRAP_NEAR_CONTRACT_ID: "wrap.near",
        REF_ADBOARD_CONTRACT_ID: "ref-adboard.near",
        REF_FARM_CONTRACT_ID: "v2.ref-farming.near",
        XREF_TOKEN_ID: "xtoken.ref-finance.near",
        REF_TOKEN_ID: "token.v2.ref-finance.near",
        REF_AIRDROP_CONTRACT_ID: "s01.ref-airdrop.near",
        POOL_TOKEN_REFRESH_INTERVAL: 20,
        BTC_POOL_ID: "3364",
        BTCIDS: [
          "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near",
          "0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near",
        ],
        BTC_IDS_INDEX: {
          "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near": 0,
          "0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near": 1,
        },
        STABLE_POOL_USN_ID: 3020,
        STABLE_TOKEN_USN_IDS: [
          "usn",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ],
        STABLE_TOKEN_USN_INDEX: {
          usn: 0,
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 1,
        },
        STABLE_POOL_ID: 1910,
        STABLE_POOL_IDS: ["1910", "3020", "3364", "3433"],
        STABLE_TOKEN_IDS: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
        ],
        STABLE_TOKEN_INDEX: {
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 0,
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": 1,
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near": 2,
        },
        USN_ID: "usn",
        TOTAL_PLATFORM_FEE_REVENUE: "2,968,234.25",
        CUMULATIVE_REF_BUYBACK: "3,948,907.03",

        BLACKLIST_POOL_IDS: [
          "3699",
          "3734",
          "3563",
          "3613",
          "3620",
          "3625",
          "4744",
          "5029",
        ],

        FARM_LOCK_SWITCH: 0,
        VotingGauge: ["10%", "10%"],
        REF_FARM_BOOST_CONTRACT_ID: "boostfarm.ref-labs.near",
        FARM_BLACK_LIST_V2: ["3612"],
        boostBlackList: ["3699#0", "3612#0", "3612#1"],
        REF_UNI_V3_SWAP_CONTRACT_ID: "dclv2.ref-labs.near",
        REF_UNI_SWAP_CONTRACT_ID: "dcl.ref-labs.near",
        switch_on_dcl_farms: "off",
        DCL_POOL_BLACK_LIST: ["usdt.tether-token.near|wrap.near|2000"],
        BURROW_CONTRACT_ID: "contract.main.burrow.near",
        USDTT_USDCC_USDT_USDC_POOL_ID: 4179,
        USDT_USDC_POOL_ID: 4513,
        FRAX_USDC_POOL_ID: 4514,
        USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        FRAX_USDC_TOKEN_IDS: [
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        ],
        BLACK_TOKEN_LIST: ["token.pembrock.near"],
        REF_MEME_FARM_CONTRACT_ID: "meme-farming_011.ref-labs.near",
        REF_TOKEN_LOCKER_CONTRACT_ID: "token-locker.ref-labs.near",
      };
    case "pub-testnet":
      return {
        networkId: "testnet",
        nodeUrl: RPC.url,
        walletUrl: "https://wallet.testnet.near.org",
        myNearWalletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://testnet-api.kitwallet.app",
        explorerUrl: "https://testnet.nearblocks.io",
        pikespeakUrl: "https://pikespeak.ai",
        nearExplorerUrl: "https://explorer.testnet.near.org/",
        indexerUrl: "https://testnet-indexer.ref-finance.com",
        indexerOld: "https://indexer.ref.finance",
        sodakiApiUrl: "https://api.stats.ref.finance/api",
        newSodakiApiUrl: "https://api.data-service.ref.finance/api",
        txIdApiUrl: "https://api-testnet.nearblocks.io",
        tvlAnd24hUrl: "https://test.api.cclp.finance",
        memeRankApiUrl: "https://test.api.cclp.finance",
        blackList: ["1371#3"],
        REF_FI_CONTRACT_ID: "ref-finance-101.testnet",
        WRAP_NEAR_CONTRACT_ID: "wrap.testnet",
        REF_ADBOARD_CONTRACT_ID: "ref-adboard.near",
        REF_FARM_CONTRACT_ID: "v2.ref-farming.testnet",
        XREF_TOKEN_ID: "xref.ref-finance.testnet",
        REF_TOKEN_ID: "ref.fakes.testnet",
        REF_VE_CONTRACT_ID: "v010.refve.testnet",
        REF_AIRDROP_CONTRACT_ID: "locker002.ref-dev.testnet",
        POOL_TOKEN_REFRESH_INTERVAL: 20,
        STABLE_POOL_ID: 218,
        STABLE_POOL_IDS: ["218", "356", "456", "494"],
        USN_ID: "usdn.testnet",
        STABLE_POOL_USN_ID: 356,
        STABLE_TOKEN_IDS: [
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
          "dai.fakes.testnet",
        ],
        STABLE_TOKEN_USN_IDS: ["usdn.testnet", "usdt.fakes.testnet"],
        STABLE_TOKEN_USN_INDEX: {
          "usdn.testnet": 0,
          "usdt.fakes.testnet": 1,
        },
        STABLE_TOKEN_INDEX: {
          "usdt.fakes.testnet": 0,
          "usdc.fakes.testnet": 1,
          "dai.fakes.testnet": 2,
        },
        TOTAL_PLATFORM_FEE_REVENUE: "2,968,234.25",
        CUMULATIVE_REF_BUYBACK: "3,948,907.03",
        BLACKLIST_POOL_IDS: ["1752", "1760"],
        REF_FARM_BOOST_CONTRACT_ID: "boostfarm.ref-finance.testnet",
        FARM_LOCK_SWITCH: 0,
        VotingGauge: ["10%", "10%"],
        kitWalletOn: true,
        DCL_POOL_BLACK_LIST: [""],
        REF_UNI_V3_SWAP_CONTRACT_ID: "dclv2.ref-dev.testnet",
        REF_UNI_SWAP_CONTRACT_ID: "dclv1.ref-dev.testnet",
        FARM_BLACK_LIST_V2: ["571"],
        boostBlackList: ["1760#0", "1760#1"],
        switch_on_dcl_farms: "on",
        BURROW_CONTRACT_ID: "contract.1689937928.burrow.testnet",
        USDTT_USDCC_USDT_USDC_POOL_ID: 1843,
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdtt.fakes.testnet",
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
        ],
        USDT_USDC_POOL_ID: "",
        FRAX_USDC_POOL_ID: "",
        USDT_USDC_TOKEN_IDS: [],
        FRAX_USDC_TOKEN_IDS: [],
        BLACK_TOKEN_LIST: [],
        REF_MEME_FARM_CONTRACT_ID: "memefarm-dev2.ref-dev.testnet",
        REF_TOKEN_LOCKER_CONTRACT_ID: "token-locker.ref-labs.testnet",
      };
    case "testnet":
      return {
        networkId: "testnet",
        nodeUrl: RPC.url,
        walletUrl: "https://wallet.testnet.near.org",
        myNearWalletUrl: "https://testnet.mynearwallet.com/",
        helperUrl: "https://testnet-api.kitwallet.app",
        explorerUrl: "https://testnet.nearblocks.io",
        pikespeakUrl: "https://pikespeak.ai",
        nearExplorerUrl: "https://explorer.testnet.near.org/",
        indexerUrl: "https://dev-indexer.ref-finance.com",
        indexerOld: "https://indexer.ref.finance",
        sodakiApiUrl: "https://api.stats.ref.finance/api",
        newSodakiApiUrl: "https://api.data-service.ref.finance/api",
        txIdApiUrl: "https://api-testnet.nearblocks.io",
        tvlAnd24hUrl: "https://test.api.cclp.finance",
        memeRankApiUrl: "https://test.api.cclp.finance",
        blackList: ["1371#3"],
        REF_FI_CONTRACT_ID: "exchange.ref-dev.testnet",
        WRAP_NEAR_CONTRACT_ID: "wrap.testnet",
        REF_ADBOARD_CONTRACT_ID: "ref-adboard.near",
        REF_FARM_CONTRACT_ID: "farm-dev.ref-dev.testnet",
        XREF_TOKEN_ID: "xref.ref-dev.testnet",
        REF_TOKEN_ID: "ref.fakes.testnet",
        REF_AIRDROP_CONTRACT_ID: "locker002.ref-dev.testnet",
        POOL_TOKEN_REFRESH_INTERVAL: 20,
        STABLE_POOL_ID: 79,
        STABLE_POOL_IDS: ["79", "603", "604", "608"],
        USN_ID: "usdn.testnet",
        STABLE_POOL_USN_ID: 603,
        STABLE_TOKEN_IDS: [
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
          "dai.fakes.testnet",
        ],

        STABLE_TOKEN_USN_IDS: ["usdn.testnet", "usdt.fakes.testnet"],
        STABLE_TOKEN_USN_INDEX: {
          "usdn.testnet": 0,
          "usdt.fakes.testnet": 1,
        },
        STABLE_TOKEN_INDEX: {
          "usdt.fakes.testnet": 0,
          "usdc.fakes.testnet": 1,
          "dai.fakes.testnet": 2,
        },
        DCL_POOL_BLACK_LIST: ["usdt.fakes.testnet|wrap.testnet|100"],

        TOTAL_PLATFORM_FEE_REVENUE: "2,968,234.25",
        CUMULATIVE_REF_BUYBACK: "3,948,907.03",
        BLACKLIST_POOL_IDS: ["686"],
        REF_FARM_BOOST_CONTRACT_ID: "boostfarm-dev.ref-dev.testnet",
        FARM_LOCK_SWITCH: 0,
        VotingGauge: ["5%", "10%"],
        REF_UNI_V3_SWAP_CONTRACT_ID: "refv2-dev.ref-dev.testnet",
        REF_UNI_SWAP_CONTRACT_ID: "refv2-dev.ref-dev.testnet",
        kitWalletOn: true,
        FARM_BLACK_LIST_V2: ["666"],
        boostBlackList: [""],
        switch_on_dcl_farms: "on",
        BURROW_CONTRACT_ID: "contract.1689937928.burrow.testnet",
        USDTT_USDCC_USDT_USDC_POOL_ID: 711,
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdtt.fakes.testnet",
          "usdcc.fakes.testnet",
          "usdt.fakes.testnet",
          "usdc.fakes.testnet",
        ],
        USDT_USDC_POOL_ID: "",
        FRAX_USDC_POOL_ID: "",
        USDT_USDC_TOKEN_IDS: [],
        FRAX_USDC_TOKEN_IDS: [],
        BLACK_TOKEN_LIST: [],
        REF_MEME_FARM_CONTRACT_ID: "memefarm-dev2.ref-dev.testnet",
        REF_TOKEN_LOCKER_CONTRACT_ID: "token-locker.testnet",
      };
    default:
      return {
        networkId: "mainnet",
        nodeUrl: RPC.url,
        walletUrl: "https://wallet.near.org",
        myNearWalletUrl: "https://app.mynearwallet.com/",
        helperUrl: "https://api.kitwallet.app",
        explorerUrl: "https://nearblocks.io",
        pikespeakUrl: "https://pikespeak.ai",
        nearExplorerUrl: "https://explorer.near.org/",
        indexerUrl: "https://api.ref.finance",
        indexerOld: "https://indexer.ref.finance",
        sodakiApiUrl: "https://api.stats.ref.finance/api",
        newSodakiApiUrl: "https://api.data-service.ref.finance/api",
        tvlAnd24hUrl: "https://test.api.cclp.finance",
        txIdApiUrl: "https://api3.nearblocks.io",
        memeRankApiUrl: "https://api.ref.finance",
        blackList: ["1371#3", "2769#2"],
        REF_FI_CONTRACT_ID: "v2.ref-finance.near",
        WRAP_NEAR_CONTRACT_ID: "wrap.near",
        REF_ADBOARD_CONTRACT_ID: "ref-adboard.near",
        REF_FARM_CONTRACT_ID: "v2.ref-farming.near",
        XREF_TOKEN_ID: "xtoken.ref-finance.near",
        REF_TOKEN_ID: "token.v2.ref-finance.near",
        REF_AIRDROP_CONTRACT_ID: "s01.ref-airdrop.near",
        POOL_TOKEN_REFRESH_INTERVAL: 20,
        BTC_POOL_ID: "3364",
        BTCIDS: [
          "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near",
          "0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near",
        ],
        BTC_IDS_INDEX: {
          "2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near": 0,
          "0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near": 1,
        },
        STABLE_POOL_USN_ID: 3020,
        STABLE_TOKEN_USN_IDS: [
          "usn",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ],
        STABLE_TOKEN_USN_INDEX: {
          usn: 0,
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 1,
        },
        STABLE_POOL_ID: 1910,
        STABLE_POOL_IDS: ["1910", "3020", "3364", "3433"],
        STABLE_TOKEN_IDS: [
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near",
        ],
        STABLE_TOKEN_INDEX: {
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near": 0,
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near": 1,
          "6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near": 2,
        },
        USN_ID: "usn",
        TOTAL_PLATFORM_FEE_REVENUE: "2,968,234.25",
        CUMULATIVE_REF_BUYBACK: "3,948,907.03",

        BLACKLIST_POOL_IDS: [
          "3699",
          "3734",
          "3563",
          "3613",
          "3620",
          "3625",
          "4744",
          "5029",
        ],

        FARM_LOCK_SWITCH: 0,
        VotingGauge: ["10%", "10%"],
        REF_FARM_BOOST_CONTRACT_ID: "boostfarm.ref-labs.near",
        FARM_BLACK_LIST_V2: ["3612"],
        boostBlackList: ["3699#0", "3612#0", "3612#1"],
        REF_UNI_V3_SWAP_CONTRACT_ID: "dclv2.ref-labs.near",
        REF_UNI_SWAP_CONTRACT_ID: "dcl.ref-labs.near",
        switch_on_dcl_farms: "off",
        DCL_POOL_BLACK_LIST: ["usdt.tether-token.near|wrap.near|2000"],
        BURROW_CONTRACT_ID: "contract.main.burrow.near",
        USDTT_USDCC_USDT_USDC_POOL_ID: 4179,
        USDT_USDC_POOL_ID: 4513,
        FRAX_USDC_POOL_ID: 4514,
        USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        FRAX_USDC_TOKEN_IDS: [
          "853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
        ],
        BLACK_TOKEN_LIST: ["token.pembrock.near"],
        REF_MEME_FARM_CONTRACT_ID: "meme-farming_011.ref-labs.near",
        REF_TOKEN_LOCKER_CONTRACT_ID: "token-locker.ref-labs.near",
      };
  }
}

export const colorMap: any = {
  DAI: "rgba(255, 199, 0, 0.45)",
  USDT: "#167356",
  USN: "rgba(255, 255, 255, 0.45)",
  cUSD: "rgba(69, 205, 133, 0.6)",
  HBTC: "#4D85F8",
  WBTC: "#ED9234",
  STNEAR: "#A0A0FF",
  NEAR: "#A0B1AE",
  LINEAR: "#4081FF",
  NEARXC: "#4d5971",
  NearXC: "#4d5971",
  NearX: "#00676D",
  "USDT.e": "#19936D",
  "USDC.e": "#2B6EB7",
  USDC: "#2FA7DB",
  USDt: "#45D0C0",
};
