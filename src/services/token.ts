import { getAccount } from "../utils/near";

export async function ftGetTokenMetadata(tokenId: string) {
  const account = await getAccount();
  return await account.viewFunction({
    contractId: tokenId,
    methodName: "ft_metadata",
    args: {},
  });
}

export const getAccountNearBalance = async () => {
  const account = await getAccount();
  return account
    .getAccountBalance()
    .then(({ available }) => ({ available }))
    .catch(() => {
      return { available: "0" };
    });
};
