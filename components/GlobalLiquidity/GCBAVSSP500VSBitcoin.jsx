"use client";

import React from "react";
import * as d3 from "d3";

import LineChart from "../LineChart/LineChart";

const GCBAVSSP500VSBitcoin = ({ data, color }) => {
  const {
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
    sp500GlobalLiquidityData,
    btcGlobalLiquidityData,
  } = data;
  return (
    <LineChart
      {...{
        id: "GCBA-vs-SP500-vs-Bitcoin",
        title: "Global Central Bank Assets vs SP500 vs. Bitcoin",
        data: {
          series: [
            {
              type: "stackedArea",
              color: color.lineArea.areas[0],
              label: "Fed",
              values: fedBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "stackedArea",
              color: color.lineArea.areas[1],
              label: "PBoC",
              values: pbocBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "stackedArea",
              color: color.lineArea.areas[2],
              label: "ECB",
              values: ecbBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "stackedArea",
              color: color.lineArea.areas[3],
              label: "BoJ",
              values: bojBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "SP500",
              values: sp500GlobalLiquidityData.map((d) => d.value),
              format: d3.format(","),
              axisIndex: 1,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "BTC",
              values: btcGlobalLiquidityData.map((d) => d.value),
              format: d3.format("$,.0f"),
              axisIndex: 2,
            },
          ],
          dates: fedBalanceSheet.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "Assets",
              format: d3.format("$,d"),
              color: color.lineArea.lines.neutral,
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "SP500",
              format: d3.format(","),
              color: color.lineArea.lines[0],
              axisSide: "right",
              alignZero: true,
            },
            {
              label: "BTC",
              format: d3.format("$,.0f"),
              color: color.lineArea.lines[1],
              axisSide: "right",
              alignZero: true,
            },
          ],
          yAlignZero: true,
        },
        peripherals: {},
      }}
    />
  );
};

export default GCBAVSSP500VSBitcoin;
