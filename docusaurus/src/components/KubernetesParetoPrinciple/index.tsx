import BareMetalSection from "./BareMetalSection";
import HomeSection from "./HomeSection";
import K3sInternalsSection from "./K3sInternalsSection";
import ProductionChecklistSection from "./ProductionChecklistSection";
import TroubleshootingSection from "./TroubleshootingSection";

export default function App() {
  return (
    <div className="bg-transparent" style={{}}>
      <main className="py-8 md:py-12">
        <HomeSection />
        <TroubleshootingSection />
        <BareMetalSection />
        <K3sInternalsSection />
        <ProductionChecklistSection />
      </main>
    </div>
  );
}
