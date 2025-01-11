import { ProtectedGatRoute } from "@/components/auth/ProtectedGatRoute";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LearningSection } from "@/components/gat/LearningSection";
import { ProgressSection } from "@/components/gat/ProgressSection";

const GAT = () => {
  return (
    <ProtectedGatRoute>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">GAT Platform</h1>
        
        <Tabs defaultValue="progress" className="space-y-6">
          <TabsList>
            <TabsTrigger value="progress">My Progress</TabsTrigger>
            <TabsTrigger value="learning">Learning</TabsTrigger>
          </TabsList>

          <TabsContent value="progress">
            <ProgressSection />
          </TabsContent>

          <TabsContent value="learning">
            <LearningSection />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedGatRoute>
  );
};

export default GAT;