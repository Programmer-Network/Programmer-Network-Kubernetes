import { Tooltip } from "react-tooltip";

const ExplanationCard = ({
  section,
  styles,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    id={`exp-${section.id}`}
    data-tooltip-id={`tooltip-${section.id}`}
    data-tooltip-html={section.description}
    className={`explanation-card border-l-12 p-4 rounded-r-lg transition-all duration-200 ease-in-out cursor-pointer ${
      styles.cardColor
    } ${isHighlighted ? "bg-yellow-50 dark:bg-slate-600/15 " : ""}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <h3 className={`!mb-0 !text-sm !font-normal ${styles.titleColor}`}>
      {section.title}
    </h3>
    <Tooltip id={`tooltip-${section.id}`} />
  </div>
);

export default ExplanationCard;
