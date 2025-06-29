import Accordion from "../../Core/Accordion";
import CodeBlock from "../CodeBlock";
import { scenariosConfigData } from "../data";
import Section from "../Section";

const Scenarios = () => (
  <Section
    title="Common Scenarios & Firewall Exceptions"
    description="A 'deny by default' firewall is secure but not very useful without exceptions. Here's how to poke controlled holes in the firewall for common, real-world needs."
  >
    <Accordion
      items={scenariosConfigData.steps}
      getTitle={item => item.title}
      renderContent={item => (
        <>
          <p className="text-sm mb-4">{item.description}</p>
          <CodeBlock code={item.code} />
        </>
      )}
      stepPrefix={idx => (
        <span className="font-semibold text-white">Step {idx + 1}:</span>
      )}
    />
  </Section>
);

export default Scenarios;
