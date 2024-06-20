import { addThousandSeparator } from "@/utils/uiNumber";

export const timeTabList = [
  {
    key: 7,
    value: "7D",
  },
  {
    key: 30,
    value: "30D",
  },
  {
    key: 90,
    value: "90D",
  },
  {
    key: 180,
    value: "180D",
  },
];

// echarts config above
export const colorStopTvl = [
  {
    offset: 0,
    color: "rgba(158, 255, 0, 0.3)",
  },
  {
    offset: 1,
    color: "rgba(158, 254, 1, 0.1)", //
  },
];

export const colorStop24H = [
  {
    offset: 0,
    color: "rgba(101, 126, 255, 0.3)",
  },
  {
    offset: 1,
    color: "rgba(101, 126, 255, 0.1)", //
  },
];

export const chartsOtherConfig = {
  yAxis: {
    type: "value",
    show: false,
  },
  tooltip: {
    trigger: "axis",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    position: [350, 10],
    valueFormatter: (value: any) =>
      "$" + addThousandSeparator(value.toFixed(2)),
  },
  grid: {
    left: "-8%",
    right: "0%",
    bottom: "40%",
    containLabel: true,
  },
  axisPointer: {
    //
    type: "line", //
    axis: "y",
    label: {
      show: false,
    },
  },
  series: {
    areaStyle: {
      normal: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          global: false, //
        },
      },
    },
    itemStyle: {
      normal: {
        color: "transparent", // hover
        opacity: 0,
      },
    },
  },
};
