const ProgressBar = ({ percentage }) => {
  return (
    <div className="flex items-center gap-4 w-full max-w-sm">
      <div className="w-full  h-3 dark:bg-layout-dark bg-white border dark:border-border-dark-grey border-darkest-blue rounded-full overflow-hidden">
        <div
          className="h-full bg-[#008000] rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <span className="text-greyish ">{percentage}%</span>
    </div>
  );
};

export default ProgressBar;
