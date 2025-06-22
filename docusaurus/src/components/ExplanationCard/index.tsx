const ExplanationCard = ({
  section,
  styles,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    id={`exp-${section.id}`}
    className={`explanation-card border-l-4 p-4 rounded-r-lg transition-all duration-200 ease-in-out cursor-pointer ${
      styles.cardColor
    } ${
      isHighlighted
        ? "transform scale-[1.01] shadow-lg dark:bg-slate-700 bg-yellow-50"
        : ""
    }`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <h3 className={`font-bold ${styles.titleColor}`}>{section.title}</h3>
    <p
      className="text-sm mt-1 text-slate-600 dark:text-slate-300"
      dangerouslySetInnerHTML={{ __html: section.description }}
    ></p>
  </div>
);

export default ExplanationCard;
