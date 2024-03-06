"use client";

import * as d3 from "d3";

import LineChart from "../LineChart/LineChart";

const FedLiquidityOscillatorVsSP500 = ({ color, data }) => {
  const { netLiquiditySP500DivergenceData, sp500Data } = data;

  return (
    <LineChart
      {...{
        id: "d",
        title: "Fed Liquidity Oscillator vs. SP500",
        footnotes: [
          "Fed Liquidity Oscillator = Δ Net Liquidity - Δ SP500. As liquidity oscillator moves away from 0%, changes in SP500 contradict net liquidity flows.",
        ],
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "MoM",
              values: netLiquiditySP500DivergenceData.map((d) => d.mom),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "2WoW",
              values: netLiquiditySP500DivergenceData.map((d) => d["2wow"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "WoW",
              values: netLiquiditySP500DivergenceData.map((d) => d.wow),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[3],
              lineWidth: 5,
              label: "SP500",
              values: sp500Data.map((d) => d.value),
              format: d3.format(","),
              axisIndex: 1,
            },
          ],
          dates: sp500Data.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "Δ Fed Liquidity Divergence",
              format: d3.format(".1~%"),
              color: color.lineArea.neutral,
              axisSide: "left",
            },
            {
              label: "SP500",
              format: d3.format(","),
              color: color.lineArea.lines[3],
              axisSide: "right",
            },
          ],
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

export default FedLiquidityOscillatorVsSP500;
