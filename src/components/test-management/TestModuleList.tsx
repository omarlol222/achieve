import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TestModuleListProps = {
  modules: any[];
};

export function TestModuleList({ modules }: TestModuleListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Template</TableHead>
          <TableHead>Test Type</TableHead>
          <TableHead>Time Limit (min)</TableHead>
          <TableHead>Created At</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modules?.map((module) => (
          <TableRow key={module.id}>
            <TableCell>{module.name}</TableCell>
            <TableCell>{module.description}</TableCell>
            <TableCell>{module.subjects?.name}</TableCell>
            <TableCell>{module.test_templates?.name}</TableCell>
            <TableCell>{module.test_types?.name}</TableCell>
            <TableCell>{module.time_limit}</TableCell>
            <TableCell>
              {new Date(module.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}