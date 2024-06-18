import React, { useState, createContext } from "react";
import Modal from "react-modal";
import Image from "next/image";
import { isMobile } from "../../../utils/device";
import { CloseIcon, SearchIcon } from "../Icons";
import { CloseButttonIcon } from "./Icons";
import AssetTable from "./AssetTable";
import Styles from "./modal.module.css";
import { useTokenStore } from "../../../stores/token";
import { ITokenMetadata } from "@/hooks/useBalanceTokens";
import { SelectTokenContext } from "./Context";
export default function SelectTokenModal({
  isOpen,
  onRequestClose,
  onSelect,
}: {
  isOpen: boolean;
  onRequestClose: () => void;
  onSelect: (token: ITokenMetadata) => void;
}) {
  const [searchText, setSearchText] = useState<string>("");
  const [hoverCommonTokenId, setHoverCommonTokenId] = useState<string>("");
  const tokenStore: any = useTokenStore();
  const common_tokens: ITokenMetadata[] = tokenStore.get_common_tokens();
  function changeSearchText(e: any) {
    setSearchText(e.target.value);
  }
  function clearSearchText() {
    setSearchText("");
  }
  function delete_common_token(tokenId: string) {
    tokenStore.set_common_tokens(
      common_tokens.filter((token) => token.id !== tokenId)
    );
  }
  const cardWidth = isMobile() ? "95vw" : "430px";
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={(e) => {
        e.stopPropagation();
        onRequestClose();
      }}
    >
      <div
        style={{
          width: cardWidth,
        }}
        className="rounded-lg bg-dark-70 py-6"
      >
        {/* title */}
        <div className="flexBetween px-6">
          <span className="text-lg text-white font-bold">Selected a Token</span>
          <CloseIcon
            className="text-dark-80 hover:text-white cursor-pointer"
            onClick={onRequestClose}
          />
        </div>
        <SelectTokenContext.Provider
          value={{
            onRequestClose,
            onSelect,
            searchText,
          }}
        >
          {/* search box */}
          <div
            className="flex items-center rounded-md border border-gray-90 bg-black bg-opacity-40 mt-3.5 px-2.5 mx-6 hover:border-green-10"
            style={{
              height: "46px",
            }}
          >
            <SearchIcon />
            <input
              className="ml-1.5 outline-none text-sm text-white flex-grow bg-transparent"
              placeholder="Search name or paste address..."
              onChange={changeSearchText}
              value={searchText}
            />
            <CloseButttonIcon
              onClick={clearSearchText}
              className={`cursor-pointer ${searchText ? "" : "hidden"}`}
            />
          </div>
          <div
            className={`overflow-y-auto px-6 mt-2 pt-2 ${Styles.card}`}
            style={{ height: "400px" }}
          >
            {/* common tokens */}
            <div className="flex items-center gap-2 flex-wrap">
              {common_tokens.map((token) => {
                return (
                  <div
                    className={`flex items-center gap-1.5 relative pl-2 pr-3.5 py-0.5 border border-gray-70 hover:bg-gray-70 cursor-pointer rounded-lg`}
                    key={token.id}
                    onMouseEnter={() => {
                      setHoverCommonTokenId(token.id);
                    }}
                    onMouseLeave={() => {
                      setHoverCommonTokenId("");
                    }}
                    onClick={() => {
                      onSelect(token);
                      onRequestClose();
                    }}
                  >
                    <Image
                      width="26"
                      height="26"
                      className="rounded-full"
                      style={{
                        width: "26px",
                        height: "26px",
                      }}
                      src={token.icon || ""}
                      alt=""
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-white">{token.symbol}</span>
                      <span className="text-xs text-gray-50">$32.6</span>
                    </div>
                    {hoverCommonTokenId == token.id ? (
                      <CloseButttonIcon
                        onClick={() => {
                          delete_common_token(token.id);
                        }}
                        className="absolute -right-2 -top-2 cursor-pointer transform scale-75"
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
            {/* assets table */}
            <AssetTable />
          </div>
        </SelectTokenContext.Provider>
      </div>
    </Modal>
  );
}
