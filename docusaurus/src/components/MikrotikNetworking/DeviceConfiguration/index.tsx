import { useState } from "react";
import Accordion from "../Accordion";
import { deviceConfigData } from "../data";
import Section from "../Section";
import { cx } from "../utils";

const DeviceConfiguration = () => {
  const [activeTab, setActiveTab] =
    useState<keyof typeof deviceConfigData>("rb3011");
  const activeDevice = deviceConfigData[activeTab];

  return (
    <Section description="In this section, we will walk through the configuration for each device. It is best to start with a factory reset device.">
      <div className="border-b border-gray-800 mb-6">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          {Object.keys(deviceConfigData).map(key => (
            <button
              key={key}
              onClick={() => setActiveTab(key as keyof typeof deviceConfigData)}
              className={cx(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === key
                  ? "border-[#ffab00] text-[#ffab00]"
                  : "border-transparent hover:text-gray-200 hover:border-gray-500"
              )}
            >
              {deviceConfigData[key as keyof typeof deviceConfigData].title}
            </button>
          ))}
        </nav>
      </div>
      <Accordion items={activeDevice.steps} />
    </Section>
  );
};

export default DeviceConfiguration;
