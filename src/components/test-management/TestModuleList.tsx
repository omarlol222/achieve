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
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}