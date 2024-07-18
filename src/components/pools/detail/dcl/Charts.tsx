import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import styles from "./style.module.css";
import { useV3MonthTVL, useV3MonthVolume } from "@/hooks/usePoolDetailCharts";
import LiquidityCharts from "./LiquidityCharts";
import {
  toInternationalCurrencySystem_number,
  toInternationalCurrencySystem_usd,
} from "@/utils/uiNumber";
import { SplitRectangleIcon, ExchangeIcon } from "@/components/pools/icon";
import moment from "moment";
import DclChart from "./d3Chart/DclChart";
import { isMobile } from "@/utils/device";
import { TOKEN_LIST_FOR_RATE } from "@/services/commonV3";

export default function TvlAndVolumeCharts(props: any) {
  const [rateDirection, setRateDirection] = useState(true);
  const [isActive, setActive] = useState("tvl");
  const [isFinished, setIsFinished] = useState(false);
  const { poolDetail, tokenPriceList } = props;
  const { monthTVLById, xTvl, yTvl } = useV3MonthTVL(poolDetail.id);
  const { monthVolumeById, xMonth, yMonth } = useV3MonthVolume(poolDetail.id);
  const refDom: any = useRef(null);
  const [currentSort, setCurrenSort] = useState([0, 1]);
  const svgDefaultWidth = isMobile()
    ? document.documentElement.clientWidth - 32 || "330"
    : 736;
  const [svgWidth, setSvgWidth] = useState(svgDefaultWidth);
  const exchange = () => {
    const [a, b] = currentSort;
    setCurrenSort([b, a]);
  };
  const poolTypeList = [
    {
      key: "liquidity",
      value: "Liquidity",
    },
    {
      key: "tvl",
      value: "TVL",
    },
    {
      key: "24h",
      value: "Volume",
    },
  ];
  let timer: any;
  useEffect(() => {
    if (isMobile()) return;
    if (refDom.current) {
      setSvgWidth(refDom?.current?.clientWidth || svgDefaultWidth);
      window.onresize = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setSvgWidth(refDom?.current?.clientWidth || svgDefaultWidth);
        }, 50);
      };
    }
  }, [refDom.current]);
  useEffect(() => {
    if (poolDetail?.token_symbols) {
      if (TOKEN_LIST_FOR_RATE.indexOf(poolDetail?.token_symbols[0]) > -1) {
        setRateDirection(false);
      } else {
        setRateDirection(true);
      }
    }
  }, [poolDetail]);

  useEffect(() => {
    // @ts-ignore
    if (monthVolumeById?.length > 0) {
      setIsFinished(true);
    }
  }, [monthVolumeById]);

  function switchRate() {
    setRateDirection(!rateDirection);
  }

  return (
    <div>
      {/* tab bar */}
      <div className="flex justify-between mt-12 mb-5">
        <div className={styles.chartsFilterPoolType}>
          {poolTypeList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-100 rounded"
                      : "text-gray-60"
                  }
                   w-18 h-8 frcc text-sm hover:text-white 
                `}
                onClick={() => {
                  setActive(item.key);
                }}
              >
                {item.value}
              </div>
            );
          })}
        </div>
        <div className="text-sm text-white">
          <h3 className="text-gray-50 font-normal text-right">Current Price</h3>
          <p className="frcc">
            <ExchangeIcon
              className="mt-auto mr-1 mb-1 cursor-pointer opacity-40 hover:opacity-100"
              onClick={() => {
                exchange();
                switchRate();
              }}
            />
            {/* dom render in html formatter above: 1 Near($5.2) = 7Ref */}
            <span className="mr-1">1</span>
            {/* token left name */}
            {poolDetail?.token_symbols[currentSort[0]] == "wNEAR"
              ? "NEAR"
              : poolDetail?.token_symbols[currentSort[0]]}
            {/* usd price */}
            {tokenPriceList && poolDetail && (
              <span className="text-gray-50 font-normal">
                (
                {toInternationalCurrencySystem_usd(
                  tokenPriceList[poolDetail.token_account_ids[currentSort[0]]]
                    .price
                )}
                )
              </span>
            )}
            <span className="mx-1">=</span>
            {/* token right amount */}
            {tokenPriceList && poolDetail && (
              <span className="mr-1">
                {((tokenPriceList[poolDetail?.token_account_ids[currentSort[0]]]
                  .price /
                  tokenPriceList[poolDetail?.token_account_ids[currentSort[1]]]
                    .price) *
                  100) /
                  100}
              </span>
            )}
            {/* token right name */}
            {poolDetail?.token_symbols[currentSort[1]] == "wNEAR"
              ? "NEAR"
              : poolDetail?.token_symbols[currentSort[1]]}
          </p>
        </div>
      </div>

      {/* charts */}
      {isFinished && (
        <div className={styles.chartsContent} ref={refDom}>
          {isActive == "tvl" && poolDetail.id && (
            <TVlCharts {...{ poolId: poolDetail.id, xTvl, yTvl }} />
          )}
          {isActive == "24h" && poolDetail.id && (
            <VolumeCharts {...{ poolId: poolDetail.id, xMonth, yMonth }} />
          )}
          {isActive == "liquidity" && poolDetail.id && (
            <DclChart
              pool_id={poolDetail.id}
              config={{
                controlHidden: true,
                svgWidth,
                svgHeight: isMobile() ? "250" : "450",
              }}
              reverse={!rateDirection}
            ></DclChart>
          )}
        </div>
      )}
    </div>
  );
}

// tvl charts
export function TVlCharts(props: any) {
  const chartRef = useRef(null);
  const { xTvl, yTvl } = props;
  const formatAxisLable = (str: string) => {
    const momentDate = moment(str, "MMM DD, YYYY");
    if (momentDate.isValid()) {
      const day = momentDate.format("DD");
      return day;
    } else {
      const regex = /(\d{2}),/;
      const match = str.match(regex);
      if (match) {
        return match[1];
      }
    }
  };

  useEffect(() => {
    const chartInstance = charts?.init(chartRef.current);
    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xTvl,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          margin: 17,
          formatter(value: string) {
            return formatAxisLable(value);
          },
          color: "#91A2AE",
        },
      },
      yAxis: {
        type: "value",
        show: false,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "transparent",
        borderWidth: 0,
        borderColor: "transparent",
        position: [600, 0],
        formatter(params: any) {
          let result = `<div style="display:flex;justify-content: space-between;font-size:14px;"> ${params[0].axisValue} </div>`; //
          for (let i = 0, l = params.length; i < l; i++) {
            result += `<div style="display:flex;justify-content: space-between;"><span style="color:white;font-size:16px;font-weight:700;">$${toInternationalCurrencySystem_number(
              params[i].value
            )}</span></div>`;
          }

          const formatDom = `<div style="height: 39px; width: 72px;display:flex; flex-direction:column;justify-content: space-between;align-items: center;font-weight: 400;font-family:SpaceGrotesk">${result}</div>`;
          return formatDom;
        },
      },
      grid: {
        left: "-6%",
        right: "2%",
        bottom: "20%",
        containLabel: true,
      },
      axisPointer: {
        //
        type: "line", //
        axis: "y",
        label: {
          show: false,
        },
        lineStyle: {
          color: "#9EFE01",
        },
      },
      series: {
        data: yTvl,
        type: "line",
        areaStyle: {
          normal: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              global: false, //
              colorStops: [
                {
                  offset: 0,
                  color: "rgba(158, 255, 0, 0.3)",
                },
                {
                  offset: 1,
                  color: "rgba(158, 254, 1, 0.1)", //
                },
              ],
            },
          },
        },
        lineStyle: {
          color: "#9EFE01",
          width: 2,
        },
        itemStyle: {
          normal: {
            color: "transparent", // hover
            opacity: 0,
          },
        },
        emphasis: {
          itemStyle: {
            color: "#9EFE01",
            opacity: 1,
          },
        },
      },
    };

    chartInstance.setOption(options);
    return () => {
      chartInstance.dispose();
    };
  }, []);
  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "540px",
      }}
    ></div>
  );
}

// volume charts
export function VolumeCharts(props: any) {
  const chartRef = useRef(null);
  const { xMonth, yMonth } = props;

  const formatAxisLable = (str: string) => {
    const momentDate = moment(str, "MMM DD, YYYY");
    if (momentDate.isValid()) {
      const day = momentDate.format("DD");
      return day;
    } else {
      const regex = /(\d{2}),/;
      const match = str.match(regex);
      if (match) {
        return match[1];
      }
    }
  };

  useEffect(() => {
    const chartInstance = charts?.init(chartRef.current);
    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: xMonth,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          margin: 17,
          formatter(value: string) {
            return formatAxisLable(value);
          },
          color: "#91A2AE",
        },
      },
      yAxis: {
        type: "value",
        show: false,
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "transparent",
        borderWidth: 0,
        borderColor: "transparent",
        position: [600, 0],
        formatter(params: any) {
          let result = `<div style="display:flex;justify-content: space-between;font-size:14px;"> ${params[0].axisValue} </div>`; //
          for (let i = 0, l = params.length; i < l; i++) {
            result += `<div style="display:flex;justify-content: space-between;"><span style="color:white;font-size:16px;font-weight:700;">$${toInternationalCurrencySystem_number(
              params[i].value
            )}</span></div>`;
          }

          const formatDom = `<div style="height: 39px; width: 72px;display:flex; flex-direction:column;justify-content: space-between;align-items: center;font-weight: 400;font-family:SpaceGrotesk">${result}</div>`;
          return formatDom;
        },
      },
      grid: {
        left: "-6%",
        right: "2%",
        bottom: "20%",
        containLabel: true,
      },
      axisPointer: {
        //
        type: "line", //
        axis: "y",
        label: {
          show: false,
        },
        lineStyle: {
          color: "#8C9CA8",
        },
      },
      series: {
        data: yMonth,
        type: "bar",
        barWidth: 10,
        itemStyle: {
          normal: {
            color: "#1D2932", // hover
            opacity: 1,
          },
        },
        emphasis: {
          itemStyle: {
            color: "#9EFE01",
            opacity: 1,
          },
        },
      },
    };

    chartInstance.setOption(options);
    return () => {
      chartInstance.dispose();
    };
  }, []);
  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: "540px",
      }}
    ></div>
  );
}
