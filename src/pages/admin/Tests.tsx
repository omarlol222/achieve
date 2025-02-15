
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModulesTab } from "@/components/test-management/ModulesTab";
import { TypesTab } from "@/components/test-management/TypesTab";
import { useTestData } from "@/hooks/questions/useTestData";

const Tests = () => {
  const { testTypes, subjects, modules } = useTestData();

  return (
    <div className="container mx-auto py-8">
      <Tabs defaultValue="modules">
        <TabsList>
          <TabsTrigger value="modules">Test Modules</TabsTrigger>
          <TabsTrigger value="types">Test Types</TabsTrigger>
        </TabsList>

        <TabsContent value="modules" className="mt-6">
          <ModulesTab 
            modules={modules || []} 
            subjects={subjects || []} 
            testTypes={testTypes || []}
          />
        </TabsContent>

        <TabsContent value="types" className="mt-6">
          <TypesTab testTypes={testTypes || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tests;
