import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
} from "@/utils/uiNumber";
import { toInternationalCurrencySystem } from "@/utils/numbers";
import { toReadableNumber } from "@/utils/numbers";
import HoverTip from "@/components/common/Tips";
import BigNumber from "bignumber.js";

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
  const [sumToken, setSumToken] = useState(0);
  useEffect(() => {
    const chartInstanceNew = charts.init(chartRef.current);
    const waitSetList: any = updatedMapList;
    const chartsData: any = [];
    setSumToken(0);
    waitSetList?.length > 0 &&
      waitSetList.map((item: any, index: number) => {
        item?.token_account_ids?.map((ite: any, ind: number) => {
          const tokenAmount = toReadableNumber(
            ite.decimals,
            item.supplies[ite.tokenId]
          );
          setSumToken((previous) => +tokenAmount + previous);
          chartsData.push({
            name: ite.symbol,
            value: tokenAmount,
            privateIcon: ite.icon,
            itemStyle: {
              color: "rgba(255,255,255,.3)",
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
                  )}}\n{percent|${params.percent}%}\n`;
                },
                rich: {
                  bg: {
                    height: 34,
                    backgroundColor: {
                      image:
                        ite.symbol == "NEAR" ? "/images/near.png" : ite.icon,
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
          radius: ["50%", "62%"],
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

  //
  let utilisationDisplay;
  if (poolDetail?.tvl) {
    const utilisation = new BigNumber(poolDetail.volume_24h)
      .dividedBy(poolDetail.tvl)
      .multipliedBy(100);
    if (new BigNumber("0.01").isGreaterThan(utilisation)) {
      utilisationDisplay = "<0.01%";
    } else {
      utilisationDisplay = utilisation.toFixed(2) + "%";
    }
  }

  return (
    <div className="flex w-full pl-20 items-start">
      <div
        ref={chartRef}
        style={{
          width: "302px",
          height: "302px",
        }}
      ></div>
      <div className="flex items-start mt-16">
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
                  <h4 className=" text-gray-60  text-left w-13">
                    {item.token_symbols[ind]}
                  </h4>
                  {/* amounts */}
                  {sumToken ? (
                    <div className=" text-white  ml-6">
                      {+tokenAmount > 0 && +tokenAmount < 0.01
                        ? "< 0.01"
                        : toInternationalCurrencySystem(tokenAmount, 2) +
                          `  (${formatPercentage(
                            (+tokenAmount / sumToken) * 100
                          )})`}
                    </div>
                  ) : (
                    <div className=" text-white  ml-6">0</div>
                  )}
                </div>
              );
            });
          })}
          <div className="flex items-center m-3 hover:opacity-90 text-sm font-normal">
            <h4 className=" text-gray-60  text-left w-13">TVL</h4>
            <div className="text-white  ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.tvl)}
            </div>
          </div>
        </div>
        <div className="text-white ml-20 text-sm">
          <div className="flex m-3">
            <h4 className=" text-gray-60  text-left w-40 flex items-center">
              Liquidity utilisation
              <HoverTip
                msg={"24H Volume / Liquidity ratio"}
                extraStyles={"w-43"}
              />
            </h4>
            <div className="text-white  ml-6">{utilisationDisplay || "-"}</div>
          </div>
          <div className="flex m-3">
            <h4 className=" text-gray-60  text-left w-40">Daily volume</h4>
            <div className="text-white  ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.volume_24h)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
