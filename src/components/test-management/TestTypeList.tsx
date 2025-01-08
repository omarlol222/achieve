import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TestTypeListProps = {
  testTypes: any[];
  onEdit: (testType: any) => void;
  onDelete: (testType: any) => void;
};

export function TestTypeList({ testTypes, onEdit, onDelete }: TestTypeListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead className="w-24">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {testTypes?.map((testType) => (
          <TableRow key={testType.id}>
            <TableCell>{testType.name}</TableCell>
            <TableCell>{testType.description}</TableCell>
            <TableCell>
              {new Date(testType.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(testType)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(testType)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}