"use client";

import * as d3 from "d3";

import LineChart from "../LineChart/LineChart";

const OneMonthChange = ({ color, data }) => {
  const { bankReservesData, sp500Data, btcData } = data;

  return (
    <LineChart
      {...{
        id: "one-month-change",
        title:
          "% 1-Month Change in SP500 vs. Bank Reserves vs. BTC Price - Compared Against SP500 Price and BTC Price",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "SP500 (MoM%)",
              values: sp500Data.map((d) => d.mom),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "Bank Reserves (MoM%)",
              values: bankReservesData.map((d) => d.mom),
              format: d3.format(",.1%"),
              axisIndex: 1,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "BTC (MoM%)",
              values: btcData.map((d) => d.mom),
              format: d3.format(",.1%"),
              axisIndex: 2,
            },
            {
              type: "line",
              color: color.lineArea.lines[3],
              lineWidth: 5,
              label: "SP500",
              values: sp500Data.map((d) => d.value),
              format: d3.format(","),
              axisIndex: 3,
            },
            {
              type: "line",
              color: color.lineArea.lines[4],
              lineWidth: 5,
              label: "BTC",
              values: btcData.map((d) => d.value),
              format: d3.format("$,.0f"),
              axisIndex: 4,
            },
          ],
          dates: sp500Data.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "SP500 (MoM%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[0],
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "Bank Reserves (MoM%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[1],
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "BTC (MoM%)",
              format: d3.format(".1~%"),
              color: color.lineArea.lines[2],
              axisSide: "left",
              alignZero: true,
            },
            {
              label: "SP500",
              format: d3.format(","),
              color: color.lineArea.lines[3],
              axisSide: "right",
            },
            {
              label: "BTC",
              format: d3.format("$,.0f"),
              color: color.lineArea.lines[4],
              axisSide: "right",
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

export default OneMonthChange;
