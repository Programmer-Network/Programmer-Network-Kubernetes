import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  description: string;
  children: ReactNode;
}

const Section = ({ title, description, children }: SectionProps) => (
  <div className="mb-12" id={title?.toLowerCase().replace(/[^a-z0-9]/g, "-")}>
    {" "}
    {/* anchor for sidebar links */}
    {title && <h2 className="text-3xl font-bold text-white mb-2">{title}</h2>}
    {description && <p className="mb-8">{description}</p>}
    {children}
  </div>
);

export default Section;
