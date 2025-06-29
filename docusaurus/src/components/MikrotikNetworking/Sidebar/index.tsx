import { cx } from "../utils";

interface SidebarProps {
  activeSection: string;
  setActiveSection: (id: string) => void;
}

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const navItems = [
    { id: "overview", label: "Network Overview", icon: "🌐" },
    { id: "concepts", label: "Core Concepts", icon: "💡" },
    { id: "schema", label: "VLAN Schema", icon: "📋" },
    { id: "config", label: "Device Configuration", icon: "⚙️" },
    { id: "firewall", label: "Firewall Logic", icon: "🛡️" },
    { id: "scenarios", label: "Common Scenarios", icon: "🔧" },
    { id: "summary", label: "Summary & Checklist", icon: "✅" },
  ];

  return (
    <aside className="w-64 bg-black/30 border-r border-gray-800 flex-shrink-0 hidden md:block">
      <div className="p-6">
        <h1 className="text-xl font-bold">Network Plan</h1>
        <p className="text-sm">Secure K3S Homelab</p>
      </div>
      <nav className="mt-4 flex flex-col space-y-1 px-4">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveSection(item.id);
            }}
            className={cx(
              "flex items-center px-4 py-2 text-sm transition-colors",
              activeSection === item.id ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
