import Section from "../Section";
import { cx } from "../utils";

interface VlanCardProps {
  vlan: string;
  name: string;
  subnet: string;
  description: string;
  tag: string;
  borderColor: string;
}

const VlanCard = ({
  vlan,
  name,
  subnet,
  description,
  tag,
  borderColor,
}: VlanCardProps) => (
  <div className={cx("bg-[#1c1c1c] p-4 border-l-4", borderColor)}>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
      <div>
        <span className="font-bold text-white">{vlan}</span>
        <br />
        <span className="text-sm text-gray-500">{name}</span>
      </div>
      <div>
        <span className="font-semibold text-gray-300">{subnet}</span>
        <br />
        <span className="text-sm text-gray-500">Subnet</span>
      </div>
      <div className="col-span-2">
        <p className="text-sm">{description}</p>
      </div>
      <div className="text-right">
        <span className="inline-flex items-center rounded-sm bg-gray-700 px-2 py-1 text-xs font-medium text-gray-300">
          {tag}
        </span>
      </div>
    </div>
  </div>
);

const VlanSchema = () => (
  <Section
    title="Network & VLAN Schema"
    description="This is the master plan for the network segments. It defines the IP addresses, VLAN IDs, and security policies for each virtual network."
  >
    <div className="space-y-4">
      <VlanCard
        vlan="VLAN 10"
        name="HOME_NET"
        subnet="192.168.10.0/24"
        description="For trusted personal devices. Full internet access and limited, policy-based access to specific K3S services."
        tag="Trusted"
        borderColor="border-blue-500"
      />
      <VlanCard
        vlan="VLAN 20"
        name="K3S_CLUSTER"
        subnet="192.168.20.0/24"
        description="No direct internet access by default. Strictly isolated. Inbound access is only allowed from the HOME_NET or Internet via specific firewall rules."
        tag="Isolated"
        borderColor="border-red-500"
      />
      <VlanCard
        vlan="VLAN 88"
        name="MGMT_NET"
        subnet="192.168.88.0/24"
        description="For network device management interfaces only. Highly restricted access, no general internet."
        tag="Management"
        borderColor="border-gray-500"
      />
      <VlanCard
        vlan="VLAN 99"
        name="GUEST_WIFI"
        subnet="192.168.99.0/24"
        description="For untrusted guest devices. Internet access only. Client isolation is enabled."
        tag="Guest"
        borderColor="border-orange-500"
      />
    </div>
  </Section>
);

export default VlanSchema;
