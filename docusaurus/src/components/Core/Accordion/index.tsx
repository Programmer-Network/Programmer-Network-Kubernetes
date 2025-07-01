import { useState } from "react";

interface AccordionProps<T> {
  items: T[];
  getTitle: (item: T, idx: number) => React.ReactNode;
  renderContent: (item: T, idx: number) => React.ReactNode;
  initialActiveIndex?: number | null;
  stepPrefix?: (idx: number) => React.ReactNode; // Optional, for Mikrotik style
}

function Accordion<T>({
  items,
  getTitle,
  renderContent,
  initialActiveIndex = null,
  stepPrefix,
}: AccordionProps<T>) {
  const [openIndex, setOpenIndex] = useState<number | null>(initialActiveIndex);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="border border-slate-200 dark:border-slate-700 rounded-md bg-white/5 dark:bg-black/20"
        >
          <button
            onClick={() => handleToggle(idx)}
            className="w-full flex justify-between items-center p-4 text-left hover:bg-slate-100/30 dark:hover:bg-gray-800/20 transition-colors"
          >
            <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              {stepPrefix ? stepPrefix(idx) : null}
              {getTitle(item, idx)}
            </span>
            <span
              className={`transform transition-transform text-amber-500 ${
                openIndex === idx ? "rotate-45" : ""
              }`}
            >
              +
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              openIndex === idx ? "max-h-screen py-6" : "max-h-0"
            }`}
          >
            {openIndex === idx && (
              <div className="p-4 pt-0">{renderContent(item, idx)}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Accordion;
