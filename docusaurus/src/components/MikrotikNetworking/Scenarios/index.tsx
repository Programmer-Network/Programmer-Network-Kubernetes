import Accordion from "../Accordion";
import { scenariosConfigData } from "../data";
import Section from "../Section";

const Scenarios = () => (
  <Section
    title="Common Scenarios & Firewall Exceptions"
    description="A 'deny by default' firewall is secure but not very useful without exceptions. Here's how to poke controlled holes in the firewall for common, real-world needs."
  >
    <Accordion items={scenariosConfigData.steps} />
  </Section>
);

export default Scenarios;
