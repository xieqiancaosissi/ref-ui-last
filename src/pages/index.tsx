import { useEffect } from "react";
import { useAccountStore } from "../stores/account";
import { getAccountNearBalance } from "../services/token";

export default function Home() {
  const accountStore = useAccountStore();
  const accountId = accountStore.getIsSignedIn();
  useEffect(() => {
    getNearMeta();
  }, [accountId]);
  useEffect(() => {
    // console.log("888888888", accountId);
  }, [accountId]);
  async function getNearMeta() {
    const b = await getAccountNearBalance();
  }
  return <main className={`text-white`}>This is a swap page</main>;
}
