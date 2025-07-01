import React from "react";

interface DiagramBoxProps {
  children: React.ReactNode;
  className?: string;
}

const DiagramBox: React.FC<DiagramBoxProps> = ({
  children,
  className = "",
}) => (
  <div className={`border border-gray-700 rounded-lg p-4 ${className}`}>
    {children}
  </div>
);

const DataCenterOverview = () => (
  <div className="my-8">
    <div className="flex flex-col items-center space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Hardware Setup */}
        <div className="flex flex-col items-center space-y-4">
          <h4 className="font-semibold text-blue-400">1. Hardware Setup</h4>
          <DiagramBox className="w-full hover:border-blue-500">
            <p className="font-bold !mb-2">🛠️ Physical Infrastructure</p>
            <ul className="space-y-2 !mb-0">
              <li>📦 Server Rack</li>
              <li>🍓 Raspberry Pi Cluster</li>
              <li>💻 Mini PCs</li>
              <li>🔌 Power Management</li>
            </ul>
          </DiagramBox>
        </div>

        {/* Network Setup */}
        <div className="flex flex-col items-center space-y-4">
          <h4 className="font-semibold text-green-400">2. Network Setup</h4>
          <DiagramBox className="w-full hover:border-green-500">
            <p className="font-bold !mb-2">🌐 Network Infrastructure</p>
            <ul className="space-y-2 !mb-0">
              <li>📡 Mikrotik Router</li>
              <li>🔄 Managed Switch</li>
              <li>🔒 VLANs & Security</li>
              <li>🌍 DNS & Load Balancing</li>
            </ul>
          </DiagramBox>
        </div>

        {/* K3s Setup */}
        <div className="flex flex-col items-center space-y-4">
          <h4 className="font-semibold text-purple-400">3. K3s Setup</h4>
          <DiagramBox className="w-full hover:border-purple-500">
            <p className="font-bold !mb-2">☸️ Kubernetes Layer</p>
            <ul className="space-y-2 !mb-0">
              <li>🎮 Control Plane</li>
              <li>👷 Worker Nodes</li>
              <li>💾 Storage (Longhorn)</li>
              <li>🔍 Monitoring</li>
            </ul>
          </DiagramBox>
        </div>
        {/* K3s Setup */}
        <div className="flex flex-col items-center space-y-4">
          <h4 className="font-semibold text-yellow-400">
            4. Applications & Services
          </h4>
          <DiagramBox className="w-full hover:border-yellow-500">
            <p className="font-bold !mb-2">🚀 Applications & Services</p>
            <ul className="space-y-2 !mb-0">
              <li>🗄️ Databases - PostgreSQL, Redis</li>
              <li>🚪 Ingress - Traefik</li>
              <li>📊 Monitoring - Prometheus, Grafana</li>
              <li>🚀 Apps - Your Services</li>
            </ul>
          </DiagramBox>
        </div>
      </div>
    </div>
  </div>
);

export default DataCenterOverview;
