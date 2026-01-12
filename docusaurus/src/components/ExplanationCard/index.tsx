const ExplanationCard = ({
  section,
  styles,
  isHighlighted,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    id={`exp-${section.id}`}
    className={`explanation-card border-l-4 p-4 rounded-r-lg transition-all duration-200 ease-in-out cursor-pointer max-w-full sticky top-4 ${
      styles.cardColor
    } ${isHighlighted ? "bg-yellow-50 dark:bg-slate-600/15 shadow-md" : "bg-white dark:bg-gray-800"}`}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <h3 className={`!mb-2 !font-semibold text-base ${styles.titleColor}`}>
      {section.title}
    </h3>
    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed !mb-0 break-words">
      {section.description}
    </p>
  </div>
);

export default ExplanationCard;
