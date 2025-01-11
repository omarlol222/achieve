import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { QuestionDialog } from "@/components/questions/QuestionDialog";
import { QuestionFilters } from "@/components/questions/QuestionFilters";
import { QuestionList } from "@/components/questions/QuestionList";
import { QuestionPagination } from "@/components/questions/QuestionPagination";
import { DeleteQuestionDialog } from "@/components/questions/DeleteQuestionDialog";
import { QuestionHeader } from "@/components/questions/QuestionHeader";
import { SubjectManager } from "@/components/subjects/SubjectManager";
import { TopicManager } from "@/components/topics/TopicManager";
import { useQuestions } from "@/hooks/useQuestions";
import { useQuestionDialog } from "@/hooks/questions/useQuestionDialog";
import { useQuestionFilters } from "@/hooks/questions/useQuestionFilters";
import { useQueryClient } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 10;

const Questions = () => {
  const queryClient = useQueryClient();
  
  const {
    filters,
    setters,
  } = useQuestionFilters();

  const {
    dialogOpen,
    setDialogOpen,
    selectedQuestion,
    setSelectedQuestion,
    deleteDialogOpen,
    setDeleteDialogOpen,
    questionToDelete,
    setQuestionToDelete,
    handleDelete,
  } = useQuestionDialog();

  const { subjects, topics, questionsData, isLoading, testTypes } = useQuestions(
    filters.search,
    filters.subjectFilter,
    filters.topicFilter,
    filters.difficultyFilter,
    filters.typeFilter,
    filters.testTypeFilter,
    filters.currentPage,
    ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil((questionsData?.total || 0) / ITEMS_PER_PAGE);

  return (
    <ErrorBoundary>
      <div>
        <Tabs defaultValue="questions">
          <TabsList>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-6">
            <QuestionHeader
              onAddClick={() => {
                setSelectedQuestion(null);
                setDialogOpen(true);
              }}
            />

            <QuestionFilters
              search={filters.search}
              setSearch={setters.setSearch}
              subjectFilter={filters.subjectFilter}
              setSubjectFilter={setters.setSubjectFilter}
              topicFilter={filters.topicFilter}
              setTopicFilter={setters.setTopicFilter}
              difficultyFilter={filters.difficultyFilter}
              setDifficultyFilter={setters.setDifficultyFilter}
              typeFilter={filters.typeFilter}
              setTypeFilter={setters.setTypeFilter}
              testTypeFilter={filters.testTypeFilter}
              setTestTypeFilter={setters.setTestTypeFilter}
              subjects={subjects || []}
              topics={topics || []}
              testTypes={testTypes || []}
            />

            <QuestionList
              questions={questionsData?.questions || []}
              isLoading={isLoading}
              onEdit={(question) => {
                setSelectedQuestion(question);
                setDialogOpen(true);
              }}
              onDelete={(question) => {
                setQuestionToDelete(question);
                setDeleteDialogOpen(true);
              }}
            />

            <QuestionPagination
              currentPage={filters.currentPage}
              totalPages={totalPages}
              onPageChange={setters.setCurrentPage}
            />
          </TabsContent>

          <TabsContent value="subjects" className="mt-6">
            <SubjectManager />
          </TabsContent>

          <TabsContent value="topics" className="mt-6">
            <TopicManager />
          </TabsContent>
        </Tabs>

        <QuestionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          initialData={selectedQuestion}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["questions"] });
          }}
        />

        <DeleteQuestionDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDelete}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Questions;