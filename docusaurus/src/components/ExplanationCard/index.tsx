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
    className={`explanation-card border-l-4 p-4 rounded-r-lg transition-all duration-200 ease-in-out cursor-pointer ${
      styles.cardColor
    } ${isHighlighted ? "bg-yellow-50 dark:bg-slate-700/15 " : ""}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <h3 className={`font-bold !mb-0 ${styles.titleColor}`}>{section.title}</h3>
    <Tooltip id={`tooltip-${section.id}`} />
  </div>
);

export default ExplanationCard;
