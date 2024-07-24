import React, { useState, useEffect } from "react";
import { TokenMetadata } from "@/services/ft-contract";
import { toRealSymbol } from "@/services/farm";
import { Pool } from "@/interfaces/swap";
import { FiExternalLink } from "react-icons/fi";
import { openUrl } from "@/services/commonV3";
import { FaAngleUp } from "@react-icons/all-files/fa/FaAngleUp";
import { FaAngleDown } from "@react-icons/all-files/fa/FaAngleDown";
import {
  toInternationalCurrencySystem,
  toReadableNumber,
} from "@/utils/numbers";

function DetailIcons({ tokens }: { tokens: TokenMetadata[] }) {
  return (
    <div className="flex items-center">
      {tokens.map((token, index) => {
        return token.icon ? (
          <img
            src={token.icon}
            className={`w-6 h-6 rounded-full border border-gradientFrom bg-cardBg ${
              index != 0 ? "-ml-1" : ""
            }`}
            alt=""
          />
        ) : (
          <div
            className={`w-6 h-6 rounded-full border border-gradientFrom bg-cardBg ${
              index != 0 ? "-ml-1" : ""
            }`}
          ></div>
        );
      })}
    </div>
  );
}

function DetailSymbol({
  tokens,
  id,
}: {
  tokens: TokenMetadata[];
  id: string | number;
}) {
  return (
    <div className="text-sm text-gray-50 flex items-center">
      <span className="pl-2">
        {tokens.map((token) => toRealSymbol(token.symbol)).join("-")}
      </span>

      <span
        className="cursor-pointer pl-2 py-0.5 text-gradientFrom"
        onClick={() => openUrl(`/pool/classic/${id}`)}
      >
        <FiExternalLink />
      </span>
    </div>
  );
}

export function PoolDetailCard({
  tokens_o,
  pool,
  poolDetail,
}: {
  tokens_o: TokenMetadata[];
  pool: Pool;
  poolDetail: any;
}) {
  const tokens: TokenMetadata[] = tokens_o
    ? JSON.parse(JSON.stringify(tokens_o))
    : [];
  tokens?.sort((a, b) => {
    if (a.symbol === "NEAR") return 1;
    if (b.symbol === "NEAR") return -1;
    return 0;
  });
  const [showDetail, setShowDetail] = useState(false);

  const DetailRow = ({
    value,
    valueTitle,
    title,
  }: {
    value: JSX.Element | string;
    valueTitle?: string;
    title: JSX.Element | string;
  }) => {
    return (
      <div className="flex items-center justify-between pt-4 text-gray-50 text-sm">
        <div>{title}</div>
        <div title={valueTitle}>{value}</div>
      </div>
    );
  };

  return (
    <div className=" mt-3 text-xs w-full right-0">
      <div className="detail-header flex items-center justify-between px-4">
        <div className="flex items-center">
          <DetailIcons tokens={tokens} />
          <DetailSymbol tokens={tokens} id={pool.id} />
        </div>
        <div
          className="cursor-pointer text-gray-50 flex items-center text-sm"
          onClick={() => setShowDetail(!showDetail)}
        >
          <span>Pool Stats</span>
          <span>
            <div className="pl-1">
              {showDetail ? <FaAngleUp /> : <FaAngleDown />}
            </div>
          </span>
        </div>
      </div>
      {!showDetail ? null : (
        <div className="border border-gray-90 rounded px-4 pb-4 mt-3">
          {" "}
          <DetailRow
            title={"TVL"}
            value={
              !poolDetail?.tvl
                ? "-"
                : `$${
                    Number(poolDetail?.tvl) < 0.01 &&
                    Number(poolDetail?.tvl) > 0
                      ? "< 0.01"
                      : toInternationalCurrencySystem(poolDetail?.tvl || "0", 2)
                  }`
            }
            valueTitle={poolDetail?.tvl}
          />
          <DetailRow
            title={toRealSymbol(tokens[0].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[0].decimals, pool.supplies[tokens[0].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[0].decimals,
              pool.supplies[tokens[0].id]
            )}
          />
          <DetailRow
            title={toRealSymbol(tokens[1].symbol)}
            value={toInternationalCurrencySystem(
              toReadableNumber(tokens[1].decimals, pool.supplies[tokens[1].id]),
              2
            )}
            valueTitle={toReadableNumber(
              tokens[1].decimals,
              pool.supplies[tokens[1].id]
            )}
          />
          <DetailRow
            title={"24h volume"}
            value={
              poolDetail?.volume_24h
                ? toInternationalCurrencySystem(poolDetail?.volume_24h, 2)
                : "-"
            }
            valueTitle={poolDetail?.volume_24h || ""}
          />
          <DetailRow title={"Fee"} value={`${poolDetail.total_fee * 100}%`} />
        </div>
      )}
    </div>
  );
}
