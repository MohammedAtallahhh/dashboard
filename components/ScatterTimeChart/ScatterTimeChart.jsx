import React, { useEffect, useRef, useState } from "react";
import regression from "regression";
import * as d3 from "d3";
import { throttle } from "lodash";

import CSVButton from "../CSVButton";
import ScreenshotButton from "../ScreenshotButton";

import Tooltip from "./Tooltip";

const ScatterTimeChart = ({
  id,
  title,
  data,
  axes,
  footnotes,
  peripherals = {},
}) => {
  const parentRef = useRef(null);
  const chartRef = useRef(null);
  const chartSvgRef = useRef(null);
  const actionRef = useRef(null);
  const tooltipRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [tooltipShown, setTooltipShown] = useState(false);
  const [scaffoldComplete, setScaffoldComplete] = useState(false);
  const [wrangleComplete, setWrangleComplete] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [iActive, setIActive] = useState(null);

  const [dimensions, setDimensions] = useState({
    fixedRadius: 4,
    maxRadius: 36,
    marginTop: 0,
    marginBottom: 40,
    marginRight: 148,
    marginLeft: 80,
    height: 480,
    width: 0,
    boundedHeight: 0,
    boundedContextHeight: 0,
    brushHandleHeight: 0,
    contextHeight: 48,
    contextMarginTop: 0,
    contextMarginBottom: 24,
  });

  const [chartState, setChartState] = useState({
    hasBrush: !!data.dates,
    hasR: !!data.r,
    colors: [],
    x: null,
    y: null,
    r: null,
    contextX: null,
    selectedDateExtent: null,
    container: null,
    svgWrapper: null,
    svg: null,
    xAxisG: null,
    yAxisG: null,
    dotsG: null,
    regressionG: null,
    regressionLine: null,
    regressionResultG: null,
    activeG: null,
    captureRect: null,
    contextSvg: null,
    contextXAxisG: null,
    brushG: null,
    brushHandle: null,
  });

  function setup() {
    const { hasBrush, hasR } = chartState;
    const {
      height,
      maxRadius,
      marginBottom,
      contextHeight,
      contextMarginBottom,
      contextMarginTop,
    } = dimensions;

    const marginTop = hasR ? maxRadius + 4 : 8;
    const boundedHeight = height - marginTop - marginBottom;

    let boundedContextHeight, brushHandleHeight, contextX, selectedDateExtent;

    let colors = [];

    if (hasBrush) {
      boundedContextHeight =
        contextHeight - contextMarginTop - contextMarginBottom;

      brushHandleHeight = boundedContextHeight;
    }

    const x = d3.scaleLinear();
    const y = d3.scaleLinear().range([height - marginBottom, marginTop]);
    const r = d3.scaleSqrt().range([0, maxRadius]);

    if (hasBrush) {
      contextX = d3.scaleUtc();

      selectedDateExtent = d3.extent(data.dates);

      colors = data.dates.map(() => data.color);

      if (peripherals.highlightedPoints) {
        colors = [
          ...colors.slice(0, -peripherals.highlightedPoints.n),
          ...d3
            .range(peripherals.highlightedPoints.n)
            .map(() => peripherals.highlightedPoints.color),
        ];
      }
    } else {
      colors = data.keys.map(() => data.color);
    }

    setDimensions((prev) => ({
      ...prev,
      marginTop,
      boundedHeight,
      brushHandleHeight,
    }));

    setChartState((prev) => ({
      ...prev,
      x,
      y,
      r,
      contextX,
      selectedDateExtent,
      colors,
    }));
  }

  function scaffold() {
    const { marginLeft, height } = dimensions;
    const { hasBrush } = chartState;

    const container = d3.select(chartRef.current);
    let contextSvg, contextXAxisG, brushG, brushHandle;

    const svgWrapper = container.append("div");

    const svg = d3.select(chartSvgRef.current);

    const xAxisG = svg.append("g").attr("class", "axis axis--x axis-label");

    const yAxisG = svg.append("g").attr("class", "axis axis--y axis-label");

    const dotsG = svg.append("g");

    const regressionG = svg.append("g").attr("class", "regression-g");
    const regressionLine = regressionG
      .append("line")
      .attr("class", "regression-line");

    const regressionResultG = regressionG
      .append("g")
      .attr("class", "regression-result");

    const activeG = svg.append("g").attr("class", "active-g");

    activeG.append("circle").attr("class", "active-circle__bg");
    activeG.append("circle").attr("class", "active-circle__fg");

    const captureRect = d3.select(chartSvgRef.current).select(".capture-rect");

    if (hasBrush) {
      contextSvg = container.append("svg").attr("class", "context-svg");

      contextXAxisG = contextSvg
        .append("g")
        .attr("class", "axis axis--x axis-label");

      brushG = contextSvg.append("g").attr("class", "brush-g");
      brushHandle = brushG
        .selectAll(".handle--custom")
        .data([{ type: "w" }, { type: "e" }])
        .join("path")
        .attr("class", "handle--custom")
        .attr("d", brushResizePath);
    }

    setChartState((prev) => ({
      ...prev,
      container,
      svgWrapper,
      svg,
      xAxisG,
      yAxisG,
      dotsG,
      regressionG,
      regressionLine,
      regressionResultG,
      activeG,
      captureRect,
      contextSvg,
      contextXAxisG,
      brushG,
      brushHandle,
    }));
  }

  const filterData = (selectedDateExtent) => {
    const { hasBrush, hasR, colors } = chartState;

    let filteredData = [];

    if (hasBrush) {
      const startIndex = d3.bisectLeft(data.dates, selectedDateExtent[0]);
      const endIndex = d3.bisectRight(data.dates, selectedDateExtent[1]);

      filteredData = d3.zip(
        data.x.values.slice(startIndex, endIndex),
        data.y.values.slice(startIndex, endIndex),
        colors.slice(startIndex, endIndex),
        data.dates.slice(startIndex, endIndex)
      );
    } else {
      if (hasR) {
        // Sort by r in a descending order to maker sure large bubbles won't block small bubbles
        const ranks = Array.from(d3.rank(data.r.values, d3.descending));
        filteredData = d3.zip(
          data.x.values,
          data.y.values,
          colors,
          data.keys,
          data.r.values
        );

        filteredData = ranks.map((i) => filteredData[i]);
      } else {
        filteredData = d3.zip(data.x.values, data.y.values, colors, data.keys);
      }
    }

    return filteredData;
  };

  function wrangle(selectedDateExtent) {
    const { hasBrush, hasR, x, y, contextX } = chartState;
    const filteredData = filterData(selectedDateExtent);

    x.domain(d3.extent(filteredData, (d) => d[0])).nice();
    y.domain(d3.extent(filteredData, (d) => d[1])).nice();

    if (hasR) r.domain([0, d3.max(filteredData, (d) => d[4])]).nice();

    const regressionResult = regression.linear(filteredData, {
      precision: 2,
    });

    const hasRegression = filteredData.length >= 2;

    if (hasBrush) {
      contextX.domain(d3.extent(data.dates));
    }

    setChartState((prev) => ({ ...prev, regressionResult, hasRegression }));
    setFilteredData(filteredData);
  }

  const resized = (brush) => {
    const {
      marginLeft,
      marginRight,
      contextMarginTop,
      contextHeight,
      contextMarginBottom,
      height,
    } = dimensions;
    const {
      x,
      hasBrush,
      svg,
      captureRect,
      contextX,
      contextSvg,
      brushG,
      container,
      selectedDateExtent,
    } = chartState;

    const w = container.node().clientWidth;
    // const boundedWidth = w - marginLeft - marginRight;

    x.range([marginLeft, w - marginRight]);

    if (hasBrush) {
      contextX.range([marginLeft, w - marginRight]);

      brush.extent([
        [marginLeft, contextMarginTop + 0.5],
        [w - marginRight, contextHeight - contextMarginBottom + 0.5],
      ]);
    }

    svg.attr("viewBox", [0, 0, w, height]);
    captureRect.attr("width", w - marginLeft - marginRight);

    if (hasBrush) {
      contextSvg.attr("viewBox", [0, 0, w, contextHeight]);
      brushG.call(brush).call(brush.move, selectedDateExtent.map(contextX));
    }

    // const delaunay = d3.Delaunay.from(
    //   filteredData,
    //   ([x]) => x(x),
    //   ([_, y]) => y(y)
    // );

    render();
  };

  function render() {
    renderFocus();
    if (chartState.hasBrush) renderContext();
    setLoading(false);
  }

  function renderFocus(sde) {
    renderXAxis();
    renderYAxis();
    renderDots(sde);
    renderRegression();
  }

  function renderXAxis() {
    const { xAxisG, x, container } = chartState;
    const { height, marginBottom, marginLeft, marginRight } = dimensions;

    const w = container.node().clientWidth;
    const boundedWidth = w - marginLeft - marginRight;

    xAxisG.attr("transform", `translate(0,${height - marginBottom})`).call(
      d3
        .axisBottom(x)
        .tickSizeOuter(0)
        .ticks(boundedWidth / 80)
        .tickFormat(axes.x.format)
    );

    xAxisG
      .selectAll(".axis-title")
      .data([0])
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "axis-title chart-subtitle")
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .text(axes.x.label)
      )
      .attr(
        "transform",
        `translate(${(marginLeft + w - marginRight) / 2},${marginBottom - 4})`
      );
  }

  function renderYAxis() {
    const { yAxisG, y } = chartState;
    const { marginLeft, marginBottom, marginTop, boundedHeight, height } =
      dimensions;

    yAxisG.attr("transform", `translate(${marginLeft},0)`).call(
      d3
        .axisLeft(y)
        .ticks(boundedHeight / 50)
        .tickFormat(axes.y.format)
    );

    yAxisG
      .selectAll(".axis-title")
      .data([0])
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "axis-title chart-subtitle")
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .attr(
            "transform",
            `translate(${-marginLeft + 16},${
              (marginTop + height - marginBottom) / 2
            })rotate(-90)`
          )
          .text(axes.y.label)
      );
  }

  function renderDots(sde) {
    const { dotsG, hasR, x, y } = chartState;

    const filteredData = filterData(sde ?? chartState.selectedDateExtent);

    dotsG
      .selectAll(".dot")
      .data(filteredData, ([x, y, color, key]) => key)
      .join((enter) => enter.append("circle").attr("class", "dot"))
      .attr("r", ([x, y, color, key, r]) =>
        hasR ? r(r) : dimensions.fixedRadius
      )
      .attr("fill", ([x, y, color]) => color)
      .attr("transform", ([xx, yy]) => `translate(${x(xx)},${y(yy)})`);
  }

  function renderRegression() {
    const {
      x,
      y,
      regressionLine,
      regressionResultG,
      regressionResult,
      hasRegression,
      container,
    } = chartState;

    const { marginRight, height, marginBottom, marginTop } = dimensions;
    const width = container.node().clientWidth;

    if (!hasRegression) return;

    const [x1, x2] = x.range();

    const [y1, y2] = x
      .domain()
      .map((d) =>
        y(regressionResult.equation[0] * d + regressionResult.equation[1])
      );

    regressionLine.attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);

    const xResult = width - marginRight + 4;
    const yResult = Math.min(
      height - marginBottom,
      Math.max(marginTop + 4, y2)
    );

    regressionResultG
      .attr("transform", `translate(${xResult},${yResult})`)
      .selectAll(".regression-text")
      .data([regressionResult.string, `R² = ${regressionResult.r2}`])
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "regression-text axis-label")
          .attr("fill", "currentColor")
          .attr("dy", (_, i) => (i ? "1.2em" : null))
      )
      .text((d) => d);
  }

  function renderContext() {
    renderContextXAxis();
  }

  function renderContextXAxis() {
    const w = chartState.container.node().clientWidth;
    const boundedWidth = w - dimensions.marginLeft - dimensions.marginRight;

    chartState.contextXAxisG
      .attr(
        "transform",
        `translate(0,${
          dimensions.contextHeight - dimensions.contextMarginBottom
        })`
      )
      .call(
        d3
          .axisBottom(chartState.contextX)
          .tickSizeOuter(0)
          .ticks(boundedWidth / 100)
      );
  }

  function renderActive(i) {
    const [x, y, color, key, r] = filteredData[i];

    chartState.activeG
      .style("color", color)
      .attr("transform", `translate(${chartState.x(x)},${chartState.y(y)})`)
      .call((g) =>
        g
          .select(".active-circle__bg")
          .attr(
            "r",
            chartState.hasR ? chartState.r(r) + 8 : dimensions.fixedRadius + 8
          )
      )
      .call((g) =>
        g
          .select(".active-circle__fg")
          .attr("r", chartState.hasR ? r(r) : dimensions.fixedRadius)
      );
  }

  function brushStarted() {
    chartState.brushG.classed("is-brushing", true);
  }

  function brushed({ selection }) {
    const { contextX, brushHandle } = chartState;
    if (!selection) return;

    const sde = selection.map(contextX.invert, contextX).map(d3.utcDay.round);

    brushHandle.attr(
      "transform",
      (_, i) => `translate(${selection[i]},${dimensions.contextMarginTop})`
    );

    wrangle(sde);
    renderFocus(sde);
  }

  function brushEnded() {
    chartState.brushG.classed("is-brushing", false);
  }

  function pointerEntered() {
    const hasData = filteredData.length > 0;
    if (!hasData) return;
    chartState.activeG.classed("is-active", true);
  }

  const pointerMoved = throttle((event) => {
    const hasData = filteredData.length > 0;

    if (!hasData) return;

    const [xm, ym] = d3.pointer(event);
    const offsetY = d3.select(tooltipRef.current).node().clientHeight;

    const delaunay = d3.Delaunay.from(
      filteredData,
      ([x]) => chartState.x(x),
      ([_, y]) => chartState.y(y)
    );

    const i = delaunay.find(xm, ym, iActive || 0);

    if (iActive !== i) {
      setIActive(i);
      renderActive(i);

      setTooltipShown(true);

      moveTooltip(
        chartState.x(filteredData[i][0]),
        chartState.y(filteredData[i][1]) + offsetY
      );
    }
  }, 100);

  function pointerLeft() {
    const hasData = filteredData.length > 0;

    if (!hasData) return;
    setIActive(null);
    chartState.activeG.classed("is-active", false);
    setTooltipShown(false);
  }

  // https://bl.ocks.org/Fil/2d43867ba1f36a05459c7113c7f6f98a
  function brushResizePath(d) {
    const e = +(d.type == "e"),
      x = e ? 1 : -1,
      y = dimensions.brushHandleHeight;

    return `M${0.5 * x},0A6,6 0 0 ${e} ${6.5 * x},6V${y - 6}A6,6 0 0 ${e} ${
      0.5 * x
    },${y}ZM${2.5 * x},8V${y - 8}M${4.5 * x},8V${y - 8}`;
  }

  const moveTooltip = (xm, ym) => {
    const offset = 12;
    let x, y;
    const tRect = tooltipRef.current.getBoundingClientRect();
    const bRect = chartState.container.node().getBoundingClientRect();

    if (xm < bRect.width / 2) {
      x = Math.min(bRect.width, xm + offset);
    } else {
      x = Math.max(0, xm - tRect.width - offset);
    }

    y = ym - tRect.height / 2;
    if (y < 0) {
      y = 0;
    } else if (y + tRect.height > bRect.height) {
      y = bRect.height - tRect.height;
    }

    tooltipRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };

  useEffect(() => {
    setup();
    setSetupComplete(true);
  }, []);

  useEffect(() => {
    if (setupComplete) {
      scaffold();
      setScaffoldComplete(true);
    }
  }, [setupComplete]);

  useEffect(() => {
    if (scaffoldComplete) {
      wrangle(chartState.selectedDateExtent);
      setWrangleComplete(true);
    }
  }, [scaffoldComplete]);

  useEffect(() => {
    if (wrangleComplete) {
      let brush;

      if (chartState.hasBrush) {
        brush = d3
          .brushX()
          .on("start", brushStarted)
          .on("brush", brushed)
          .on("end", brushEnded);
      }

      // chartState.captureRect
      //   .on("pointerenter", pointerEntered)
      //   .on("pointermove", pointerMoved)
      //   .on("pointerleave", pointerLeft)
      //   .on("touchstart", (event) => event.preventDefault());

      const ro = new ResizeObserver(() => resized(brush));
      ro.observe(chartRef.current);

      return () => {
        ro.disconnect();
      };
    }
  }, [wrangleComplete]);

  return (
    <article
      ref={parentRef}
      id={id}
      className="relative overflow-hidden min-h-[600px] bg-surface-1 p-6 rounded-md mb-10"
    >
      {/* Loader */}
      <div
        className={`absolute inset-0 z-10 bg-inherit flex items-center justify-center ${
          loading ? "" : "hidden"
        }`}
      >
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-gray-400 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>

      <div ref={chartRef} className="scatter-time-chart grid gap-5">
        <h2 className="text-lg leading-normal">{title}</h2>

        {/* Actions */}
        <div
          ref={actionRef}
          className="flex justify-between items-center pb-5 ignore-me"
          style={{ gridRow: 2 }}
        >
          <CSVButton data={data} title={title} />
          <ScreenshotButton target={parentRef.current} title={title} />
        </div>

        <div className="svg-wrapper" style={{ gridRow: 3 }}>
          <svg
            className="chart-svg"
            ref={chartSvgRef}
            onPointerEnter={pointerEntered}
            onPointerMove={pointerMoved}
            onPointerLeave={pointerLeft}
          >
            <rect
              className="capture-rect"
              x={dimensions.marginLeft}
              y={0}
              height={dimensions.height}
            ></rect>
          </svg>
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className={`absolute z-10 pointer-events-none rounded-md p-4 bg-surface-2 shadow-xl transition-opacity ${
            tooltipShown ? "visible opacity-100" : "opacity-0 invisible"
          }`}
        >
          {tooltipShown ? (
            <Tooltip
              data={data}
              hasBrush={chartState.hasBrush}
              hasR={chartState.hasR}
              filteredData={filteredData}
              iActive={iActive}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default ScatterTimeChart;
