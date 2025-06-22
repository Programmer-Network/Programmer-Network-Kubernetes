const CodeLine = ({ section, styles, highlightedSection, onHover }) => {
  const isHighlighted =
    highlightedSection && section.title.startsWith(highlightedSection.title);

  return (
    <span
      className={`block ${
        isHighlighted ? "bg-gray-200 dark:bg-gray-800/30 rounded" : ""
      }`}
      onMouseEnter={() => onHover(section)}
      onMouseLeave={() => onHover(null)}
    >
      {" ".repeat(section.indent || 0)}
      <span className={styles.keyColor}>{section.key}</span>
      <span>{section.value}</span>
    </span>
  );
};

export default CodeLine;
