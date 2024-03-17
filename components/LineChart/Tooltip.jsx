import { utcFormat } from "d3";

const Tooltip = ({ series, dates, selectedSeries, active }) => {
  const date = utcFormat("%B %-d, %Y")(dates[active]);

  return (
    <>
      <div className="text-sm text-text-light mb-3">{date}</div>
      {series
        .filter(
          (d) =>
            selectedSeries.current.has(d.label) &&
            (d.values[active] !== null) & (d.values[active] !== undefined) &&
            !isNaN(d.values[active])
        )
        .map((d) => (
          <div key={d.label} className="flex items-center">
            <span
              className="inline-block w-4 h-4 rounded-full relative"
              style={{ backgroundColor: `${d.color}` }}
            ></span>
            &nbsp;
            <span className="text-sm text-text-light mr-2">
              {d.label}:
            </span>{" "}
            <span className="text-lg">{d.format(d.values[active])}</span>
          </div>
        ))}
    </>
  );
};

export default Tooltip;
