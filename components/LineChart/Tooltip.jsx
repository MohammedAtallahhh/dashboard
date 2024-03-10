import { utcFormat } from "d3";

const Tooltip = ({ data, selectedSeries, active }) => {
  const date = utcFormat("%B %-d, %Y")(data.dates[active]);

  return (
    <>
      <div className="sub-label">{date}</div>
      {data.series
        .filter(
          (d) =>
            selectedSeries.current.has(d.label) &&
            (d.values[active] !== null) & (d.values[active] !== undefined) &&
            !isNaN(d.values[active])
        )
        .map((d) => (
          <div key={d.label}>
            <span
              className="swatch"
              style={{ backgroundColor: `${d.color}` }}
            ></span>
            &nbsp;
            <span className="sub-label">{d.label}</span>{" "}
            <span className="data-label">{d.format(d.values[active])}</span>
          </div>
        ))}
    </>
  );
};

export default Tooltip;
