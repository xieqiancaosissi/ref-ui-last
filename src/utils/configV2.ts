export default function getConfigV2(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        HIDDEN_TOKEN_LIST: ["nearx.stader-labs.near"],
      };
    case "pub-testnet":
      return {
        HIDDEN_TOKEN_LIST: ["nearx.staderlabs.testnet"],
      };
    case "testnet":
      return {
        HIDDEN_TOKEN_LIST: ["nearx.staderlabs.testnet"],
      };
    default:
      return {
        HIDDEN_TOKEN_LIST: ["nearx.stader-labs.near"],
      };
  }
}
