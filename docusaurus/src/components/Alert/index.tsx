import { AcademicCapIcon } from "@heroicons/react/20/solid";

export default function Alert({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="!my-4 rounded-md bg-[#ffab00]/10 dark:bg-[#ffab00]/5 p-4 border border-[#ffab00] dark:border-[#ffab00]">
      <div className="flex !text-xl">
        {title && (
          <div className="shrink-0">
            <AcademicCapIcon
              aria-hidden="true"
              className="size-6 text-[#ffab00] dark:text-[#ffab00] relative top-0.5"
            />
          </div>
        )}
        <div className="ml-3">
          {title && (
            <h3 className="font-medium !text-[#ffab00] dark:!text-[#ffab00] !mb-2">
              {title}
            </h3>
          )}
          <div className="text-[#ffab00] dark:text-[#ffab00]">
            <p className="!mb-0">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
