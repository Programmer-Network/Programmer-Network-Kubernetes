import {
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/20/solid";

export default function Alert({
  title,
  description,
  variant = "warning",
}: {
  title: string;
  description: string;
  variant?: "warning" | "error" | "success";
}) {
  // Color and icon mapping
  const variantMap = {
    warning: {
      bg: "bg-[#ffab00]/10 dark:bg-[#ffab00]/5",
      border: "border-[#ffab00] dark:border-[#ffab00]",
      text: "text-[#ffab00] dark:text-[#ffab00]",
      Icon: AcademicCapIcon,
    },
    error: {
      bg: "bg-red-100 dark:bg-red-900/20",
      border: "border-red-500 dark:border-red-400",
      text: "text-red-700 dark:text-red-400",
      Icon: ExclamationTriangleIcon,
    },
    success: {
      bg: "bg-green-100 dark:bg-green-900/20",
      border: "border-green-500 dark:border-green-400",
      text: "text-green-700 dark:text-green-400",
      Icon: CheckCircleIcon,
    },
  };
  const { bg, border, text, Icon } = variantMap[variant] || variantMap.warning;

  return (
    <div className={`!my-4 rounded-md ${bg} p-4 border ${border}`}>
      <div className="flex !text-xl">
        {title && (
          <div className="shrink-0">
            <Icon
              aria-hidden="true"
              className={`size-6 ${text} relative top-0.5`}
            />
          </div>
        )}
        <div className="ml-3">
          {title && <h3 className={`font-medium !mb-2 ${text}`}>{title}</h3>}
          <div className={text}>
            <p className="!mb-0">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
