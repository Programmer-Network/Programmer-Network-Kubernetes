import { useState } from "react";
import CodeBlock from "../CodeBlock";
import ExplanationCard from "../ExplanationCard";
import Tabs from "../Tabs";
import * as configmapConfig from "./configmap";
import * as deploymentConfig from "./deployment";
import * as ingressConfig from "./ingress";
import * as pvcConfig from "./pvc";
import * as secretConfig from "./secret";
import * as serviceConfig from "./service";

const yamls = {
  deployment: deploymentConfig,
  service: serviceConfig,
  ingress: ingressConfig,
  configmap: configmapConfig,
  secret: secretConfig,
  pvc: pvcConfig,
};

const tabs = [
  { id: "deployment", label: "Deployment" },
  { id: "service", label: "Service" },
  { id: "ingress", label: "Ingress" },
  { id: "configmap", label: "ConfigMap" },
  { id: "secret", label: "Secret" },
  { id: "pvc", label: "PVC" },
];

export default function App() {
  const [highlightedSection, setHighlightedSection] = useState(null);
  const [activeTab, setActiveTab] = useState("deployment");

  const handleHover = section => {
    setHighlightedSection(section);
  };

  const { sections, sectionStyles } = yamls[activeTab];

  return (
    <div className="flex flex-col items-center justify-center">
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="text-center mt-6"></div>
      <div className="w-full">
        <div className="rounded-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
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
          <div className="space-y-2 col-span-4">
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
