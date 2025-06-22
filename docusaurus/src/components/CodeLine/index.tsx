const CodeLine = ({ section, styles, highlightedKey, onHover }) => {
  const isHighlighted = highlightedKey === section.id;

  return (
    <span
      className={`block ${
        isHighlighted ? "bg-gray-200 dark:bg-gray-800/30 rounded" : ""
      }`}
      onMouseEnter={() => onHover(section.id)}
      onMouseLeave={() => onHover(null)}
    >
      {" ".repeat(section.indent || 0)}
      <span className={styles.keyColor}>{section.key}</span>
      <span>{section.value}</span>
    </span>
  );
};

export default CodeLine;
