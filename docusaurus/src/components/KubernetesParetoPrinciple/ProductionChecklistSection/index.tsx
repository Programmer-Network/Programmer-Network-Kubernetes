import { useState } from "react";
import ContentRenderer from "../ContentRenderer";
import { contentData } from "../content";

const ProductionChecklistSection = () => {
  const [activeId, setActiveId] = useState(1);

  const toggle = id => {
    setActiveId(activeId === id ? null : id);
  };

  return (
    <section id="production" className="mb-16 md:mb-24 scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Production-Readiness Crucible
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          A functional cluster is not a production cluster. Use this checklist
          to systematically harden, monitor, and back up your system for
          mission-critical workloads.
        </p>
      </div>
      <div>
        {contentData.production.map(item => (
          <div
            key={item.id}
            className="rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 mb-4"
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full flex justify-between items-center px-4 py-4 text-left"
            >
              <div className="flex items-center">
                <span className="mr-4 text-2xl">{item.icon}</span>
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.title}
                  </span>
                  <p className="text-slate-500 dark:text-slate-400 !mb-0 text-left">
                    {item.description}
                  </p>
                </div>
              </div>
              <span className="text-amber-500 font-light text-2xl">
                {activeId === item.id ? "−" : "+"}
              </span>
            </button>
            {activeId === item.id && (
              <div className="p-4 sm:p-6 pt-0 text-slate-600 dark:text-slate-300">
                <ContentRenderer content={item.content} />
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductionChecklistSection;
