import { Fragment } from "react";
import CodeLine from "../CodeLine";

const CodeBlock = ({ highlightedKey, onHover, sections, sectionStyles }) => {
  return (
    <div className="rounded-xl overflow-x-auto sticky">
      <pre className="!bg-gray-100/2">
        <code>
          {sections.map(section => (
            <Fragment key={section.id}>
              {section.comment && (
                <span className="text-gray-500 block mt-4">
                  {section.comment}
                </span>
              )}
              <CodeLine
                section={section}
                styles={sectionStyles[section.id]}
                highlightedKey={highlightedKey}
                onHover={onHover}
              />
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;
