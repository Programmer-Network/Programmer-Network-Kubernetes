import CodeBlock from "@theme/CodeBlock";

type ListItemProps = {
  item: {
    title?: string;
    text: string;
  };
};

const ListItem = ({ item }: ListItemProps) => {
  return (
    <li>
      {item.title && <strong>{item.title} </strong>}
      {item.text}
    </li>
  );
};

export type ContentItem =
  | { type: "paragraph"; text: string; title?: string }
  | { type: "code"; code: string }
  | {
      type: "list" | "ordered-list";
      items: { title?: string; text: string }[];
    };

type ContentRendererProps = {
  content: ContentItem[];
};

const ContentRenderer = ({ content }: ContentRendererProps) => {
  return (
    <>
      {content.map((item, index) => {
        if (item.type === "paragraph") {
          return (
            <p key={index} className="my-4">
              {item.title && <strong>{item.title} </strong>}
              {item.text}
            </p>
          );
        }
        if (item.type === "code") {
          return (
            <div key={index} className="my-4">
              <CodeBlock language="bash">{item.code}</CodeBlock>
            </div>
          );
        }
        if (item.type === "list") {
          return (
            <ul key={index} className="space-y-4 list-disc list-inside my-4">
              {item.items.map((listItem, i) => (
                <ListItem key={i} item={listItem} />
              ))}
            </ul>
          );
        }
        if (item.type === "ordered-list") {
          return (
            <ol key={index} className="space-y-2 list-decimal list-inside my-4">
              {item.items.map((listItem, i) => (
                <ListItem key={i} item={listItem} />
              ))}
            </ol>
          );
        }
        return null;
      })}
    </>
  );
};

export default ContentRenderer;
