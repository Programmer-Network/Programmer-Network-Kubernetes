import Accordion from "../../Core/Accordion";
import CodeBlock from "../CodeBlock";
import { firewallConfigData } from "../data";
import Section from "../Section";

const FirewallLogic = () => (
  <Section
    title="Deny by Default"
    description="This is where the security policies are enforced on the RB3011 Router. These scripts create a 'deny by default' posture, which significantly enhances security."
  >
    <Accordion
      items={firewallConfigData.steps}
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

export default FirewallLogic;
