import { Input } from "@/components/ui/input";

type SearchFieldProps = {
  search: string;
  setSearch: (value: string) => void;
};

export function SearchField({ search, setSearch }: SearchFieldProps) {
  return (
    <div className="md:col-span-2">
      <Input
        placeholder="Search questions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full"
      />
    </div>
  );
}