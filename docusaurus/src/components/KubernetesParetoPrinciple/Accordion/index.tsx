import { useState } from "react";

const Accordion = ({
  items,
  initialActiveId,
}: {
  items: { id: number; title: string; content: string }[];
  initialActiveId?: number;
}) => {
  const [activeId, setActiveId] = useState(initialActiveId);

  const toggle = id => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <div className="space-y-3">
      {items.map(item => (
        <div
          key={item.id}
          className="border border-slate-200 dark:border-slate-700 rounded-md"
        >
          <button
            onClick={() => toggle(item.id)}
            className="w-full flex justify-between items-center p-4 text-left"
          >
            <span className="font-medium text-slate-700 dark:text-slate-200">
              {item.title}
            </span>
            <span className="text-amber-500">
              {activeId === item.id ? "−" : "+"}
            </span>
          </button>
          {activeId === item.id && (
            <div
              className="p-4 pt-0 text-slate-600 dark:text-slate-300"
              dangerouslySetInnerHTML={{ __html: item.content }}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Accordion;
