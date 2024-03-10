const Swatches = ({ series, selectedSeries, setSS }) => {
  const toggleSelected = (label) => {
    let newSelected = new Set([...selectedSeries.current]);

    if (newSelected.has(label)) {
      newSelected.delete(label);
      if (newSelected.size === 0) {
        newSelected = new Set([...series.map((d) => d.label)]);
      }
    } else {
      newSelected.add(label);
    }

    selectedSeries.current = newSelected;
    setSS(newSelected);
  };

  return (
    <div className="v-swatches">
      {series.map((item) => (
        <div
          key={item.label}
          className={`item ${
            selectedSeries.current.has(item.label) ? "is-selected" : ""
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
