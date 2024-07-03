import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
  formatTokenPrice,
} from "@/utils/uiNumber";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import { toReadableNumber } from "@/utils/numbers";
import { deepCopy } from "ethers/lib/utils";
import { NearIcon } from "../../icon";

export default function StablePoolRowCharts(props: any) {
  const colorMap: any = {
    DAI: "rgba(255, 199, 0, 0.45)",
    USDT: "#167356",
    USN: "rgba(255, 255, 255, 0.45)",
    cUSD: "rgba(69, 205, 133, 0.6)",
    HBTC: "#4D85F8",
    WBTC: "#ED9234",
    STNEAR: "#A0A0FF",
    NEAR: "#A0B1AE",
    LINEAR: "#4081FF",
    NEARXC: "#4d5971",
    NearXC: "#4d5971",
    NearX: "#00676D",
    "USDT.e": "#19936D",
    "USDC.e": "#2B6EB7",
    USDC: "#2FA7DB",
    USDt: "#45D0C0",
  };
  const chartRef = useRef(null);
  const { updatedMapList, poolDetail, tokenPriceList } = props;

  useEffect(() => {
    const chartInstanceNew = charts.init(chartRef.current);
    const waitSetList: any = updatedMapList;
    const chartsData: any = [];
    waitSetList?.length > 0 &&
      waitSetList.map((item: any, index: number) => {
        item?.token_account_ids?.map((ite: any, ind: number) => {
          const tokenAmount = toReadableNumber(
            ite.decimals,
            item.supplies[ite.tokenId]
          );
          const price = tokenPriceList?.[ite.tokenId]?.price;

          chartsData.push({
            name: ite.symbol,
            value: tokenAmount,
            privateIcon: ite.icon,
            itemStyle: {
              color: "#6A7279",
            },
            emphasis: {
              itemStyle: {
                color: colorMap[ite.symbol] || "black",
              },
              label: {
                formatter(params: any) {
                  return `{bg|}\n\n{title|${
                    params.data.name
                  }}\n\n{amount|${toInternationalCurrencySystem(
                    params.data.value,
                    2
                  )}}\n\n{percent|${params.percent}%}`;
                },
                rich: {
                  bg: {
                    height: 34,
                    backgroundColor: {
                      image: ite.icon,
                    },
                  },
                  title: {
                    fontSize: "16px",
                    color: "#fff",
                  },
                  amount: {
                    color: "#fff",
                    fontSize: "26px",
                  },
                  percent: {
                    fontSize: "14px",
                    color: "#fff",
                  },
                },
              },
            },
          });
        });
      });
    // charts option
    const options = {
      tooltip: {
        show: false,
      },
      animation: false,
      series: [
        {
          type: "pie",
          radius: ["50%", "60%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              color: "#fff",
            },
          },
          labelLine: {
            show: false,
          },
          itemStyle: {
            borderRadius: 1,
          },
          padAngle: 2,
          data: chartsData,
        },
      ],
    };
    chartInstanceNew.setOption(options);

    // clear
    return () => {
      chartInstanceNew.dispose();
    };
  }, [poolDetail]);

  return (
    <div className="flex w-183 items-start">
      <div
        ref={chartRef}
        style={{
          width: "302px",
          height: "302px",
        }}
      ></div>
      <div className="flex items-center">
        <div>
          {updatedMapList.map((item: any, index: number) => {
            return item?.token_account_ids?.map((ite: any, ind: number) => {
              const tokenAmount = toReadableNumber(
                ite.decimals,
                item.supplies[ite.tokenId]
              );
              return (
                <div
                  className="flex items-center m-3 hover:opacity-90 text-sm font-normal"
                  key={ite.tokenId + ind}
                >
                  {/* token */}
                  <h4 className="text-base text-gray-60  text-left">
                    {item.token_symbols[ind]}
                  </h4>
                  {/* amounts */}
                  <div className="text-sm text-white  ml-6">
                    {+tokenAmount > 0 && +tokenAmount < 0.01
                      ? "< 0.01"
                      : toInternationalCurrencySystem(tokenAmount, 2)}
                  </div>
                </div>
              );
            });
          })}
        </div>
        <div className="text-white">
          <p>Liquidity utilisation</p>

          <p>Daily volume</p>
        </div>
      </div>
    </div>
  );
}
