import { TestSimulator } from "@/components/test-management/TestSimulator";
import { TestTypeList } from "@/components/test-management/TestTypeList";
import { TestModuleList } from "@/components/test-management/TestModuleList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

export default function Tests() {
  const { toast } = useToast();

  const handleViewQuestions = (moduleId: string) => {
    // This will be implemented later when we add the questions view
    toast({
      title: "Coming Soon",
      description: "Question view functionality will be implemented soon.",
    });
  };

  // Sample data for demonstration
  const sampleModules = [
    { id: "1", name: "MODULE 1", totalQuestions: 30, mistakes: 5 },
    { id: "2", name: "MODULE 2", totalQuestions: 25, mistakes: 3 },
    { id: "3", name: "MODULE 3", totalQuestions: 35, mistakes: 7 },
    { id: "4", name: "MODULE 4", totalQuestions: 28, mistakes: 4 },
  ];

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList>
          <TabsTrigger value="simulator">Test Simulator</TabsTrigger>
          <TabsTrigger value="types">Test Types</TabsTrigger>
          <TabsTrigger value="modules">Test Modules</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <TestSimulator
            quantitativeScore={75}
            verbalScore={82}
            totalScore={78}
            testDate={new Date()}
            modules={sampleModules}
            onViewQuestions={handleViewQuestions}
          />
        </TabsContent>

        <TabsContent value="types">
          <TestTypeList />
        </TabsContent>

        <TabsContent value="modules">
          <TestModuleList />
        </TabsContent>
      </Tabs>
    </div>
  );
}