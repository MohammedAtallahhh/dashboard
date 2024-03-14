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
    <div className="flex flex-wrap justify-center gap-y-1 gap-x-5">
      {series.map((item) => (
        <button
          key={item.label}
          className={`flex items-center cursor-pointer gap-1 `}
          onClick={() => toggleSelected(item.label)}
        >
          <div
            className={`w-4 h-4 rounded-full border-2 border-current ${
              selectedSeries.current.has(item.label)
                ? "bg-current"
                : " bg-transparent"
            }`}
            style={{ color: item.color }}
          ></div>
          <div className="text-text-light text-sm">{item.label}</div>
        </button>
      ))}
    </div>
  );
};

export default Swatches;
