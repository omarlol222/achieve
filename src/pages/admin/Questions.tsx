import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { SubjectManager } from "@/components/subjects/SubjectManager";
import { TopicManager } from "@/components/topics/TopicManager";
import { SubtopicManager } from "@/components/subtopics/SubtopicManager";
import { QuestionTab } from "@/components/questions/tabs/QuestionTab";

const Questions = () => {
  return (
    <ErrorBoundary>
      <div>
        <Tabs defaultValue="questions">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="subtopics">Subtopics</TabsTrigger>
          </TabsList>

          <TabsContent value="questions">
            <QuestionTab />
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <SubjectManager />
          </TabsContent>

          <TabsContent value="topics" className="mt-6">
            <TopicManager />
          </TabsContent>

          <TabsContent value="subtopics" className="mt-6">
            <SubtopicManager />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};

export default Questions;