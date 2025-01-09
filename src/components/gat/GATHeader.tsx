type GATHeaderProps = {
  title: string;
};

export const GATHeader = ({ title }: GATHeaderProps) => (
  <div className="flex items-center justify-between">
    <h1 className="text-3xl font-bold">{title}</h1>
  </div>
);