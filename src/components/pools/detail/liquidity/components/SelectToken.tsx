import { useState, useEffect, useMemo } from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { isMobile } from "@/utils/device";
import { useIntl } from "react-intl";
import { useDefaultWhitelistTokens } from "@/hooks/useDefaultWhitelistTokens";
import { PoolInfo } from "@/services/swapV3";
import { sort_tokens_by_base } from "@/services/commonV3";
import { useAllPoolsV2 } from "@/hooks/usePools";
import { Symbols, Images, IconLeftV3 } from "./liquidityComComp";
export function SelectTokenDCL({
  selectTokenIn,
  selectTokenOut,
  selectedToken,
  onSelect,
  selected,
  className,
  notNeedSortToken,
  limitOrder = false,
}: {
  selectTokenIn?: (token: TokenMetadata) => void;
  selectTokenOut?: (token: TokenMetadata) => void;
  onSelect?: (token: TokenMetadata) => void;
  selectedToken?: TokenMetadata;
  selected?: JSX.Element;
  className?: string;
  notNeedSortToken?: boolean;
  limitOrder?: boolean;
}) {
  const allPools = useAllPoolsV2(!limitOrder);

  const [hoverSelectToken, setHoverSelectToken] = useState<boolean>(false);

  const intl = useIntl();

  const mobileDevice = isMobile();

  const { whiteListTokens: globalWhiteList }: any = useDefaultWhitelistTokens();

  const displayPools = allPools?.reduce((acc, cur, i) => {
    const id = [cur.token_x, cur.token_y].sort().join("|");
    if (!acc[id]) {
      acc[id] = cur;
    }
    return acc;
  }, {} as Record<string, PoolInfo>);

  const handleSelect = (p: PoolInfo) => {
    // select token in
    const { token_x_metadata, token_y_metadata }: any = p;
    const tokens = notNeedSortToken
      ? [token_x_metadata, token_y_metadata]
      : sort_tokens_by_base([token_x_metadata, token_y_metadata]);

    if (!selectedToken) {
      selectTokenIn && selectTokenIn(tokens[0]);
      selectTokenOut && selectTokenOut(tokens[1]);

      return;
    }

    if (!!selectTokenOut) {
      if (selectedToken?.id === tokens[0].id) {
        selectTokenOut(tokens[1]);
      } else if (selectedToken?.id === tokens[1].id) {
        selectTokenOut(tokens[0]);
      } else {
        onSelect && onSelect(tokens[0]);
        selectTokenOut(tokens[1]);
      }

      return;
    }

    if (!!selectTokenIn) {
      if (selectedToken?.id === tokens[0].id) {
        selectTokenIn(tokens[1]);
      } else if (selectedToken?.id === tokens[1].id) {
        selectTokenIn(tokens[0]);
      } else {
        onSelect && onSelect(tokens[1]);
        selectTokenIn(tokens[0]);
      }
      return;
    }
  };

  const renderPools = useMemo(
    () =>
      Object.values(displayPools || {})?.filter((p) => {
        const { token_x_metadata, token_y_metadata }: any = p;
        return (
          !!globalWhiteList.find((t: any) => t.id === token_x_metadata.id) &&
          !!globalWhiteList.find((t: any) => t.id === token_y_metadata.id)
        );
      }),
    [globalWhiteList, allPools?.length]
  );

  const renderList = renderPools?.map((p) => {
    const { token_x_metadata, token_y_metadata }: any = p;
    const tokens = sort_tokens_by_base([token_x_metadata, token_y_metadata]);
    return (
      <div
        key={p.pool_id}
        className="flex items-center text-sm xs:text-base min-w-max px-1.5 bg-opacity-90 py-3 bg-dark-10 rounded-lg hover:bg-gray-60 cursor-pointer"
        onClick={() => {
          handleSelect(p);
          setHoverSelectToken(false);
        }}
      >
        <Images tokens={tokens} size="5" className="mr-2 ml-1" />

        <Symbols tokens={tokens} separator="-" />
      </div>
    );
  });

  // fetch all dcl pools

  useEffect(() => {
    if (hoverSelectToken && mobileDevice) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "auto";
    }
  }, [hoverSelectToken]);

  return (
    <div
      className="outline-none relative my-auto flex-shrink-0"
      onMouseLeave={() => {
        if (!mobileDevice) {
          setHoverSelectToken(false);
        }
      }}
      onBlur={() => {
        if (mobileDevice) {
          setHoverSelectToken(false);
        }
      }}
    >
      {(selected || selectedToken) && (
        <div
          className="flex items-center relative justify-end font-semibold"
          onMouseEnter={() => {
            if (!mobileDevice) {
              setHoverSelectToken(true);
            }
          }}
          onClick={() => {
            if (mobileDevice) {
              setHoverSelectToken(!hoverSelectToken);
            }
          }}
          style={{
            zIndex: !!selectTokenOut ? 80 : 70,
          }}
        >
          {selected || (
            <IconLeftV3
              size={"7"}
              token={selectedToken as any}
              hover={hoverSelectToken}
              className={"p-1"}
            />
          )}
        </div>
      )}

      {hoverSelectToken && renderList?.length > 0 && (
        <div
          className={`${
            className ||
            "pt-2  absolute top-8 outline-none xs:text-white xs:font-bold xs:fixed xs:bottom-0 xs:w-full  right-0"
          }    `}
          onMouseLeave={() => {
            if (!mobileDevice) {
              setHoverSelectToken(false);
            }
          }}
          onBlur={() => {
            if (mobileDevice) {
              setHoverSelectToken(false);
            }
          }}
          style={{
            zIndex: mobileDevice ? 80 : !!selectTokenOut ? 80 : 75,
          }}
        >
          {mobileDevice && (
            <div
              className="fixed w-screen h-screen top-0"
              style={{
                zIndex: 150,
                background: "rgba(0, 19, 32, 0.8)",
                position: "fixed",
              }}
              onClick={() => {
                setHoverSelectToken(false);
              }}
            ></div>
          )}
          <div
            className="border border-gray-10 overflow-auto xs:absolute xs:w-full xs:bottom-0 xs:pb-8 xs:rounded-2xl rounded-lg bg-dark-10 px-2 py-3 "
            style={{
              zIndex: mobileDevice ? 300 : "",
              maxHeight: mobileDevice ? `${48 * 10 + 78}px` : "",
              minHeight: mobileDevice ? `${48 * 5 + 78}px` : "",
            }}
          >
            <div className="text-sm text-gray-60 xs:text-white xs:text-base  ml-1.5   pb-2">
              Instrument
            </div>
            {renderList}
          </div>
        </div>
      )}
    </div>
  );
}
