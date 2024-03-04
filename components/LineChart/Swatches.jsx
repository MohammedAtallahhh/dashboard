import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const Swatches = ({ series, selectedSeries }) => {
  const [selected, setSelected] = useState(selectedSeries);
  const containerRef = useRef();

  console.log({ selected, selectedSeries });

  function render() {
    const container = d3.select(containerRef.current);

    const item = container
      .selectAll(".item")
      .data(series, (d) => d.label)
      .join((enter) =>
        enter
          .append("div")
          .attr("class", "item")
          .classed("is-selected", (d) => {
            console.log({ selected, d });
            selected.has(d.label);
          })
          .call((div) =>
            div
              .append("div")
              .attr("class", "item__swatch")
              .style("color", (d) => d.color)
          )
          .call((div) =>
            div
              .append("div")
              .attr("class", "item__label legend-label")
              .text((d) => d.label)
          )
          .on("click", (event, d) => clicked(event, d, container, item))
      );
  }

  function clicked(event, d, container, item) {
    toggleSelected(d);
    item.classed("is-selected", (d) => selected.has(d.label));

    container.dispatch("change", {
      detail: selected,
      bubbles: true,
    });
  }

  function toggleSelected(d) {
    if (selected.has(d.label)) {
      selected.delete(d.label);
      if (selected.size === 0) {
        setSelected(new Set(series.map((d) => d.label)));
      }
    } else {
      setSelected(new Set([...selected, d.label]));
    }
  }

  useEffect(() => {
    render();
  }, [selected]);

  return <div ref={containerRef} className="v-swatches row="></div>;
};

export default Swatches;
