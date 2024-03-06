"use client";

import * as d3 from "d3";

import LineChart from "../LineChart/LineChart";

const TokensOutperforming = ({ data, color }) => {
  const { tokensOutperformingBTCData } = data;
  return (
    <LineChart
      {...{
        id: "tokens-outperforming",
        title: "% Tokens Outperforming BTC Over 90 Day Period",
        data: {
          series: [
            {
              type: "line",
              color: color.lineArea.lines[0],
              label: "% Tokens",
              values: tokensOutperformingBTCData.map((d) => d.value),
              format: d3.format(",.1%"),
              axisIndex: 0,
            },
          ],
          dates: tokensOutperformingBTCData.map((d) => d.date),
        },
        axes: {
          y: [
            {
              label: "% Tokens",
              format: d3.format(",.1~%"),
              color: color.lineArea.lines[0],
              axisSide: "left",
            },
          ],
        },
      }}
    />
  );
};

export default TokensOutperforming;
