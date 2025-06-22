import HomeSectionCard from "./HomeSectionCard";

const cardData = [
  {
    href: "#troubleshooting",
    title: "Decode Pod Errors",
    description:
      "Quickly diagnose `CrashLoopBackOff`, `ImagePullBackOff`, and `Pending` states.",
  },
  {
    href: "#bare-metal",
    title: "Tame Networking & Storage",
    description:
      "Navigate the biggest bare-metal challenges: load balancing and persistent data.",
  },
  {
    href: "#production",
    title: "Go to Production",
    description:
      "Follow an actionable checklist for security, monitoring, and backups.",
  },
];

const HomeSection = () => (
  <section id="home" className="text-center mb-16 md:mb-24 mt-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
      {cardData.map(card => (
        <HomeSectionCard
          key={card.href}
          href={card.href}
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  </section>
);

export default HomeSection;
