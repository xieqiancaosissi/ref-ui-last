import { useEffect } from "react";
import { useAccountStore } from "../stores/account";
import { getAccountNearBalance } from "../services/token";

export default function Farms() {
  const accountStore = useAccountStore();
  const accountId = accountStore.getIsSignedIn();
  return <main className={`text-white`}>This is farms page</main>;
}
