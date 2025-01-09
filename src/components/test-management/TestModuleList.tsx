import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

type TestModuleListProps = {
  modules: any[];
  onEdit: (module: any) => void;
  onDelete: (module: any) => void;
};

export function TestModuleList({ modules, onEdit, onDelete }: TestModuleListProps) {
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
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {modules?.map((module) => (
          <TableRow key={module.id}>
            <TableCell>
              <Accordion type="single" collapsible>
                <AccordionItem value={module.id}>
                  <AccordionTrigger>{module.name}</AccordionTrigger>
                  <AccordionContent>
                    <div className="mt-2 space-y-2">
                      <h4 className="font-medium">Topic Percentages:</h4>
                      <ul className="list-disc list-inside">
                        {module.module_topics?.map((topic: any) => (
                          <li key={topic.id}>
                            {topic.topics?.name}: {topic.percentage}%
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TableCell>
            <TableCell>{module.description}</TableCell>
            <TableCell>{module.subjects?.name}</TableCell>
            <TableCell>{module.test_templates?.name}</TableCell>
            <TableCell>{module.test_types?.name}</TableCell>
            <TableCell>{module.time_limit}</TableCell>
            <TableCell>
              {new Date(module.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(module)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(module)}
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