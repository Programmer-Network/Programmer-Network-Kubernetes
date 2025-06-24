import { useState } from "react";
import CodeBlock from "../CodeBlock";
import { cx } from "../utils";

interface AccordionItem {
  title: string;
  description: string;
  code: string;
}

interface AccordionProps {
  items: AccordionItem[];
}

const Accordion = ({ items }: AccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-gray-800">
          <button
            onClick={() => handleToggle(index)}
            className="w-full flex justify-between items-center p-4 text-left bg-[#1c1c1c] hover:bg-gray-800"
          >
            <span className="font-semibold text-white">{item.title}</span>
            <span
              className={cx(
                "transform transition-transform text-[#ffab00]",
                openIndex === index && "rotate-45"
              )}
            >
              +
            </span>
          </button>
          <div
            className={cx(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openIndex === index ? "max-h-screen" : "max-h-0"
            )}
          >
            <div className="p-4 bg-black/20 border-t border-gray-800">
              <p className="text-sm mb-4">{item.description}</p>
              <CodeBlock code={item.code} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
