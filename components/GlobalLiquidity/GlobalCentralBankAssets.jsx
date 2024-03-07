"use client";
import * as d3 from "d3";

import React from "react";
import LineChart from "../LineChart/LineChart";

const GlobalCentralBankAssets = ({ data, color }) => {
  const {
    fedBalanceSheet,
    pbocBalanceSheet,
    ecbBalanceSheet,
    bojBalanceSheet,
  } = data;
  return (
    <LineChart
      {...{
        id: "",
        title: "Global Central Bank Assets",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "Fed",
              values: fedBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "PBoC",
              values: pbocBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "ECB",
              values: ecbBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[3],
              label: "BoJ",
              values: bojBalanceSheet.map((d) => d.value),
              format: (d) => d3.format("$,.0f")(d) + "B",
              axisIndex: 0,
            },
          ],
          dates: fedBalanceSheet.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "Assets ($B)",
              format: d3.format("$,d"),
              color: color.lineArea.neutral,
              axisSide: "left",
            },
          ],
        },
        peripherals: {},
      }}
    />
  );
};

export default GlobalCentralBankAssets;
