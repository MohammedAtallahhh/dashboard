"use client";
import * as d3 from "d3";

import LineChart from "../LineChart/LineChart";

const WorldM2Growth = ({ data, color }) => {
  const { globalM2, btcGlobalLiquidityData } = data;

  return (
    <LineChart
      {...{
        id: "world-m2-growth",
        title: "World - M2 Growth of Fed, ECB, PBoC & BOJ (YoY%)",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "M2 Growth (YoY%)",
              values: globalM2.map((d) => d["yoy"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[1],
              label: "M2 Growth (6MoM%)",
              values: globalM2.map((d) => d["6mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[2],
              label: "M2 Growth (QoQ%)",
              values: globalM2.map((d) => d["3mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[3],
              label: "M2 Growth (MoM%)",
              values: globalM2.map((d) => d["mom"]),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
            {
              type: "line",
              color: color.lineArea.lines[4],
              label: "BTC",
              values: btcGlobalLiquidityData.map((d) => d.value),
              format: d3.format("$,.0f"),
              axisIndex: 1,
            },
          ],
          dates: globalM2.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "M2 Growth (%)",
              format: d3.format(".1~%"),
              color: color.lineArea.neutral,
              axisSide: "left",
            },

            {
              label: "BTC",
              format: d3.format("$,.0f"),
              color: color.lineArea.lines[1],
              axisSide: "right",
              isLogScale: true,
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

export default WorldM2Growth;
