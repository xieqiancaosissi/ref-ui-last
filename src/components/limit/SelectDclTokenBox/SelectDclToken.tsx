import { IPoolDcl } from "@/interfaces/swapDcl";
import { TokenMetadata } from "@/services/ft-contract";
import { sort_tokens_by_base } from "@/services/commonV3";
import { usePersistLimitStore, IPersistLimitStore } from "@/stores/limitOrder";
import { SelectedIcon } from "./Icons";
export default function SelectDclTokenBox({
  onSelect,
  show,
}: {
  onSelect: (pool: IPoolDcl) => void;
  show: boolean;
}) {
  const persistLimitStore: IPersistLimitStore = usePersistLimitStore();
  const allPools = persistLimitStore.getAllDclPools();
  if (!show) return null;
  return (
    <div className="absolute rounded-lg border border-gray-70 bg-dark-70 py-2.5 right-0 top-8 z-50">
      <p className="text-sm text-gray-60 mb-2.5 px-2.5">Instrument</p>
      <div
        style={{ height: "215px" }}
        className="overflow-y-auto  px-2.5 thinGrayscrollBar"
      >
        {allPools?.map((p: IPoolDcl) => {
          const { token_x_metadata, token_y_metadata } = p;
          const tokens = sort_tokens_by_base([
            token_x_metadata as TokenMetadata,
            token_y_metadata as TokenMetadata,
          ]);
          return (
            <div
              key={p.pool_id}
              style={{ height: "38px" }}
              className={`flex items-center justify-between rounded-md px-2.5 py-1.5 mb-1.5 hover:bg-dark-10 gap-10 cursor-pointer min-w-max`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(p);
              }}
            >
              <div className="flex items-center gap-2">
                <Images tokens={tokens} />
                <Symbols tokens={tokens} />
              </div>
              <SelectedIcon className="hidden" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Images({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center flex-shrink-0">
      {tokens.map((token, index) => {
        return (
          <img
            key={token.id}
            src={token.icon}
            className={`w-6 h-6 rounded-full border-gray-110 border-opacity-50 flex-shrink-0 ${
              index > 0 ? " -ml-1.5" : ""
            }`}
          />
        );
      })}
    </div>
  );
}
function Symbols({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center">
      {tokens.map((token, index) => {
        return (
          <span key={token.id} className="text-white text-sm font-bold">
            {token.symbol}
            {index == 0 ? "-" : ""}
          </span>
        );
      })}
    </div>
  );
}
