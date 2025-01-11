import { useQueryClient } from "@tanstack/react-query";
import { QuestionDialog } from "../QuestionDialog";
import { QuestionFilters } from "../QuestionFilters";
import { QuestionList } from "../QuestionList";
import { QuestionPagination } from "../QuestionPagination";
import { DeleteQuestionDialog } from "../DeleteQuestionDialog";
import { QuestionHeader } from "../QuestionHeader";
import { useQuestions } from "@/hooks/useQuestions";
import { useQuestionDialog } from "@/hooks/questions/useQuestionDialog";
import { useQuestionFilters } from "@/hooks/questions/useQuestionFilters";

const ITEMS_PER_PAGE = 10;

export function QuestionTab() {
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
    <div className="mt-6">
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
  );
}