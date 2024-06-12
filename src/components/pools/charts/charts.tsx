import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import styles from "./charts.module.css";
import {
  colorStop24H,
  colorStopTvl,
  chartsOtherConfig,
  timeTabList,
} from "./config";
import { addThousandSeparator } from "@/utils/uiNumber";

export default function Charts({
  title,
  type,
}: {
  title: string;
  type: string;
}) {
  const chartRef = useRef(null);
  const [isActive, setActive] = useState("7D");
  const [chartsData, setChartsData] = useState<Array<number>>([]);

  // mock data
  useEffect(() => {
    setTimeout(() => {
      setChartsData([0, 1400, 9000, 2000, 1000, 1800, 20]);
    }, 500);
  }, []);

  // init charts
  useEffect(() => {
    const chartInstance = charts.init(chartRef.current);

    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["", "", "", "", "", "", ""],
        show: false,
      },
      yAxis: chartsOtherConfig.yAxis,
      tooltip: chartsOtherConfig.tooltip,
      grid: chartsOtherConfig.grid,
      axisPointer: {
        ...chartsOtherConfig.axisPointer,
        lineStyle: {
          color: type == "tvl" ? "#9EFE01" : "#657EFF",
        },
      },
      series: [
        {
          data: chartsData,
          type: "line",
          areaStyle: {
            normal: {
              color: {
                ...chartsOtherConfig.series.areaStyle.normal.color,
                colorStops: type == "tvl" ? colorStopTvl : colorStop24H,
              },
            },
          },
          lineStyle: {
            color: type == "tvl" ? "#9EFE01" : "#657EFF",
            width: 1,
          },
          itemStyle: chartsOtherConfig.series.itemStyle,
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

  return (
    <div className="relative">
      {/* title & tab */}
      <div className={styles.chartsTitle}>
        <div>
          <div className="text-gray-50 text-sm">{title}</div>
          <div className="text-white text-xl">
            ${addThousandSeparator(7405110.345)}
          </div>
        </div>
        <div className="text-xs cursor-pointer">
          {timeTabList.map((item, index) => {
            return (
              <div
                key={item.key + index}
                className={`
                  ${
                    isActive == item.value
                      ? "text-white bg-gray-100 rounded"
                      : "text-gray-60"
                  }
                   w-8 h-5 flex items-center justify-center ml-2
                `}
                onClick={() => {
                  setActive(item.value);
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
