import Accordion from "../../Core/Accordion";
import CodeBlock from "../CodeBlock";
import { hardeningConfigData } from "../data";
import Section from "../Section";

const Summary = () => (
  <Section
    title="Summary & Final Hardening"
    description="Once the main configurations are applied, these final steps should be performed on all devices to complete the security setup."
  >
    <div className="p-6 border border-slate-700 mb-4 rounded-lg">
      <h3 className="font-bold text-xl mb-4 text-[#ffab00]">
        Key Achievements
      </h3>
      <ul className="list-disc list-inside space-y-2 text-gray-300">
        <li>
          <b className="font-semibold">Robust Segmentation:</b> The K3S cluster
          is now securely isolated.
        </li>
        <li>
          <b className="font-semibold">Centralized Security:</b> All traffic is
          inspected by the RB3011's powerful firewall.
        </li>
        <li>
          <b className="font-semibold">Optimized Performance:</b> Each device is
          used for its intended purpose.
        </li>
        <li>
          <b className="font-semibold">Secure Management:</b> A dedicated
          management VLAN protects the network equipment.
        </li>
      </ul>
    </div>
    <Accordion
      items={hardeningConfigData.steps}
      getTitle={(item) => item.title}
      renderContent={(item) => (
        <>
          <p className="text-sm mb-4">{item.description}</p>
          <CodeBlock code={item.code} />
        </>
      )}
      stepPrefix={(idx) => (
        <span className="font-semibold">Step {idx + 1}:</span>
      )}
    />
  </Section>
);

export default Summary;
