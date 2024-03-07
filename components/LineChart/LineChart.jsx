import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import lodash from "lodash";

import Tooltip from "./Tooltip";
import Swatches from "./Swatches";
import CSVButton from "./CSVButton";
import ScreenshotButton from "../ScreenshotButton";

const LineChart = ({ id, title, data, axes, footnotes, peripherals = {} }) => {
  const parentRef = useRef(null);
  const chartRef = useRef(null);
  const actionRef = useRef(null);
  const tooltipRef = useRef(null);
  const swatchRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const [scaffoldComplete, setScaffoldComplete] = useState(false);
  const [tooltipShown, setTooltipShown] = useState(false);

  const [selectedSeries, setSelectedSeries] = useState(new Set());
  const selectedSeriesRef = useRef(selectedSeries);

  const [dimensions, setDimensions] = useState({
    axisWidth: 80,
    axisOffset: 20,
    marginTop: 8,
    marginBottom: 24,
    marginRight: 0,
    marginLeft: 0,
    focusHeight: 400,
    boundedFocusHeight: 0,
    contextHeight: 80,
    boundedContextHeight: 0,
    brushHandleHeight: 0,
  });

  const [chartState, setChartState] = useState({
    focusX: null,
    focusYs: [],
    contextX: null,
    contextYs: [],
    pathGenerators: [],
    brush: null,
    brushG: null,
    selectedDateExtent: null,
    iActive: null,
    activeG: null,
  });

  function setup() {
    const { axisWidth, focusHeight, marginBottom, marginTop, contextHeight } =
      dimensions;

    const marginRight =
      axisWidth * axes.y.filter((d) => d.axisSide === "right").length || 20;

    const marginLeft =
      axisWidth * axes.y.filter((d) => d.axisSide === "left").length;

    const boundedFocusHeight = focusHeight - marginTop - marginBottom;

    const boundedContextHeight = contextHeight - marginTop - marginBottom;
    const brushHandleHeight = boundedContextHeight;

    const focusX = d3.scaleUtc();
    const focusYs = axes.y.map(({ isLogScale }) => {
      const scale = isLogScale ? d3.scaleLog : d3.scaleLinear;
      return scale().range([focusHeight - marginBottom, marginTop]);
    });

    const contextX = d3.scaleUtc();
    const contextYs = axes.y.map(({ isLogScale }) => {
      const scale = isLogScale ? d3.scaleLog : d3.scaleLinear;
      return scale().range([contextHeight - marginBottom, marginTop]);
    });

    const pathGenerators = data.series.map((d) => {
      if (d.type === "line")
        return (x, y) =>
          d3
            .line()
            .defined((d) => d !== null && d !== undefined && !isNaN(d))
            .x((_, i) => x(data.dates[i]))
            .y((d) => y(d))
            .curve(d3.curveMonotoneX);
      if (d.type === "area")
        return (x, y) =>
          d3
            .area()
            .defined((d) => d !== null && d !== undefined && !isNaN(d))
            .x((_, i) => x(data.dates[i]))
            .y0(y.range()[0])
            .y1((d) => y(d))
            .curve(d3.curveMonotoneX);
      if (d.type === "stackedArea")
        return (x, y) =>
          d3
            .area()
            .x((_, i) => x(data.dates[i]))
            .y0((d) => Math.min(y.range()[0], y(d[0])))
            .y1((d) => y(d[1]))
            .curve(d3.curveMonotoneX);
    });

    const selectedSeries = new Set(data.series.map((d) => d.label));
    const selectedDateExtent = d3.extent(data.dates);

    setDimensions((prevState) => ({
      ...prevState,
      marginRight,
      marginLeft,
      boundedContextHeight,
      boundedFocusHeight,
      brushHandleHeight,
    }));

    setChartState((prevState) => ({
      ...prevState,
      focusX,
      focusYs,
      contextX,
      contextYs,
      pathGenerators,
      selectedDateExtent,
    }));

    setSelectedSeries(selectedSeries);
    selectedSeriesRef.current = selectedSeries;
  }

  function scaffold() {
    const container = d3.select(chartRef.current);

    container.append("div").attr("class", "chart-title").text(title);

    const focusSvg = container.append("svg").attr("class", "focus-svg");

    const clipId = `${id}-clip`;
    const clipRect = focusSvg
      .append("clipPath")
      .attr("id", clipId)
      .append("rect")
      .attr("x", dimensions.marginLeft)
      .attr("y", dimensions.marginTop - 1)
      .attr("height", dimensions.boundedFocusHeight + 2);

    const focusPeripheralsG = focusSvg.append("g");

    const focusXAxisG = focusSvg
      .append("g")
      .attr("class", "axis axis--x axis-label");

    const focusYAxisG = focusSvg
      .append("g")
      .selectAll("g")
      .data(axes.y)
      .join("g")
      .attr("class", "axis axis--y axis-label")
      .style("color", (d) => d.color);

    const focusSeriesG = focusSvg
      .append("g")
      .attr("clip-path", `url(#${clipId})`);

    const activeG = focusSvg.append("g").attr("class", "active-g");

    activeG
      .append("line")
      .attr("class", "active-line")
      .attr("y1", dimensions.marginTop)
      .attr("y2", dimensions.focusHeight - dimensions.marginBottom);

    const captureRect = focusSvg
      .append("rect")
      .attr("class", "capture-rect")
      .attr("x", dimensions.marginLeft)
      .attr("y", 0)
      .attr("height", dimensions.focusHeight);

    const contextSvg = container.append("svg").attr("class", "context-svg");

    const contextXAxisG = contextSvg
      .append("g")
      .attr("class", "axis axis--x axis-label");

    const contextYAxisG = contextSvg
      .append("g")
      .selectAll("g")
      .data(axes.y)
      .join("g")
      .attr("class", "axis axis--y axis-label")
      .style("color", (d) => d.color);

    const contextSeriesG = contextSvg.append("g");

    const brushG = contextSvg.append("g").attr("class", "brush-g");
    const brushHandle = brushG
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }])
      .join("path")
      .attr("class", "handle--custom")
      .attr("d", brushResizePath);

    if (footnotes) {
      container
        .append("div")
        .attr("class", "v-footnotes")
        .data(footnotes)
        .join("p")
        .attr("class", "footnote")
        .text((d) => d);
    }

    setChartState((prevState) => ({
      ...prevState,
      container,
      focusSvg,
      focusSeriesG,
      clipRect,
      captureRect,
      brushG,
      brushHandle,
      contextSvg,
      focusXAxisG,
      focusYAxisG,
      contextXAxisG,
      contextYAxisG,
      contextSeriesG,
      activeG,
      focusPeripheralsG,
      clipId,
    }));
  }

  function wrangle(selectedDateExtent) {
    const { contextX, focusYs, contextYs, focusX } = chartState;
    contextX.domain(d3.extent(data.dates));

    const contextYMins = [];
    const contextYMaxes = [];

    focusYs.forEach((y, i) => {
      const filteredData = data.series.filter((d) => d.axisIndex === i);
      contextYMins[i] = d3.min(filteredData, (d) =>
        d3.min(d.stackedValues ? d.stackedValues.map((d) => d[1]) : d.values)
      );
      contextYMaxes[i] = d3.max(filteredData, (d) =>
        d3.max(d.stackedValues ? d.stackedValues.map((d) => d[1]) : d.values)
      );
    });

    if (axes.yAlignZero) {
      alignZero(contextYs, contextYMins, contextYMaxes);
    } else {
      contextYs.forEach((y, i) => {
        y.domain([contextYMins[i], contextYMaxes[i]]);
      });
    }

    focusX.domain(selectedDateExtent);

    const startIndex = Math.max(
      0,
      d3.bisectLeft(data.dates, selectedDateExtent[0]) - 1
    );
    const endIndex = Math.min(
      data.dates.length,
      d3.bisectRight(data.dates, selectedDateExtent[1]) + 1
    );

    const focusYMins = [];
    const focusYMaxes = [];

    focusYs.forEach((y, i) => {
      const filteredData = data.series.filter((d) => d.axisIndex === i);
      focusYMins[i] = d3.min(filteredData, (d) =>
        d3.min(
          d.stackedValues
            ? d.stackedValues.slice(startIndex, endIndex).map((d) => d[1])
            : d.values.slice(startIndex, endIndex)
        )
      );

      focusYMaxes[i] = d3.max(filteredData, (d) =>
        d3.max(
          d.stackedValues
            ? d.stackedValues.slice(startIndex, endIndex).map((d) => d[1])
            : d.values.slice(startIndex, endIndex)
        )
      );
    });

    if (axes.yAlignZero) {
      alignZero(focusYs, focusYMins, focusYMaxes);
    } else {
      focusYs.forEach((y, i) => {
        if (focusYMins[i] === undefined || focusYMaxes[i] === undefined) {
          y.domain([contextYMins[i], contextYMaxes[i]]);
        } else {
          y.domain([focusYMins[i], focusYMaxes[i]]);
        }
      });
    }
  }

  function brushResizePath(d) {
    const e = +(d.type == "e"),
      x = e ? 1 : -1,
      y = dimensions.brushHandleHeight;
    return `M${0.5 * x},0A6,6 0 0 ${e} ${6.5 * x},6V${y - 6}A6,6 0 0 ${e} ${
      0.5 * x
    },${y}ZM${2.5 * x},8V${y - 8}M${4.5 * x},8V${y - 8}`;
  }

  function alignZero(ys, yMins, yMaxes) {
    const alignIndexes = d3
      .range(axes.y.length)
      .map((i) => axes.y[i].alignZero === true);

    ys.forEach((y, i) => {
      if (!alignIndexes[i]) y.domain([yMins[i], yMaxes[i]]);
    });

    ys = ys.filter((_, i) => alignIndexes[i]);
    yMins = yMins.filter((_, i) => alignIndexes[i]);
    yMaxes = yMaxes.filter((_, i) => alignIndexes[i]);

    if (d3.min(yMins) >= 0) {
      ys.forEach((y, i) => {
        y.domain([0, yMaxes[i]]);
      });
    } else if (d3.max(yMaxes) <= 0) {
      ys.forEach((y, i) => {
        y.domain([yMins[i], 0]);
      });
    } else {
      const yRatios = d3
        .range(ys.length)
        .map((i) =>
          yMaxes[i] * yMins[i] >= 0
            ? Infinity
            : yMaxes[i] / (yMaxes[i] - yMins[i])
        );
      const iMin = d3.minIndex(yRatios);
      const adjustedYMins = yMins.map((yMin, i) => {
        if (i === iMin) return yMin;
        if (yMaxes[i] * yMins[i] >= 0) return yMin;
        return (yMins[iMin] / yMaxes[iMin]) * yMaxes[i];
      });

      ys.forEach((y, i) => {
        y.domain([adjustedYMins[i], yMaxes[i]]);
      });
    }
  }

  function resized(brush) {
    const {
      marginLeft,
      marginRight,
      marginTop,
      marginBottom,
      focusHeight,
      contextHeight,
    } = dimensions;

    const {
      focusX,
      contextX,
      focusSvg,
      captureRect,
      clipRect,
      contextSvg,
      container,
      brushG,
      selectedDateExtent,
    } = chartState;

    let width = container.node().clientWidth;

    focusX.range([marginLeft, width - marginRight]);
    contextX.range([marginLeft, width - marginRight]);

    brush.extent([
      [marginLeft, marginTop + 0.5],
      [width - marginRight, contextHeight - marginBottom + 0.5],
    ]);

    focusSvg.attr("viewBox", [0, 0, width, focusHeight]);
    clipRect.attr("width", width - marginLeft - marginRight);
    captureRect.attr("width", width - marginLeft - marginRight);
    brushG.call(brush).call(brush.move, selectedDateExtent.map(contextX));

    contextSvg.attr("viewBox", [0, 0, width, contextHeight]);

    render();
  }

  function render() {
    renderFocus();
    renderContext();
    setLoading(false);
  }

  function renderFocus() {
    if (peripherals) renderPeripherals();
    renderFocusXAxis();
    renderFocusYAxes();
    renderFocusSeries();
  }

  function renderPeripherals() {
    let width = chartState.container.node().clientWidth;
    let boundedWidth = width - dimensions.marginLeft - dimensions.marginRight;

    if (peripherals.highlightedAreas) {
      chartState.focusPeripheralsG
        .selectAll(".highlighted-area-rect")
        .data(peripherals.highlightedAreas)
        .join((enter) =>
          enter
            .append("rect")
            .attr("class", "highlighted-area-rect")
            .attr("clip-path", `url(#${chartState.clipId})`)
            .attr("fill", (d) => d.color)
        )
        .attr("x", (d) =>
          d.x0 === undefined ? dimensions.marginLeft : chartState.focusX(d.x0)
        )
        .attr("width", (d) =>
          d.x0 === undefined
            ? boundedWidth
            : chartState.focusX(d.x1) - chartState.focusX(d.x0)
        )
        .attr("y", (d) =>
          d.y0 === undefined
            ? dimensions.marginTop
            : chartState.focusYs[d.axisIndex](d.y0)
        )
        .attr("height", (d) =>
          d.x0 === undefined
            ? dimensions.boundedFocusHeight
            : chartState.focusYs[d.axisIndex](d.y1) -
              chartState.focusYs[d.axisIndex](d.y0)
        );
    }
  }

  function renderFocusXAxis() {
    let width = chartState.container.node().clientWidth;
    let boundedWidth = width - dimensions.marginLeft - dimensions.marginRight;
    const { focusHeight, marginBottom } = dimensions;
    const { focusX, focusXAxisG } = chartState;

    focusXAxisG
      .attr("transform", `translate(0,${focusHeight - marginBottom})`)
      .call(
        d3
          .axisBottom(focusX)
          .tickSizeOuter(0)
          .ticks(boundedWidth / 100)
      );
  }

  function renderFocusYAxes() {
    let width = chartState.container.node().clientWidth;

    const {
      axisOffset,
      marginLeft,
      axisWidth,
      marginRight,
      boundedFocusHeight,
      marginTop,
    } = dimensions;

    const { focusYAxisG, focusYs } = chartState;

    focusYAxisG
      .attr("display", (d, i) =>
        data.series.filter(
          (e) => selectedSeries.has(e.label) && e.axisIndex === i
        ).length
          ? null
          : "none"
      )
      .attr("transform", (d) => {
        const i = axes.y.filter((e) => e.axisSide === d.axisSide).indexOf(d);
        const x =
          d.axisSide === "left"
            ? marginLeft - axisWidth * i - axisOffset
            : width - marginRight + axisWidth * i + axisOffset;
        return `translate(${x},0)`;
      })
      .each((d, i, n) => {
        const axis = d.axisSide === "left" ? d3.axisLeft : d3.axisRight;

        d3.select(n[i]).call(
          axis(focusYs[i])
            .ticks(boundedFocusHeight / 50)
            .tickFormat((t) =>
              d.isLogScale
                ? focusYs[i].tickFormat(boundedFocusHeight / 50)(t) !== ""
                  ? d.format(t)
                  : ""
                : d.format(t)
            )
        );
      })
      .selectAll(".axis-title")
      .data((d) => [d])
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "axis-title chart-subtitle")
          .attr("text-anchor", (d) => (d.axisSide === "left" ? "end" : "start"))
          .attr("fill", (d) => d.color)
          .attr("transform", (d) => {
            const x = d.axisSide === "left" ? axisOffset - 4 : -axisOffset + 4;
            const r = d.axisSide === "left" ? -90 : 90;
            return `translate(${x},${marginTop})rotate(${r})`;
          })
          .text((d) => d.label)
      );
  }

  function renderFocusSeries() {
    const { focusSeriesG, pathGenerators, focusX, focusYs } = chartState;

    focusSeriesG
      .selectAll("path")
      .data(
        data.series.filter((s) => selectedSeriesRef.current.has(s.label)),
        (d) => d.label
      )
      .join((enter) =>
        enter
          .append("path")
          .attr(
            "class",
            (d) => `series-path series-path--${d.type.toLowerCase()}`
          )
          .style("color", (d) => d.color)
          .style("stroke-width", (d) => d.lineWidth)
      )
      .each(function (d) {
        if (d.type !== "line") d3.select(this).lower();
      })
      .attr("display", (d) => (selectedSeries.has(d.label) ? null : "none"))
      .attr("d", (d, i) =>
        pathGenerators[i](
          focusX,
          focusYs[d.axisIndex]
        )(d.stackedValues || d.values)
      );
  }

  function renderContext() {
    renderContextXAxis();
    renderContextYAxes();
    renderContextSeries();
  }

  function renderContextXAxis() {
    let width = chartState.container.node().clientWidth;
    let boundedWidth = width - dimensions.marginLeft - dimensions.marginRight;

    const { contextHeight, marginBottom } = dimensions;
    const { contextXAxisG, contextX } = chartState;
    contextXAxisG
      .attr("transform", `translate(0,${contextHeight - marginBottom})`)
      .call(
        d3
          .axisBottom(contextX)
          .tickSizeOuter(0)
          .ticks(boundedWidth / 100)
      );
  }

  function renderContextYAxes() {
    const { contextYAxisG, contextYs } = chartState;
    const { axisOffset, axisWidth, marginLeft, marginRight } = dimensions;
    let width = chartState.container.node().clientWidth;

    contextYAxisG
      .attr("display", (d, i) =>
        data.series.filter(
          (e) => selectedSeries.has(e.label) && e.axisIndex === i
        ).length
          ? null
          : "none"
      )
      .attr("transform", (d) => {
        const i = axes.y.filter((e) => e.axisSide === d.axisSide).indexOf(d);
        const x =
          d.axisSide === "left"
            ? marginLeft - axisWidth * i - axisOffset
            : width - marginRight + axisWidth * i + axisOffset;
        return `translate(${x},0)`;
      })
      .each((d, i, n) => {
        const axis = d.axisSide === "left" ? d3.axisLeft : d3.axisRight;
        d3.select(n[i]).call(axis(contextYs[i]).ticks(2).tickFormat(d.format));
      });
  }

  function renderContextSeries() {
    const { contextSeriesG, pathGenerators, contextX, contextYs } = chartState;

    contextSeriesG
      .selectAll("path")
      .data(data.series, (d) => d.label)
      .join((enter) =>
        enter
          .append("path")
          .attr(
            "class",
            (d) => `series-path series-path--${d.type.toLowerCase()}`
          )
          .style("color", (d) => d.color)
          .style("stroke-width", (d) => d.lineWidth)
      )
      .each(function (d) {
        if (d.type !== "line") d3.select(this).lower();
      })
      .attr("display", (d) =>
        selectedSeriesRef.current.has(d.label) ? null : "none"
      )
      .attr("d", (d, i) =>
        pathGenerators[i](
          contextX,
          contextYs[d.axisIndex]
        )(d.stackedValues || d.values)
      );
  }

  const brushStarted = () => {
    chartState.brushG.classed("is-brushing", true);
  };

  const brushed = ({ selection }) => {
    let { contextX, brushHandle } = chartState;

    if (!selection) return;

    let sde = selection.map(contextX.invert, contextX).map(d3.utcDay.round);
    brushHandle.attr(
      "transform",
      (_, i) => `translate(${selection[i]},${dimensions.marginTop})`
    );

    setChartState((prevState) => ({ ...prevState, selectedDateExtent: sde }));

    wrangle(sde);
    renderFocus();
  };

  const brushEnded = () => {
    chartState.brushG.classed("is-brushing", false);
  };

  function pointerEntered() {
    chartState.activeG.classed("is-active", true);
    setTooltipShown(true);
  }

  const pointerMoved = lodash.throttle((event) => {
    const [xm, ym] = d3.pointer(event, chartState.container.node());
    const xDate = chartState.focusX.invert(xm);
    const i = d3.bisectCenter(data.dates, xDate);

    if (chartState.iActive !== i) {
      let iActive = i;
      renderActive(iActive);

      setChartState((prev) => ({ ...prev, iActive }));
    }
    moveTooltip(chartState.focusX(xDate), ym);
  }, 100);

  const pointerLeft = () => {
    let iActive = null;
    chartState.activeG.classed("is-active", false);

    setTooltipShown(false);
    setChartState((prev) => ({ ...prev, iActive }));
  };

  function renderActive(iActive) {
    chartState.activeG.attr(
      "transform",
      `translate(${chartState.focusX(data.dates[iActive])},0)`
    );

    chartState.activeG
      .selectAll(".active-circle")
      .data(
        data.series.filter(
          (d) =>
            d.values[iActive] !== null &&
            d.values[iActive] !== undefined &&
            !isNaN(d.values[iActive])
        ),
        (d) => d.label
      )
      .join((enter) =>
        enter
          .append("g")
          .attr("class", "active-circle")
          .style("color", (d) => d.color)
          .call((g) =>
            g.append("circle").attr("class", "active-circle__bg").attr("r", 8)
          )
          .call((g) =>
            g.append("circle").attr("class", "active-circle__fg").attr("r", 4)
          )
      )
      .attr(
        "transform",
        (d) =>
          `translate(0,${chartState.focusYs[d.axisIndex](
            d.stackedValues
              ? d.stackedValues[iActive][1] >= 0
                ? d.stackedValues[iActive][1]
                : d.stackedValues[iActive][0]
              : d.values[iActive]
          )})`
      )
      .attr("display", (d) => (selectedSeries.has(d.label) ? null : "none"));
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

      const brush = d3
        .brushX()
        .on("start", brushStarted)
        .on("brush", brushed)
        .on("end", brushEnded);

      const ro = new ResizeObserver(() => resized(brush));
      ro.observe(chartRef.current);

      chartState.captureRect
        .on("pointerenter", pointerEntered)
        .on("pointermove", pointerMoved)
        .on("pointerleave", pointerLeft)
        .on("touchstart", (event) => event.preventDefault());

      return () => {
        ro.disconnect();
        brush.on("start", null).on("brush", null).on("end", null);
      };
    }
  }, [scaffoldComplete]);

  useEffect(() => {
    if (scaffoldComplete) {
      selectedSeriesRef.current = selectedSeries;

      wrangle(chartState.selectedDateExtent);
      render();
    }
  }, [selectedSeries]);

  return (
    <article
      ref={parentRef}
      id={id}
      className="relative overflow-hidden min-h-[600px]"
    >
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
      <div ref={chartRef} className="line-area-chart chart-container">
        {/* CSV Button */}
        <div
          ref={actionRef}
          className="flex justify-between items-center pb-5 ignore-me"
          style={{ gridRow: 2 }}
        >
          <CSVButton data={data} title={title} />
          <ScreenshotButton target={parentRef.current} title={title} />
        </div>

        {/* Swatches */}
        <div ref={swatchRef} style={{ gridRow: 5 }}>
          {scaffoldComplete && (
            <Swatches
              series={data.series}
              selectedSeries={selectedSeries}
              setSelectedSeries={setSelectedSeries}
            />
          )}
        </div>

        {/* Tooltip */}
        <div
          ref={tooltipRef}
          className={`v-tooltip ${tooltipShown ? "is-active" : ""}`}
        >
          {tooltipShown ? (
            <Tooltip
              data={data}
              selectedSeries={selectedSeries}
              iActive={chartState.iActive}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default LineChart;
