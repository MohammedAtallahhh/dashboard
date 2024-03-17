const LoadingSpinner = ({ loading }) => {
  return (
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
  );
};

export default LoadingSpinner;
