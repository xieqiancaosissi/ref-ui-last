import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import Big from "big.js";
import styles from "./charts.module.css";
import {
  colorStop24H,
  colorStopTvl,
  chartsOtherConfig,
  timeTabList,
} from "./config";
import {
  addThousandSeparator,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";
import { getPoolIndexTvlOR24H, getAllPoolData } from "@/services/pool";

export default function Charts({
  title,
  type,
}: {
  title: string;
  type: string;
}) {
  const chartRef = useRef(null);
  const [isActive, setActive] = useState(30);
  const [chartsData, setChartsData] = useState<any>(null);
  const [allTVL, setAllTVL] = useState<string>();

  const [allVolume24h, setAllVolume24h] = useState<string>();
  // init charts
  useEffect(() => {
    const chartInstance = charts.init(chartRef.current);

    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: chartsData?.date,
        show: false,
      },
      yAxis: chartsOtherConfig(type).yAxis,
      tooltip: Object.assign(chartsOtherConfig(type).tooltip, {
        textStyle: {
          color: type == "tvl" ? "#9EFE01" : "#657EFF",
        },
      }),
      grid: chartsOtherConfig(type).grid,
      axisPointer: {
        ...chartsOtherConfig(type).axisPointer,
        lineStyle: {
          color: type == "tvl" ? "#9EFE01" : "#657EFF",
        },
      },
      series: [
        {
          data: chartsData?.list,
          type: "line",
          areaStyle: {
            normal: {
              color: {
                ...chartsOtherConfig(type).series.areaStyle.normal.color,
                colorStops: type == "tvl" ? colorStopTvl : colorStop24H,
              },
            },
          },
          lineStyle: {
            color: type == "tvl" ? "#9EFE01" : "#657EFF",
            width: 1,
          },
          itemStyle: chartsOtherConfig(type).series.itemStyle,
          emphasis: {
            itemStyle: {
              color: type == "tvl" ? "#9EFE01" : "#657EFF",
              opacity: 1,
            },
          },
        },
      ],
    };
    chartInstance.setOption(options);
    return () => {
      chartInstance.dispose();
    };
  }, [chartsData]);

  // mock data
  useEffect(() => {
    getPoolIndexTvlOR24H(type, isActive).then((res) => {
      setChartsData(res);
    });
    getAllPoolData().then((res) => {
      setAllTVL(res.tvl);
      setAllVolume24h(res.volume_24h);
    });
  }, [isActive]);

  return (
    <div className="relative">
      {/* title & tab */}
      <div className={styles.chartsTitle}>
        <div>
          <div className="text-gray-50 text-sm">{title}</div>
          <div className="text-white text-xl">
            $
            {addThousandSeparator(
              type == "tvl"
                ? new Big(allTVL || "0").toFixed(2)
                : new Big(allVolume24h || "0").toFixed(2)
            )}
          </div>
        </div>
        <div className="text-xs cursor-pointer">
          {timeTabList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  ${
                    isActive == item.key
                      ? "text-white bg-gray-100 rounded"
                      : "text-gray-60"
                  }
                   w-8 h-5 flex items-center justify-center ml-2
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
      </div>
      {/* main charts */}
      <div className={styles.chartsContent}>
        <div
          ref={chartRef}
          style={{
            width: "100%",
            height: "260px",
          }}
        ></div>
      </div>
    </div>
  );
}
