import React from "react";

import CSVIcon from "./icons/CSVIcon";
import { csvFormat } from "d3";

const CSVButton = ({ data, title }) => {
  const downloadCSV = () => {
    const fileData = [];

    if (data.series) {
      // Line area chart
      for (let i = 0; i < data.dates.length; i++) {
        const d = {
          Date: data.dates[i],
        };
        data.series.forEach((s) => {
          d[s.label] = s.values[i];
        });

        fileData.push(d);
      }
    } else {
      // Scatter
      for (let i = 0; i < data.x.values.length; i++) {
        const d = {};
        if (data.dates) {
          d.Date = data.dates[i];
        } else if (data.keys) {
          d.Name = data.keys[i];
        }
        d[data.x.label] = data.x.values[i];
        d[data.y.label] = data.y.values[i];
        if (data.z) {
          d[data.z.label] = data.z.values[i];
        }
        fileData.push(d);
      }
    }

    const csv = csvFormat(fileData);

    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
    a.target = "_blank";
    a.download = `${title}.csv`;
    a.click();
    a.remove();
  };

  return (
    <div className="export">
      <button className="button--csv" onClick={downloadCSV}>
        <CSVIcon />
      </button>
    </div>
  );
};

export default CSVButton;
