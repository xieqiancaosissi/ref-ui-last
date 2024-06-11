import { useEffect } from "react";
import { useAccountStore } from "../../stores/account";
import { getAccountNearBalance } from "../../services/token";

const Farms = () => {
  const accountStore = useAccountStore();
  const accountId = accountStore.getIsSignedIn();
  return (
    <main className={`text-white`}>
      <div className="bg-farmTitleBg h-72">Farm page</div>
    </main>
  );
};
export default Farms;
