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
      };
  }
}
