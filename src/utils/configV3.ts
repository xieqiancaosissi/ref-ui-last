export default function getConfigV3(
  env: string | undefined = process.env.NEXT_PUBLIC_NEAR_ENV
) {
  switch (env) {
    case "production":
    case "mainnet":
      return {
        findPathUrl: "smartrouter.ref.finance",
        SHUTDOWN_SERVER: false,
      };
    case "pub-testnet":
      return {
        findPathUrl: "smartroutertest.refburrow.top",
        SHUTDOWN_SERVER: false,
      };
    case "testnet":
      return {
        findPathUrl: "smartroutertest.refburrow.top",
        SHUTDOWN_SERVER: false,
      };
    default:
      return {
        findPathUrl: "smartrouter.ref.finance",
        SHUTDOWN_SERVER: false,
      };
  }
}
