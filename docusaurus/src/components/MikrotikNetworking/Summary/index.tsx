import Accordion from "../Accordion";
import { hardeningConfigData } from "../data";
import Section from "../Section";

const Summary = () => (
  <Section
    title="Summary & Final Hardening"
    description="Once the main configurations are applied, these final steps should be performed on all devices to complete the security setup."
  >
    <div className="bg-[#1c1c1c] p-6 border border-gray-800 mb-8">
      <h3 className="font-bold text-xl mb-4 text-[#ffab00]">
        Key Achievements
      </h3>
      <ul className="list-disc list-inside space-y-2 text-gray-300">
        <li>
          <b className="font-semibold text-white">Robust Segmentation:</b> The
          K3S cluster is now securely isolated.
        </li>
        <li>
          <b className="font-semibold text-white">Centralized Security:</b> All
          traffic is inspected by the RB3011's powerful firewall.
        </li>
        <li>
          <b className="font-semibold text-white">Optimized Performance:</b>{" "}
          Each device is used for its intended purpose.
        </li>
        <li>
          <b className="font-semibold text-white">Secure Management:</b> A
          dedicated management VLAN protects the network equipment.
        </li>
      </ul>
    </div>
    <div className="border border-gray-800">
      <Accordion items={hardeningConfigData.steps} />
    </div>
  </Section>
);

export default Summary;
