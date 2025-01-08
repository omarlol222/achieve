import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionDialog } from "@/components/questions/QuestionDialog";
import { QuestionFilters } from "@/components/questions/QuestionFilters";
import { QuestionList } from "@/components/questions/QuestionList";
import { QuestionPagination } from "@/components/questions/QuestionPagination";
import { DeleteQuestionDialog } from "@/components/questions/DeleteQuestionDialog";
import { QuestionHeader } from "@/components/questions/QuestionHeader";
import { SubjectManager } from "@/components/subjects/SubjectManager";
import { useQuestions } from "@/hooks/useQuestions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 10;

const Questions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);

  const { subjects, topics, questionsData, isLoading } = useQuestions(
    search,
    subjectFilter,
    topicFilter,
    difficultyFilter,
    typeFilter,
    currentPage,
    ITEMS_PER_PAGE
  );

  const handleDelete = async () => {
    if (!questionToDelete) return;

    try {
      const { error } = await supabase
        .from("questions")
        .delete()
        .eq("id", questionToDelete.id);

      if (error) throw error;

      toast({
        title: "Question deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["questions"] });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting question",
        description: error.message,
      });
    } finally {
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  const totalPages = Math.ceil((questionsData?.total || 0) / ITEMS_PER_PAGE);

  return (
    <div>
      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="subjects">Subjects & Topics</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="mt-6">
          <QuestionHeader
            onAddClick={() => {
              setSelectedQuestion(null);
              setDialogOpen(true);
            }}
          />

          <QuestionFilters
            search={search}
            setSearch={setSearch}
            subjectFilter={subjectFilter}
            setSubjectFilter={setSubjectFilter}
            topicFilter={topicFilter}
            setTopicFilter={setTopicFilter}
            difficultyFilter={difficultyFilter}
            setDifficultyFilter={setDifficultyFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            subjects={subjects || []}
            topics={topics || []}
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
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </TabsContent>

        <TabsContent value="subjects" className="mt-6">
          <SubjectManager />
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
  );
};

export default Questions;