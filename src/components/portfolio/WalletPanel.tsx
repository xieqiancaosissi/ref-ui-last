import { TokenMetadata } from "@/services/ft-contract";
import { useUserRegisteredTokensAllAndNearBalance } from "@/services/overview";
import { useState } from "react";

export default function WalletPanel() {
  const [near_tokens, set_near_tokens] = useState<TokenMetadata[]>([]);
  const userTokens = useUserRegisteredTokensAllAndNearBalance();
  
  console.log(userTokens);
  return (
    <>
      <div className="bg-gray-20 bg-opacity-40 p-4 rounded">
        <div className="flex items-center text-gray-50 text-xs w-full mb-5">
          <div className="w-3/6">Token</div>
          <div className="w-2/6">Balance</div>
          <div className="w-1/5 flex items-center justify-end">Value</div>
        </div>
        <div>
          {near_tokens.map((token: TokenMetadata) => {
            return <div key={token.id + "near"} />;
          })}
        </div>
        <div className="flex items-center w-full mb-6">
          <div className="w-3/6 flex items-center">
            <div className="w-5 h-5 rounded-3xl mr-2.5">11</div>
            <div className="text-sm">
              <p className="">ETH</p>
              <p className="text-gray-50 text-xs">$2,893</p>
            </div>
          </div>
          <div className="w-2/6 text-sm">0.03</div>
          <div className="w-1/5 flex items-center justify-end text-sm">
            $86.79
          </div>
        </div>
      </div>
    </>
  );
}
