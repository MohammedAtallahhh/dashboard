/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { throttle } from "lodash";

import Tooltip from "./Tooltip";
import Swatches from "./Swatches";
import CSVButton from "../CSVButton";
import ScreenshotButton from "../ScreenshotButton";

const LineChart = memo(function LineChart({
  id,
  title,
  data,
  axes,
  footnotes,
  peripherals = {},
}) {
  const axisWidth = 80;
  const axisOffset = 20;
  const marginTop = 8;
  const marginBottom = 24;
  const focusHeight = 400;
  const contextHeight = 80;

  const marginRight =
    axisWidth * axes.y.filter((d) => d.axisSide === "right").length || 20;

  const marginLeft =
    axisWidth * axes.y.filter((d) => d.axisSide === "left").length;

  const boundedFocusHeight = focusHeight - marginTop - marginBottom;

  const boundedContextHeight = contextHeight - marginTop - marginBottom;
  const brushHandleHeight = boundedContextHeight;

  const clipId = `${id}-clip`;
  const parentRef = useRef(null);
  const chartRef = useRef(null);
  const actionRef = useRef(null);
  const tooltipRef = useRef(null);

  const focusRef = useRef(null);
  const contextRef = useRef(null);

  const focusX = useRef(d3.scaleUtc());
  const focusYs = useRef(
    axes.y.map(({ isLogScale }) => {
      const scale = isLogScale ? d3.scaleLog : d3.scaleLinear;
      return scale().range([focusHeight - marginBottom, marginTop]);
    })
  );
  const contextX = useRef(d3.scaleUtc());
  const contextYs = useRef(
    axes.y.map(({ isLogScale }) => {
      const scale = isLogScale ? d3.scaleLog : d3.scaleLinear;
      return scale().range([contextHeight - marginBottom, marginTop]);
    })
  );

  const selectedSeries = useRef(new Set(data.series.map((d) => d.label)));
  const selectedDateExtent = useRef(d3.extent(data.dates));
  const pathGenerators = useRef(
    data.series.map((d) => {
      if (d.type === "line") {
        return (x, y) =>
          d3
            .line()
            .defined((d) => d !== null && d !== undefined && !isNaN(d))
            .x((_, i) => x(data.dates[i]))
            .y((d) => y(d))
            .curve(d3.curveMonotoneX);
      }

      if (d.type === "area") {
        return (x, y) =>
          d3
            .area()
            .defined((d) => d !== null && d !== undefined && !isNaN(d))
            .x((_, i) => x(data.dates[i]))
            .y0(y.range()[0])
            .y1((d) => y(d))
            .curve(d3.curveMonotoneX);
      }

      if (d.type === "stackedArea") {
        return (x, y) => {
          return d3
            .area()
            .x((_, i) => x(data.dates[i]))
            .y0((d, i) => {
              if (!d) return;
              return Math.min(y.range()[0], y(d[0]));
            })
            .y1((d) => {
              if (!d) return;
              return y(d[1]);
            })
            .curve(d3.curveMonotoneX);
        };
      }
    })
  );
  const [ss, setSS] = useState([]);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tooltipShown, setTooltipShown] = useState(false);
  const [active, setActive] = useState(null);
  const [width, setWidth] = useState(0);

  function brushResizePath(d) {
    const e = +(d == "e"),
      x = e ? 1 : -1,
      y = brushHandleHeight;
    return `M${0.5 * x},0A6,6 0 0 ${e} ${6.5 * x},6V${y - 6}A6,6 0 0 ${e} ${
      0.5 * x
    },${y}ZM${2.5 * x},8V${y - 8}M${4.5 * x},8V${y - 8}`;
  }

  function wrangle() {
    contextX.current = contextX.current.domain(d3.extent(data.dates));

    const contextYMins = [];
    const contextYMaxes = [];

    focusYs.current.forEach((y, i) => {
      const filteredData = data.series.filter((d) => d.axisIndex === i);
      contextYMins[i] = d3.min(filteredData, (d) =>
        d3.min(d.stackedValues ? d.stackedValues.map((d) => d[1]) : d.values)
      );
      contextYMaxes[i] = d3.max(filteredData, (d) =>
        d3.max(d.stackedValues ? d.stackedValues.map((d) => d[1]) : d.values)
      );
    });

    if (axes.yAlignZero) {
      alignZero(contextYs.current, contextYMins, contextYMaxes);
    } else {
      contextYs.current.forEach((y, i) => {
        y.domain([contextYMins[i], contextYMaxes[i]]);
      });
    }

    focusX.current = focusX.current.domain(selectedDateExtent.current);

    const startIndex = Math.max(
      0,
      d3.bisectLeft(data.dates, selectedDateExtent.current[0]) - 1
    );
    const endIndex = Math.min(
      data.dates.length,
      d3.bisectRight(data.dates, selectedDateExtent.current[1]) + 1
    );

    const focusYMins = [];
    const focusYMaxes = [];

    focusYs.current.forEach((y, i) => {
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
      alignZero(focusYs.current, focusYMins, focusYMaxes);
    } else {
      focusYs.current.forEach((y, i) => {
        if (focusYMins[i] === undefined || focusYMaxes[i] === undefined) {
          y.domain([contextYMins[i], contextYMaxes[i]]);
        } else {
          y.domain([focusYMins[i], focusYMaxes[i]]);
        }
      });
    }
  }

  function stackData() {
    const stackSeries = data.series.filter(
      (d) => d.type === "stackedArea" && selectedSeries.current.has(d.label)
    );

    if (stackSeries.length === 0) return;

    const stackKeys = stackSeries.map((d) => d.label);

    const stackData = d3
      .stack()
      .keys(stackKeys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetDiverging)(
      d3.zip(...stackSeries.map((d) => d.values)).map((values) =>
        values.reduce((d, v, i) => {
          d[stackKeys[i]] = v;
          return d;
        }, {})
      )
    );

    stackSeries.forEach((d, i) => {
      d.stackedValues = stackData[i];
    });
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

  function render() {
    renderFocus();
    renderContext();
    setLoading(false);
  }

  function renderFocus() {
    renderFocusXAxis();
    renderFocusYAxes();
    renderFocusSeries();
  }

  function renderFocusXAxis() {
    const container = d3.select(chartRef.current);
    const focusXAxisG = d3.select(focusRef.current).select(".axis--x");

    let width = container.node().clientWidth;
    let boundedWidth = width - marginLeft - marginRight;

    focusXAxisG
      .attr("transform", `translate(0,${focusHeight - marginBottom})`)
      .call(
        d3
          .axisBottom(focusX.current)
          .tickSizeOuter(0)
          .ticks(boundedWidth / 100)
      );
  }

  function renderFocusYAxes() {
    const container = d3.select(chartRef.current);

    let width = container.node().clientWidth;

    const focusYAxisG = d3
      .select(focusRef.current)
      .selectAll(".axis--y")
      .data(axes.y);

    focusYAxisG
      .attr("display", (d, i) =>
        data.series.filter(
          (e) => selectedSeries.current.has(e.label) && e.axisIndex === i
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
          axis(focusYs.current[i])
            .ticks(boundedFocusHeight / 50)
            .tickFormat((t) =>
              d.isLogScale
                ? focusYs.current[i].tickFormat(boundedFocusHeight / 50)(t) !==
                  ""
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
    const focusSeriesG = d3.select(focusRef.current).select(".series");

    focusSeriesG
      .selectAll("path")
      .data(
        data.series.filter((s) => selectedSeries.current.has(s.label)),
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
      .attr("display", (d) =>
        selectedSeries.current.has(d.label) ? null : "none"
      )
      .attr("d", (d, i) => {
        return pathGenerators.current[i](
          focusX.current,
          focusYs.current[d.axisIndex]
        )(d.stackedValues || d.values);
      });
  }

  function renderContext() {
    renderContextXAxis();
    renderContextYAxes();
    renderContextSeries();
  }

  function renderContextXAxis() {
    const container = d3.select(chartRef.current);

    let width = container.node().clientWidth;
    let boundedWidth = width - marginLeft - marginRight;

    const contextXAxisG = d3.select(contextRef.current).select(".axis--x");

    contextXAxisG
      .attr("transform", `translate(0,${contextHeight - marginBottom})`)
      .call(
        d3
          .axisBottom(contextX.current)
          .tickSizeOuter(0)
          .ticks(boundedWidth / 100)
      );
  }

  function renderContextYAxes() {
    const container = d3.select(chartRef.current);
    let width = container.node().clientWidth;

    const contextYAxisG = d3
      .select(contextRef.current)
      .selectAll(".axis--y")
      .data(axes.y);

    contextYAxisG
      .attr("display", (d, i) =>
        data.series.filter(
          (e) => selectedSeries.current.has(e.label) && e.axisIndex === i
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
          axis(contextYs.current[i]).ticks(2).tickFormat(d.format)
        );
      });
  }

  function renderContextSeries() {
    const contextSeriesG = d3.select(contextRef.current).select(".series");

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
        selectedSeries.current.has(d.label) ? null : "none"
      )
      .attr("d", (d, i) =>
        pathGenerators.current[i](
          contextX.current,
          contextYs.current[d.axisIndex]
        )(d.stackedValues || d.values)
      );
  }

  function resized(brush) {
    if (!chartRef.current) return;
    const container = d3.select(chartRef.current);
    if (
      container.node().clientWidth === 0 ||
      container.node().clientWidth === width
    )
      return;

    const focusSvg = d3.select(focusRef.current);
    const contextSvg = d3.select(contextRef.current);

    let w = container.node().clientWidth;
    setWidth(w);

    focusX.current = focusX.current.range([marginLeft, w - marginRight]);

    contextX.current = contextX.current.range([marginLeft, w - marginRight]);

    brush.extent([
      [marginLeft, marginTop + 0.5],
      [w - marginRight, contextHeight - marginBottom + 0.5],
    ]);

    focusSvg.attr("viewBox", [0, 0, w, focusHeight]);
    focusSvg.select(".clip-rect").attr("width", w - marginLeft - marginRight);
    focusSvg
      .select(".capture-rect")
      .attr("width", w - marginLeft - marginRight);

    contextSvg
      .select(".brush-g")
      .call(brush)
      .call(brush.move, selectedDateExtent.current.map(contextX.current));

    contextSvg.attr("viewBox", [0, 0, w, contextHeight]);

    render();
  }

  function brushStarted() {
    d3.select(contextRef.current)
      .select(".brush-g")
      .classed("is-brushing", true);
  }

  function brushed({ selection }) {
    if (!selection) return;

    const brushHandle = d3
      .select(contextRef.current)
      .selectAll(".handle--custom")
      .data([{ type: "w" }, { type: "e" }]);

    let sde = selection
      .map(contextX.current.invert, contextX.current)
      .map(d3.utcDay.round);

    brushHandle.attr(
      "transform",
      (_, i) => `translate(${selection[i]},${marginTop})`
    );

    selectedDateExtent.current = sde;

    wrangle();
    renderFocus();
  }

  function brushEnded() {
    d3.select(contextRef.current)
      .select(".brush-g")
      .classed("is-brushing", false);
  }

  function pointerEntered() {
    d3.select(focusRef.current).select(".active-g").classed("is-active", true);
    setTooltipShown(true);
  }

  const pointerMoved = throttle((event) => {
    const container = d3.select(chartRef.current);

    const [xm, ym] = d3.pointer(event, container.node());
    const xDate = focusX.current.invert(xm);
    const i = d3.bisectCenter(data.dates, xDate);

    if (active !== i) {
      let active = i;
      renderActive(active);

      setActive(active);
    }

    moveTooltip(focusX.current(xDate), ym);
  }, 100);

  const pointerLeft = () => {
    d3.select(focusRef.current).select(".active-g").classed("is-active", false);

    setTooltipShown(false);
    setActive(null);
  };

  function renderActive(active) {
    d3.select(focusRef.current)
      .select(".active-g")
      .attr("transform", `translate(${focusX.current(data.dates[active])},0)`);

    d3.select(focusRef.current)
      .select(".active-g")
      .selectAll(".active-circle")
      .data(
        data.series.filter(
          (d) =>
            d.values[active] !== null &&
            d.values[active] !== undefined &&
            !isNaN(d.values[active])
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
          `translate(0,${focusYs.current[d.axisIndex](
            d.stackedValues
              ? d.stackedValues[active][1] >= 0
                ? d.stackedValues[active][1]
                : d.stackedValues[active][0]
              : d.values[active]
          )})`
      )
      .attr("display", (d) =>
        selectedSeries.current.has(d.label) ? null : "none"
      );
  }

  const moveTooltip = (xm, ym) => {
    const container = d3.select(chartRef.current);

    const offset = 12;
    let x, y;
    const tRect = tooltipRef.current.getBoundingClientRect();
    const bRect = container.node().getBoundingClientRect();

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
    stackData();
    wrangle();

    const brush = d3
      .brushX()
      .on("start", brushStarted)
      .on("brush", brushed)
      .on("end", brushEnded);

    d3.select(focusRef.current)
      .select(".capture-rect")
      .on("pointerenter", pointerEntered)
      .on("pointermove", pointerMoved)
      .on("pointerleave", pointerLeft)
      .on("touchstart", (event) => event.preventDefault());

    const ro = new ResizeObserver(() => resized(brush));
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      brush.on("start", null).on("brush", null).on("end", null);
    };
  }, []);

  useEffect(() => {
    stackData();
    wrangle();
    render();
  }, [ss]);

  const boundedWidth = width - marginLeft - marginRight;
  return (
    <article
      ref={parentRef}
      id={id}
      className="relative overflow-hidden mb-10 bg-surface-1 p-6 rounded-md  min-h-[700px]"
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

      <div ref={chartRef} className="line-area-chart grid gap-5">
        <h2 className="text-lg leading-normal">{title}</h2>

        {/* Actions */}
        <div
          ref={actionRef}
          className="flex justify-between items-center pb-5 ignore-me"
        >
          <CSVButton data={data} title={title} />
          <ScreenshotButton target={parentRef.current} title={title} />
        </div>

        <svg ref={focusRef} className="focus-svg">
          <clipPath id={clipId}>
            <rect
              className="clip-rect"
              x={marginLeft}
              y={marginTop}
              height={focusHeight}
            ></rect>
          </clipPath>

          {/* Peripherals */}
          <g className="peripherals">
            {peripherals.highlightedAreas
              ? peripherals.highlightedAreas.map((a) => (
                  <rect
                    key={a.color}
                    className="highlighted-area-rect"
                    clipPath={`url(#${clipId})`}
                    fill={a.color}
                    x={a.x0 === undefined ? marginLeft : focusX.current(a.x0)}
                    y={
                      a.y0 === undefined
                        ? marginTop
                        : focusYs.current[a.axisIndex](a.y0)
                    }
                    width={
                      a.x0 === undefined
                        ? boundedWidth
                        : focusX.current(a.x1) - focusX.current(a.x0)
                    }
                    height={
                      a.x0 === undefined
                        ? boundedFocusHeight
                        : focusYs.current[a.axisIndex](a.y1) -
                          focusYs.current[a.axisIndex](a.y0)
                    }
                  ></rect>
                ))
              : null}
          </g>

          {/* X axis */}
          <g className="axis axis--x axis-label"></g>

          {/* Y Axes */}
          <g className="y-g">
            {axes.y.map(({ color, label }) => (
              <g
                key={color + label}
                className="axis axis--y axis-label"
                style={{ color }}
              ></g>
            ))}
          </g>

          {/* Series */}
          <g className="series" clipPath={`url(#${clipId})`}></g>

          {/* Active point */}
          <g className="active-g">
            <line
              className="active-line"
              y1={marginTop}
              y2={focusHeight - marginBottom}
            ></line>
          </g>

          {/* Capture rect */}
          <rect
            className="capture-rect"
            x={marginLeft}
            y={0}
            height={focusHeight}
          ></rect>
        </svg>

        <svg ref={contextRef} className="context-svg">
          {/* X axis */}
          <g className="axis axis--x axis-label"></g>

          {/* Y Axes */}
          <g>
            {axes.y.map(({ color, label }) => (
              <g
                key={color + label}
                className="axis axis--y axis-label"
                style={{ color }}
              ></g>
            ))}
          </g>

          {/* Series */}
          <g className="series"></g>

          {/* Brush */}
          <g className="brush-g">
            {[{ type: "w" }, { type: "e" }].map(({ type }) => (
              <path
                key={type}
                className="handle--custom"
                d={brushResizePath(type)}
              ></path>
            ))}
          </g>
        </svg>

        {/* Swatches */}
        <div>
          <Swatches
            series={data.series}
            selectedSeries={selectedSeries}
            setSS={setSS}
          />
        </div>

        {/* Footnotes */}
        {footnotes ? (
          <div>
            {footnotes.map((f) => (
              <p key={f} className="text-sm text-text-light">
                {f}
              </p>
            ))}
          </div>
        ) : null}

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
              selectedSeries={selectedSeries}
              active={active}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
});

export default LineChart;
