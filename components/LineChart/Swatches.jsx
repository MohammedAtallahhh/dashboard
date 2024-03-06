const Swatches = ({ series, selectedSeries, setSelectedSeries }) => {
  const toggleSelected = (label) => {
    let newSelected = new Set([...selectedSeries]);

    if (newSelected.has(label)) {
      newSelected.delete(label);
      if (newSelected.size === 0) {
        console.log("here");
        console.log({ series });
        newSelected = new Set([...series.map((d) => d.label)]);
        console.log({ newSelected });
      }
    } else {
      newSelected.add(label);
    }

    setSelectedSeries(newSelected);
  };

  return (
    <div className="v-swatches">
      {series.map((item) => (
        <div
          key={item.label}
          className={`item ${
            selectedSeries.has(item.label) ? "is-selected" : ""
          }`}
          onClick={() => toggleSelected(item.label)}
        >
          <div className="item__swatch" style={{ color: item.color }}></div>
          <div className="item__label legend-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
};

export default Swatches;
