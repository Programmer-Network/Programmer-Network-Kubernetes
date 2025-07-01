import { useState } from "react";
import { contentData } from "../content";
import TabButton from "./TabButton";
import TabContent from "./TabContent";

const tabs = [
  { id: "crashloop", label: "CrashLoopBackOff" },
  { id: "imagepull", label: "ImagePullBackOff" },
  { id: "pending", label: "Pending" },
];

const tabContentDetails = {
  crashloop: {
    title: "Diagnosing `CrashLoopBackOff`",
    description: `The container starts, but exits with an error almost immediately. Kubernetes tries to restart it, creating a "crash loop." The problem is almost always inside your application or its configuration.`,
  },
  imagepull: {
    title: "Diagnosing `ImagePullBackOff`",
    description: `The Kubelet on a node cannot pull the container image from the registry. The container will never start until this is resolved.`,
  },
  pending: {
    title: "Diagnosing `Pending` Pods",
    description: `The pod has been accepted by the cluster, but the scheduler cannot find a suitable node to run it on. This is a resource or placement constraint issue.`,
  },
};

const TroubleshootingSection = () => {
  const [openTab, setOpenTab] = useState("crashloop");

  return (
    <section id="troubleshooting" className="mb-16 md:mb-24 scroll-mt-20">
      <div className="text-center mb-12">
        <h2 className="font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Universal Kubernetes Annoyances
        </h2>
        <p className="mt-4">
          A huge amount of time is wasted on a few common pod errors. This
          interactive troubleshooter helps you diagnose the root cause quickly
          by treating the symptom to find the disease.
        </p>
      </div>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6">
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              label={tab.label}
              isActive={openTab === tab.id}
              onClick={() => setOpenTab(tab.id)}
            />
          ))}
        </div>

        {openTab in tabContentDetails && (
          <TabContent
            title={tabContentDetails[openTab].title}
            description={tabContentDetails[openTab].description}
            items={contentData.troubleshooting[openTab]}
          />
        )}
      </div>
    </section>
  );
};

export default TroubleshootingSection;
