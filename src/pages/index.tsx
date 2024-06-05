import { useEffect } from "react";
import { useAccountStore } from "../stores/account";
import { getAccountNearBalance } from "../services/token";

export default function Swap(props: any) {
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
// SSR
export function getServerSideProps(context: any) {
  return {
    props: {
      data: "testdata",
    },
  };
}
