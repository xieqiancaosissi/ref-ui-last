import React, { useEffect, useState, useMemo, useCallback } from "react";
import Modal from "react-modal";
import { AddLiqTitleIcon } from "../icon";
import { LpModalCloseIcon } from "@/components/pools/icon";
import tokenIcons from "@/utils/tokenIconConfig";
import { TokenIconComponent } from "@/components/pools/TokenIconWithTkn";
import { Icon } from "../IconCom";
import { ftGetBalance, ftGetTokenMetadata } from "@/services/token";
import { toReadableNumber } from "@/utils/numbers";
import _ from "lodash";

export default function StableAdd(props: any) {
  const { isOpen, onRequestClose, poolDetail, pureIdList, updatedMapList } =
    props;

  const [balancesList, setBalances] = useState<any>([]);
  const [inputValList, setInputValList] = useState<any>([]);

  const returnBalance = async (token: any) => {
    try {
      const data = await ftGetBalance(token.tokenId);
      const balance = toReadableNumber(token.decimals, data);
      return { balance, id: token.tokenId, symbol: token.symbol };
    } catch (error) {
      console.error("error getting balance:", error);
    }
  };

  useEffect(() => {
    const array = new Array(
      updatedMapList[0]?.token_account_ids?.length || 2
    ).fill("");
    setInputValList(array);
    const fetchBalances = async () => {
      try {
        const promises = updatedMapList[0].token_account_ids.map((token: any) =>
          returnBalance(token)
        );
        const resolvedBalances = await Promise.all(promises);
        setBalances(resolvedBalances);
      } catch (err) {
        console.log(err);
      }
    };
    fetchBalances();
  }, [updatedMapList[0]?.token_account_ids]);

  const changeVal = useCallback((e: any, ind: number) => {
    setInputValList((prev: string[]) => {
      const newValues = [...prev];
      newValues[ind] = e.target.value;
      return newValues;
    });
    debouncedSendSearchValue(e);
  }, []);

  const originalSendSearchValue = (e: any) => {
    // setSearchValue(e.target.value);
  };

  const debouncedSendSearchValue = _.debounce(originalSendSearchValue, 10);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: {
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          overflow: "auto",
        },
        content: {
          outline: "none",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <AddLiqTitleIcon />
          <LpModalCloseIcon
            className="cursor-pointer hover:opacity-90"
            onClick={onRequestClose}
          />
        </div>
        <div className="w-108 min-h-123 rounded-lg bg-dark-10 px-4 py-5">
          {updatedMapList[0]?.token_account_ids?.map(
            (ite: any, ind: number) => {
              return (
                <div key={ite.tokenId}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-gray-50 mb-2 text-sm">
                      <span>Balance: {balancesList[ind]?.balance}</span>
                      <span className="underline cursor-pointer">Max</span>
                    </div>
                    <div
                      className="flex h-16 w-full items-center border border-transparent hover:border-green-20 rounded"
                      style={{ background: "rgba(0,0,0,.2)" }}
                    >
                      <input
                        type="number"
                        className="h-16 p-3 w-74 text-white"
                        style={{ fontSize: "26px" }}
                        value={inputValList[ind]}
                        onChange={(e) => changeVal(e, ind)}
                      />
                      <Icon icon={ite.icon} className="h-7 w-7 mr-2" />
                      <span className="text-white text-base">{ite.symbol}</span>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </Modal>
  );
}
