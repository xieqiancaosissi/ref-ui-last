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
    const options = {};
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
