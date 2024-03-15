import LoadingSpinner from "@/components/LoadingSpinner";

const Loading = () => {
  return (
    <div className="flex items-center justify-center fixed bg-black inset-0 z-50">
      <LoadingSpinner loading={true} />
    </div>
  );
};

export default Loading;
