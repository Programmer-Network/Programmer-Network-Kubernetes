import { useState } from "react";
import CoreConcepts from "./CoreConcepts";
import DeviceConfiguration from "./DeviceConfiguration";
import FirewallLogic from "./FirewallLogic";
import NetworkOverview from "./NetworkOverview";
import Scenarios from "./Scenarios";
import Sidebar from "./Sidebar";
import Summary from "./Summary";
import VlanSchema from "./VlanSchema";

export default function MikrotikNetworkingApp() {
  const [activeSection, setActiveSection] = useState("overview");

  const sections: Record<string, React.ReactElement> = {
    overview: <NetworkOverview />,
    concepts: <CoreConcepts />,
    schema: <VlanSchema />,
    config: <DeviceConfiguration />,
    firewall: <FirewallLogic />,
    scenarios: <Scenarios />,
    summary: <Summary />,
  };

  return (
    <div className="bg-[#0b0b0b] text-gray-300 min-h-screen font-sans">
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {sections[activeSection]}
        </main>
      </div>
    </div>
  );
}
