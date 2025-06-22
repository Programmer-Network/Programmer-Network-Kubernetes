import { useState } from "react";
import CodeBlock from "../CodeBlock";
import ExplanationCard from "../ExplanationCard";
import { sections, sectionStyles } from "./constants";

export default function App() {
  const [highlightedSection, setHighlightedSection] = useState(null);

  const handleHover = section => {
    setHighlightedSection(section);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-center mt-6 text-sm"></div>
      <div>
        <div className="rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Side: YAML Code */}
          <div className="col-span-8">
            <CodeBlock
              highlightedSection={highlightedSection}
              onHover={handleHover}
              sections={sections}
              sectionStyles={sectionStyles}
            />
          </div>

          {/* Right Side: Explanations */}
          <div className="flex flex-col space-y-4 col-span-4">
            {sections.map(section => (
              <ExplanationCard
                key={section.id}
                section={section}
                styles={sectionStyles[section.id]}
                isHighlighted={
                  highlightedSection &&
                  highlightedSection.title.startsWith(section.title)
                }
                onMouseEnter={() => handleHover(section)}
                onMouseLeave={() => handleHover(null)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
