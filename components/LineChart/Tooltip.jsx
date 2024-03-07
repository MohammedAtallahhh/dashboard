import { utcFormat } from "d3";

const Tooltip = ({ data, selectedSeries, iActive }) => {
  const date = utcFormat("%B %-d, %Y")(data.dates[iActive]);

  return (
    <>
      <div className="sub-label">{date}</div>
      {data.series
        .filter(
          (d) =>
            selectedSeries.has(d.label) &&
            (d.values[iActive] !== null) & (d.values[iActive] !== undefined) &&
            !isNaN(d.values[iActive])
        )
        .map((d) => (
          <div key={d.label}>
            <span
              className="swatch"
              style={{ backgroundColor: `${d.color}` }}
            ></span>
            &nbsp;
            <span className="sub-label">{d.label}</span>{" "}
            <span className="data-label">{d.format(d.values[iActive])}</span>
          </div>
        ))}
    </>
  );
};

export default Tooltip;
