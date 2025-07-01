const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="flex space-x-4 border-b">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`py-2 px-4 font-medium ${
            activeTab === tab.id
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
