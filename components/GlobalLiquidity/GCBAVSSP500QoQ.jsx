"use client";
import * as d3 from "d3";

import React from "react";
import LineChart from "../LineChart/LineChart";

const GCBAVSSP500QoQ = ({ data, color }) => {
  const {
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
    sp500GlobalLiquidityData,
    btcGlobalLiquidityData,
    major4FlowData,
  } = data;
  return (
    <LineChart
      {...{
        id: "GCBA-vs-SP500-QoQ",
        title:
          "Global Central Bank Assets (QoQ$B) vs SP500 (QoQ%) vs. BTC (QoQ%)",
        data: {
          series: [
            {
              type: "stackedArea",
              color: color.lineArea.areas[0],
              label: "Fed",
              values: fedBalanceSheet.map((d) => d["3mom"]),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "stackedArea",
              color: color.lineArea.areas[1],
              label: "PBoC",
              values: pbocBalanceSheet.map((d) => d["3mom"]),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "stackedArea",
              color: color.lineArea.areas[2],
              label: "ECB",
              values: ecbBalanceSheet.map((d) => d["3mom"]),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "stackedArea",
              color: color.lineArea.areas[3],
              label: "BoJ",
              values: bojBalanceSheet.map((d) => d["3mom"]),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "Major 4 Flow",
              values: major4FlowData.map((d) => d["3mom"]),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "SP500 (QoQ%)",
              values: sp500GlobalLiquidityData.map((d) => d["3mom"]),
              format: d3.format(",.1%"),
              axisIndex: 1,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "BTC (QoQ%)",
              values: btcGlobalLiquidityData.map((d) => d["3mom"]),
              format: d3.format(",.1%"),
              axisIndex: 2,
            },
          ],
          dates: fedBalanceSheet.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "Assets (QoQ $B)",
              format: d3.format("$,d"),
              color: color.lineArea.lines[0],
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "SP500 (QoQ%)",
              format: d3.format(",.0%"),
              color: color.lineArea.lines[1],
              axisSide: "right",
              alignZero: true,
            },
            {
              label: "BTC (QoQ%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[2],
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

export default GCBAVSSP500QoQ;
