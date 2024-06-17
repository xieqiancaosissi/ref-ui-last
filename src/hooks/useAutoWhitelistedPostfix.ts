import { useEffect, useState } from "react";

import { useTokenStore } from "../stores/token";
import { get_auto_whitelisted_postfix_list } from "../services/token";
export const useAutoWhitelistedPostfix = () => {
  const [postfix, setPostfix] = useState<string[]>([]);
  const tokenStore = useTokenStore();
  useEffect(() => {
    get_auto_whitelisted_postfix();
  }, []);
  async function get_auto_whitelisted_postfix() {
    const storeList = tokenStore.get_auto_whitelisted_postfix();
    let final: string[] = [];
    if (storeList.length > 0) {
      get_auto_whitelisted_postfix_list().then((postfixList) => {
        tokenStore.set_auto_whitelisted_postfix(postfixList);
      });
      final = storeList;
    } else {
      const postfixList = await get_auto_whitelisted_postfix_list();
      tokenStore.set_auto_whitelisted_postfix(postfixList);
      final = postfixList;
    }
    setPostfix(final);
  }
  return postfix;
};
