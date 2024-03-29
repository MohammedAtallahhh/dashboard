"use client";

import React from "react";
import * as d3 from "d3";

import LineChart from "../LineChart/LineChart";

const BitcoinVSSP500SixMonthChange = ({ data, color }) => {
  const { major4TotalData, sp500GlobalLiquidityData, btcGlobalLiquidityData } =
    data;
  return (
    <LineChart
      {...{
        id: "bitcoin-vs-sp500-six-month-change",
        title:
          "% 6-Month Change in Global Central Bank Assets vs SP500 vs. Bitcoin",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "Assets (6MoM%)",
              values: major4TotalData.map((d) => d["6mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "SP500 (6MoM%)",
              values: sp500GlobalLiquidityData.map((d) => d["6mom"]),
              format: d3.format(",.1%"),
              axisIndex: 1,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "BTC (6MoM%)",
              values: btcGlobalLiquidityData.map((d) => d["6mom"]),
              format: d3.format(",.1%"),
              axisIndex: 2,
            },
          ],
          dates: major4TotalData.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "Assets (6MoM%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[0],
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "SP500 (6MoM%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[1],
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "BTC (6MoM%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[2],
              axisSide: "left",
              alignZero: true,
            },
          ],
          yAlignZero: true,
        },
        peripherals: {
          highlightedAreas: [
            {
              y0: 0,
              y1: -Infinity,
              axisIndex: 0,
              color: color.lineArea.highlight,
            },
          ],
        },
      }}
    />
  );
};

export default BitcoinVSSP500SixMonthChange;
