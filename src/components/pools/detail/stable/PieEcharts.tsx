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
import { colorMap } from "@/utils/config";
export default function StablePoolRowCharts(props: any) {
  const chartRef = useRef(null);
  const { updatedMapList, poolDetail, tokenPriceList } = props;
  const [sumToken, setSumToken] = useState(0);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); //
    };

    window.addEventListener("resize", handleResize);
    handleResize(); //

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const chartInstanceNew = charts.init(chartRef.current);
    const waitSetList: any = updatedMapList;
    const chartsData: any = [];
    let sumToken = 0;

    waitSetList?.length > 0 &&
      waitSetList.map((item: any, index: number) => {
        item?.token_account_ids?.map((ite: any, ind: number) => {
          const tokenAmount = toReadableNumber(
            ite.decimals,
            item.supplies[ite.tokenId]
          );
          sumToken += +tokenAmount;
          chartsData.push({
            name: ite.symbol,
            value: tokenAmount,
            privateIcon: ite.icon,
            itemStyle: {
              color: isMobile
                ? colorMap[ite.symbol] || "black"
                : "rgba(255,255,255,.3)",
            }, //mobile do not use rgba(255,255,255,.3)
            label: isMobile
              ? {
                  formatter(params: any) {
                    return `{bg|}\n{title|${
                      params.data.name
                    }}\n{amount|${toInternationalCurrencySystem(
                      params.data.value,
                      2
                    )}}\n{percent|${params.percent}%}\n`;
                  },
                  rich: {
                    bg: {
                      height: 18,
                      backgroundColor: {
                        image:
                          ite.symbol == "NEAR" ? "/images/near.png" : ite.icon,
                      },
                    },
                    title: {
                      fontSize: "12px",
                      color: "#91A2AE",
                    },
                    amount: {
                      color: "#fff",
                      fontSize: "10px",
                    },
                    percent: {
                      fontSize: "10px",
                      color: "#fff",
                    },
                  },
                }
              : {},
            emphasis: {
              itemStyle: {
                color: colorMap[ite.symbol] || "black",
              },
              label: {
                formatter(params: any) {
                  return `{bg|}${isMobile ? "\n" : "\n\n"}{title|${
                    params.data.name
                  }}${
                    isMobile ? "\n" : "\n\n"
                  }{amount|${toInternationalCurrencySystem(
                    params.data.value,
                    2
                  )}}\n{percent|${params.percent}%}\n`;
                },
                rich: {
                  bg: {
                    height: isMobile ? 18 : 34,
                    backgroundColor: {
                      image:
                        ite.symbol == "NEAR" ? "/images/near.png" : ite.icon,
                    },
                  },
                  title: {
                    fontSize: isMobile ? "12px" : "16px",
                    color: isMobile ? "#91A2AE" : "#fff",
                  },
                  amount: {
                    color: "#fff",
                    fontSize: isMobile ? "10px" : "26px",
                  },
                  percent: {
                    fontSize: isMobile ? "10px" : "14px",
                    color: "#fff",
                  },
                },
              },
            },
          });
        });
      });
    setSumToken(sumToken);
    // charts option
    const options = {
      tooltip: {
        show: false,
      },
      animation: false,
      series: [
        {
          type: "pie",
          radius: isMobile ? ["40%", "50%"] : ["50%", "62%"],
          avoidLabelOverlap: false,
          label: {
            show: isMobile ? true : false,
            position: isMobile ? "outside" : "center",
          },
          emphasis: {
            label: {
              show: true,
              color: "#fff",
            },
          },
          labelLine: {
            show: isMobile ? true : false,
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
    const handleResize = () => {
      if (chartInstanceNew) {
        chartInstanceNew.resize();
      }
    };

    window.addEventListener("resize", handleResize);

    // 清理函数
    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartInstanceNew) {
        chartInstanceNew.dispose(); // 销毁ECharts实例
      }
    };
  }, [poolDetail, isMobile]);

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
    <div
      className="flex xsm:flex-col w-full lg:pl-20 xsm:mb-12 xsm:p-2 items-start xsm:rounded-md"
      style={{
        background: isMobile ? "rgba(33, 43, 53, 0.3)" : "",
      }}
    >
      <div
        ref={chartRef}
        style={{
          width: isMobile ? "100%" : "302px",
          height: "302px",
        }}
      ></div>
      <div className="flex items-start lg:mt-16 xsm:w-full xsm:hidden">
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
                    <div className=" text-white  lg:ml-6">
                      {+tokenAmount > 0 && +tokenAmount < 0.01
                        ? "< 0.01"
                        : toInternationalCurrencySystem(tokenAmount, 2) +
                          `  (${formatPercentage(
                            (+tokenAmount / sumToken) * 100
                          )})`}
                    </div>
                  ) : (
                    <div className=" text-white  lg:ml-6">0</div>
                  )}
                </div>
              );
            });
          })}
          <div className="flex items-center m-3 hover:opacity-90 text-sm font-normal">
            <h4 className=" text-gray-60  text-left w-13">TVL</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.tvl)}
            </div>
          </div>
        </div>
        <div className="text-white ml-20 text-sm">
          <div className="flex m-3">
            <h4 className=" text-gray-60  text-left lg:w-40 flex items-center">
              Liquidity utilisation
              <HoverTip
                msg={"24H Volume / Liquidity ratio"}
                extraStyles={"w-43"}
              />
            </h4>
            <div className="text-white  lg:ml-6">
              {utilisationDisplay || "-"}
            </div>
          </div>
          <div className="flex m-3">
            <h4 className=" text-gray-60  text-left lg:w-40">Daily volume</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.volume_24h)}
            </div>
          </div>
        </div>
      </div>

      {/* mobile */}
      <div className="flex flex-col items-start lg:mt-16 xsm:w-full lg:hidden">
        <div className="w-full">
          {updatedMapList.map((item: any, index: number) => {
            return item?.token_account_ids?.map((ite: any, ind: number) => {
              const tokenAmount = toReadableNumber(
                ite.decimals,
                item.supplies[ite.tokenId]
              );
              return (
                <div
                  className="flex items-center m-3 hover:opacity-90 text-sm font-normal justify-between"
                  key={ite.tokenId + ind}
                >
                  {/* token */}
                  <h4 className=" text-gray-60  text-left w-13">
                    {item.token_symbols[ind]}
                  </h4>
                  {/* amounts */}
                  {sumToken ? (
                    <div className=" text-white  lg:ml-6">
                      {+tokenAmount > 0 && +tokenAmount < 0.01
                        ? "< 0.01"
                        : toInternationalCurrencySystem(tokenAmount, 2) +
                          `  (${formatPercentage(
                            (+tokenAmount / sumToken) * 100
                          )})`}
                    </div>
                  ) : (
                    <div className=" text-white  lg:ml-6">0</div>
                  )}
                </div>
              );
            });
          })}
          <div className="flex items-center mx-3 hover:opacity-90 text-sm font-normal justify-between">
            <h4 className=" text-gray-60  text-left w-13">TVL</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.tvl)}
            </div>
          </div>
        </div>
        <div className="text-white text-sm w-full">
          <div className="flex m-3 items-center justify-between">
            <h4 className=" text-gray-60  text-left lg:w-40 flex items-center">
              Liquidity utilisation
              <HoverTip
                msg={"24H Volume / Liquidity ratio"}
                extraStyles={"w-43"}
              />
            </h4>
            <div className="text-white  lg:ml-6">
              {utilisationDisplay || "-"}
            </div>
          </div>
          <div className="flex m-3 items-center justify-between">
            <h4 className=" text-gray-60  text-left lg:w-40">Daily volume</h4>
            <div className="text-white  lg:ml-6">
              {toInternationalCurrencySystem_usd(poolDetail?.volume_24h)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
