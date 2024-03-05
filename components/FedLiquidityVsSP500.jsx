"use client";

import * as d3 from "d3";

import LineChart from "./LineChart/LineChart";

const FedLiquidityVsSP500 = ({ color, data }) => {
  const { netLiquidityData, sp500Data, btcData } = data;

  return (
    <LineChart
      {...{
        id: "c",
        title: "Fed Liquidity vs SP500",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "Net Liquidity",
              values: netLiquidityData.map((d) => d.value),
              format: (d) => d3.format("$,.1f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "SP500",
              values: sp500Data.map((d) => d.value),
              format: d3.format(","),
              axisIndex: 1,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "BTC",
              values: btcData.map((d) => d.value),
              format: d3.format("$,.0f"),
              axisIndex: 2,
            },
          ],
          dates: sp500Data.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "Fed Assets ($B)",
              format: d3.format("$,.1~f"),
              color: color.lineArea.lines[0],
              axisSide: "left",
            },
            {
              label: "SP500",
              format: d3.format(","),
              color: color.lineArea.lines[1],
              axisSide: "right",
            },
            {
              label: "BTC",
              format: d3.format("$,.0f"),
              color: color.lineArea.lines[2],
              axisSide: "right",
            },
          ],
        },
      }}
    />
  );
};

export default FedLiquidityVsSP500;
