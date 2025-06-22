const HomeSectionCard = ({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) => (
  <a
    href={href}
    className="p-6 rounded-lg border border-slate-200 dark:border-slate-700 text-left"
  >
    <h3 className="font-semibold text-[#ffab00">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
  </a>
);

export default HomeSectionCard;
