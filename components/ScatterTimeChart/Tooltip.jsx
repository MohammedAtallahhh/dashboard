import React from "react";
import { utcFormat } from "d3";

const Tooltip = ({ hasR, hasBrush, data, filteredData, iActive }) => {
  const [x, y, color, dateOrKey, r] = filteredData[iActive];

  let title = dateOrKey;
  if (hasBrush) {
    title = utcFormat("%B %-d, %Y")(dateOrKey);
  }

  return (
    <div>
      <div className="sub-label">{title}</div>
      <div>
        <span className="sub-label">{data.x.label}</span>&nbsp;
        <span className="data-label">{data.x.format(x)}</span>
      </div>
      <div>
        <span className="sub-label">{data.y.label}</span>&nbsp;
        <span className="data-label">{data.y.format(y)}</span>
      </div>

      {hasR ? (
        <div>
          <span className="sub-label">{data.r.label}</span>&nbsp;
          <span className="data-label">{data.r.format(r)}</span>
        </div>
      ) : null}
    </div>
  );
};

export default Tooltip;
