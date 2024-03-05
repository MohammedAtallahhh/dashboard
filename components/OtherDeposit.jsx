"use client";

import * as d3 from "d3";

import LineChart from "./LineChart/LineChart";

const OtherDeposit = ({ color, data }) => {
  const { odlData, sp500Data, btcData } = data;

  return (
    <LineChart
      {...{
        id: "other-deposit",
        title: "Other Deposit Liabilities vs. BTC Price vs. SP500",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "ODL (MoM%)",
              values: odlData.map((d) => d["mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "ODL (QoQ%)",
              values: odlData.map((d) => d["3mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "ODL (6MoM%)",
              values: odlData.map((d) => d["6mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[3],
              label: "ODL (YoY%)",
              values: odlData.map((d) => d["yoy"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[4],
              lineWidth: 5,
              label: "SP500",
              values: sp500Data.map((d) => d.value),
              format: d3.format(","),
              axisIndex: 1,
            },
            {
              type: "line",
              color: color.lineArea.lines[5],
              lineWidth: 5,
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
              label: "ODL (% Change)",
              format: d3.format(".1~%"),
              color: color.lineArea.neutral,
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

export default OtherDeposit;
