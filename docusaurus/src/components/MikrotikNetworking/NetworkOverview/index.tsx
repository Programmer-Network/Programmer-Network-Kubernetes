import Section from "../Section";
import { cx } from "../utils";

const DiagramBox = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cx(
      "border-2 border-gray-800 p-4 text-center transition-colors hover:border-[#ffab00] rounded-lg",
      className
    )}
  >
    {children}
  </div>
);

const NetworkOverview = () => (
  <Section title="Network Architecture Overview">
    <p>
      As you may have noticed in the Hardware section, I'm a big fan of
      Mikrotik. I've been using them for years and they've always been reliable.
      If you would ask me besides that why, I couldn't tell you. I just like
      them.
    </p>
    <div>
      <div className="flex flex-col items-center space-y-4">
        <DiagramBox>
          <h3 className="font-bold text-white !mb-0">☁️ Internet</h3>
        </DiagramBox>
        <div className="w-px h-8 bg-gray-700"></div>
        <DiagramBox>
          <h3 className="font-bold text-white !mb-0">
            RB3011 Router (The Brain)
          </h3>
          <p className="text-sm !mb-0">Inter-VLAN Routing & Firewall</p>
        </DiagramBox>
        <div className="w-full text-center text-sm font-semibold text-[#ffab00]">
          VLAN Trunk (Single Cable)
          <div className="w-px h-8 bg-[#ffab00]/50 mx-auto border-l-2 border-dashed border-[#ffab00]/50"></div>
        </div>
        <DiagramBox>
          <h3 className="font-bold text-white !mb-0">
            CRS326 Switch (The Muscle)
          </h3>
          <p className="text-sm !mb-0">High-Speed Layer 2 Switching</p>
        </DiagramBox>
        <div className="w-full h-px bg-gray-800 my-4"></div>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-2 text-red-400">
              VLAN 20: K3S Cluster
            </h4>
            <div className="w-px h-4 bg-red-700"></div>
            <DiagramBox className="w-full hover:border-red-500">
              <p className="font-bold text-white !mb-0">K3S Nodes</p>
              <p className="text-sm !mb-0">(RPis, Mini PCs)</p>
            </DiagramBox>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-2 text-blue-400">
              VLAN 10: Home Network
            </h4>
            <div className="w-px h-4 bg-blue-700"></div>
            <DiagramBox className="w-full hover:border-blue-500">
              <p className="font-bold text-white !mb-0">PCs & Laptops</p>
              <p className="text-sm !mb-0">(Wired)</p>
            </DiagramBox>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="font-semibold mb-2 text-orange-400">
              Wireless Networks
            </h4>
            <div className="w-px h-4 bg-orange-700"></div>
            <DiagramBox className="w-full hover:border-orange-500">
              <h3 className="font-bold text-white !mb-0">RB2011 AP</h3>
              <p className="text-sm text-blue-400 !mb-0">
                SSID: Home (VLAN 10)
              </p>
              <p className="text-sm text-orange-400 !mb-0">
                SSID: Guest (VLAN 99)
              </p>
            </DiagramBox>
          </div>
        </div>
      </div>
    </div>
  </Section>
);

export default NetworkOverview;
