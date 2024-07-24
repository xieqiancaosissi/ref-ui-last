export default function getConfigV2(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        HIDDEN_TOKEN_LIST: ["nearx.stader-labs.near"],
        INIT_COMMON_TOKEN_IDS: [
          "token.v2.ref-finance.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
          "usdt.tether-token.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ],
        INIT_SWAP_PAIRS: ["near", "token.v2.ref-finance.near"],
        SKYWARDID: "token.skyward.near",
        BLACK_LIST_DCL_POOL_IDS_IN_POOLS: [
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.burrow.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.burrow.near|400",
          "token.v2.ref-finance.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.v2.ref-finance.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.v2.ref-finance.near|400",
        ],
        WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS: [
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|wrap.near|2000",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near|2000",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|aurora|2000",
          "phoenix-bonds.near|wrap.near|2000",
          "token.burrow.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.burrow.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.burrow.near|400",
          "token.v2.ref-finance.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.v2.ref-finance.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.v2.ref-finance.near|400",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1|wrap.near|2000",
        ],
        NATIVE_TOKENS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        ORDRRBOOK_COLLATTERAL_TOKEN:
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
      };
    case "pub-testnet":
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
        ],
        HIDDEN_TOKEN_LIST: [
          "nearx.staderlabs.testnet",
          "toptoken.testnet",
          "stnear.testnet",
        ],
        INIT_COMMON_TOKEN_IDS: [
          "ref.fakes.testnet",
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
          "usdtt.fakes.testnet",
          "usdc.fakes.testnet",
          "usdt.fakes.testnet",
        ],
        INIT_SWAP_PAIRS: ["near", "ref.fakes.testnet"],
        SKYWARDID: "skyward.fakes.testnet",
        BLACK_LIST_DCL_POOL_IDS_IN_POOLS: [],
        WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS: [
          "usdt.fakes.testnet|wrap.testnet|2000",
          "usdt.fakes.testnet|wrap.testnet|100",
          "aurora.fakes.testnet|usdc.fakes.testnet|2000",
          "eth.fakes.testnet|usdc.fakes.testnet|2000",
          "usdc.fakes.testnet|wrap.testnet|2000",
          "usdt.fakes.testnet|wbtc.fakes.testnet|100",
          "eth.fakes.testnet|wrap.testnet|2000",
          "phoenix-bonds.testnet|wrap.testnet|2000",
          "ref.fakes.testnet|wrap.testnet|400",
          "ref.fakes.testnet|usdc.fakes.testnet|400",
          "ref.fakes.testnet|usdt.fakes.testnet|400",
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af|wrap.testnet|2000",
          "usdcc.ft.ref-labs.testnet|wrap.testnet|2000",
        ],
        NATIVE_TOKENS: [
          "usdtt.fakes.testnet",
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
        ],
        ORDRRBOOK_COLLATTERAL_TOKEN: "usdc.orderly.testnet",
      };
    case "testnet":
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [],
        HIDDEN_TOKEN_LIST: [
          "nearx.staderlabs.testnet",
          "toptoken.testnet",
          "stnear.testnet",
        ],
        INIT_COMMON_TOKEN_IDS: [
          "ref.fakes.testnet",
          "3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af",
          "usdtt.fakes.testnet",
          "usdc.fakes.testnet",
          "usdt.fakes.testnet",
        ],
        INIT_SWAP_PAIRS: ["near", "ref.fakes.testnet"],
        SKYWARDID: "skyward.fakes.testnet",
        BLACK_LIST_DCL_POOL_IDS_IN_POOLS: [
          "usdtt.fakes.testnet|wrap.testnet|400",
          "ref.fakes.testnet|wrap.testnet|400",
        ],
        WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS: [
          "usdc.fakes.testnet|wrap.testnet|2000",
          "aurora.fakes.testnet|usdc.fakes.testnet|2000",
          "eth.fakes.testnet|usdc.fakes.testnet|2000",
          "phoenix-bonds.testnet|wrap.testnet|2000",
          "usdt.fakes.testnet|wrap.testnet|2000",
          "usdcc.fakes.testnet|wrap.testnet|400",
          "ref.fakes.testnet|usdc.fakes.testnet|400",
        ],
        NATIVE_TOKENS: ["usdtt.fakes.testnet", "usdcc.fakes.testnet"],
        ORDRRBOOK_COLLATTERAL_TOKEN: "usdc.orderly.testnet",
      };
    default:
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        HIDDEN_TOKEN_LIST: ["nearx.stader-labs.near"],
        INIT_COMMON_TOKEN_IDS: [
          "token.v2.ref-finance.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
          "usdt.tether-token.near",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near",
        ],
        INIT_SWAP_PAIRS: ["near", "token.v2.ref-finance.near"],
        SKYWARDID: "token.skyward.near",
        BLACK_LIST_DCL_POOL_IDS_IN_POOLS: [
          "token.burrow.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.burrow.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.burrow.near|400",
          "token.v2.ref-finance.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.v2.ref-finance.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.v2.ref-finance.near|400",
        ],
        WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS: [
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|wrap.near|2000",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near|2000",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|aurora|2000",
          "phoenix-bonds.near|wrap.near|2000",
          "token.burrow.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.burrow.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.burrow.near|400",
          "token.v2.ref-finance.near|wrap.near|400",
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|token.v2.ref-finance.near|400",
          "dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near|token.v2.ref-finance.near|400",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1|wrap.near|2000",
        ],
        NATIVE_TOKENS: [
          "usdt.tether-token.near",
          "17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1",
        ],
        ORDRRBOOK_COLLATTERAL_TOKEN:
          "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
      };
  }
}
