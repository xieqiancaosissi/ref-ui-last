import React, { useRef, useEffect, useState } from "react";
import * as charts from "echarts";
import styles from "./charts.module.css";

export default function Charts({ title }: { title: string }) {
  const chartRef = useRef(null);
  const [isActive, setActive] = useState("7D");
  const timeTabList = [
    {
      key: "7",
      value: "7D",
    },
    {
      key: "30",
      value: "30D",
    },
    {
      key: "90",
      value: "90D",
    },
    {
      key: "180",
      value: "180D",
    },
  ];

  // init charts
  useEffect(() => {
    const chartInstance = charts.init(chartRef.current);
    const options = {
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        show: false,
      },
      yAxis: {
        type: "value",
        show: false,
      },
      series: [
        {
          data: [0, 8000, 2000, 14000, 12000, 13300, 10],
          type: "line",
          symbol: "none",
          areaStyle: {
            normal: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
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
                global: false, //
              },
            },
          },
          lineStyle: {
            color: "#9EFE01",
            width: 1,
          },
        },
      ],
      // axisPointer: {
      //   show: true,
      //   type: "line",
      //   lineStyle: {
      //     cap: "round",
      //   },
      // },
    };
    chartInstance.setOption(options);
    return () => {
      chartInstance.dispose();
    };
  }, []);

  return (
    <div>
      {/* title & tab */}
      <div className={styles.chartsTitle}>
        <div>
          <div className="text-gray-50 text-sm">{title}</div>
          <div className="text-white text-xl">$7,405,110.345</div>
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
      <div ref={chartRef} className={styles.chartsContent}></div>
    </div>
  );
}
