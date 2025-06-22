import Accordion from "../Accordion";

const TabContent = ({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { id: number; title: string; content: string }[];
}) => (
  <div>
    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
      {title}
    </h3>
    <p className="text-slate-600 dark:text-slate-300 mb-4">{description}</p>
    <Accordion items={items} initialActiveId={1} />
  </div>
);

export default TabContent;
