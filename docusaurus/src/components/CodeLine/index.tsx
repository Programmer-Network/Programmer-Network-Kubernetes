const CodeLine = ({ section, styles, highlightedKey, onHover }) => {
  const isHighlighted = highlightedKey === section.id;
  const value = section.value.trim();

  return (
    <span
      className={`block ${isHighlighted ? "bg-gray-700 rounded" : ""}`}
      onMouseEnter={() => onHover(section.id)}
      onMouseLeave={() => onHover(null)}
    >
      {" ".repeat(section.indent || 0)}
      <span className={styles.keyColor}>{section.key}</span>
      <span>{` ${value}`}</span>
    </span>
  );
};

export default CodeLine;
