import Accordion from "../Accordion";
import { firewallConfigData } from "../data";
import Section from "../Section";

const FirewallLogic = () => (
  <Section
    title="Deny by Default"
    description="This is where the security policies are enforced on the RB3011 Router. These scripts create a 'deny by default' posture, which significantly enhances security."
  >
    <Accordion items={firewallConfigData.steps} />
  </Section>
);

export default FirewallLogic;
