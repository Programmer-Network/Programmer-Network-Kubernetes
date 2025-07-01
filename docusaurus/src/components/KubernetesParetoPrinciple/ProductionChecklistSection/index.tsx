import Accordion from "../../Core/Accordion";
import ContentRenderer from "../ContentRenderer";
import { contentData } from "../content";

const ProductionChecklistSection = () => (
  <section id="production" className="mb-16 md:mb-24 scroll-mt-20">
    <div className="text-center mb-12">
      <h2 className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Production-Readiness Crucible
      </h2>
      <p className="mt-4">
        A functional cluster is not a production cluster. Use this checklist to
        systematically harden, monitor, and back up your system for
        mission-critical workloads.
      </p>
    </div>
    <Accordion
      items={contentData.production}
      getTitle={item => (
        <span className="flex items-center">
          <span className="mr-4 text-2xl">{item.icon}</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {item.title}
          </span>
          <span className="ml-2 text-slate-500 dark:text-slate-400 font-normal">
            {item.description}
          </span>
        </span>
      )}
      renderContent={item => <ContentRenderer content={item.content} />}
      initialActiveIndex={0}
    />
  </section>
);

export default ProductionChecklistSection;
