import React, { useRef, useEffect } from "react";
import * as charts from "echarts";
import {
  formatPercentage,
  toInternationalCurrencySystem_usd,
  toInternationalCurrencySystem_number,
} from "@/utils/uiNumber";

export default function StablePoolRowCharts({
  legendJson,
  highlight,
  jsonMap,
}: {
  legendJson: any;
  highlight: any;
  jsonMap: any;
}) {
  const chartRef = useRef(null);
  const chartsDataList: any = [];

  useEffect(() => {
    const chartInstance = charts.init(chartRef.current);
    // deal data
    jsonMap.amounts.map((item: any, index: number) => {
      chartsDataList.push({
        value: Number(
          item.substring(
            0,
            item.length - jsonMap.token_account_ids[index].decimals
          )
        ),
        // name use as toInternationalCurrencySystem_number result
        name: toInternationalCurrencySystem_number(
          item.substring(
            0,
            item.length - jsonMap.token_account_ids[index].decimals
          )
        ),
      });
    });
    const totalSum = chartsDataList.reduce((accumulator: number, next: any) => {
      return accumulator + next.value;
    }, 0);

    // charts option
    const options = {
      tooltip: {
        show: false,
      },
      animation: false,
      series: [
        {
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 10,
              color: "#fff",
              formatter: "{d}%",
            },
          },
          labelLine: {
            show: false,
          },
          itemStyle: {
            borderRadius: 1,
          },
          padAngle: 5,
          data: chartsDataList,
        },
      ],
    };
    chartInstance.setOption(options);

    //add and remove hight disconnect
    if (highlight) {
      chartInstance.dispatchAction({
        type: "highlight",
        name: toInternationalCurrencySystem_number(
          jsonMap.amounts[legendJson.ind].substring(
            0,
            jsonMap.amounts[legendJson.ind].length -
              jsonMap.token_account_ids[legendJson.ind].decimals
          )
        ),
      });
    } else {
      chartInstance.dispatchAction({
        type: "downplay",
      });
    }

    // clear
    return () => {
      chartInstance.dispose();
    };
  }, [highlight]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100px",
        height: "82px",
      }}
    ></div>
  );
}
