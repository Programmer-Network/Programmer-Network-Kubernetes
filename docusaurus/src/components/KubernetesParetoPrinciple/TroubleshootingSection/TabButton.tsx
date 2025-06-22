const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 text-center py-3 px-1 border-b-2 font-medium transition focus:outline-none ${
      isActive
        ? "border-amber-500 text-amber-500"
        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
    }`}
  >
    {label}
  </button>
);

export default TabButton;
