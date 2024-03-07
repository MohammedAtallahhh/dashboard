"use client";
import React from "react";

import * as d3 from "d3";

import ScatterTimeChart from "../ScatterTimeChart/ScatterTimeChart";

const SP500VSCentralBank = ({ data, color }) => {
  const { major4TotalData, sp500GlobalLiquidityData } = data;
  return (
    <ScatterTimeChart
      {...{
        id: "sp500-vs-central-bank",
        title: "SP500 vs Central Bank Total Assets: FED, PBOC, ECB, BOJ",
        data: {
          x: {
            label: "Major 4 Total Assets",
            values: major4TotalData.map((d) => d.value),
            format: (d) => d3.format("$,.0f")(d) + "B",
          },
          y: {
            label: "SP500",
            values: sp500GlobalLiquidityData.map((d) => d.value),
            format: d3.format(","),
          },
          dates: major4TotalData.map((d) => d.date),
          color: color.scatter.default,
        },
        axes: {
          x: {
            label: "Assets ($B)",
            format: d3.format("$,d"),
          },
          y: {
            label: "SP500",
            format: d3.format(","),
          },
        },
        peripherals: {
          highlightedPoints: {
            n: 30,
            color: color.scatter.highlight,
          },
        },
      }}
    />
  );
};

export default SP500VSCentralBank;
