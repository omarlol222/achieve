import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionDialog } from "@/components/questions/QuestionDialog";
import { QuestionFilters } from "@/components/questions/QuestionFilters";
import { QuestionList } from "@/components/questions/QuestionList";
import { QuestionPagination } from "@/components/questions/QuestionPagination";

const ITEMS_PER_PAGE = 10;

const Questions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);

  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*, subject:subjects(name)")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["questions", search, subjectFilter, topicFilter, difficultyFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select(
          `
          *,
          topic:topics(
            name,
            subject:subjects(
              name
            )
          )
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("question_text", `%${search}%`);
      }

      if (topicFilter && topicFilter !== "all") {
        query = query.eq("topic_id", topicFilter);
      } else if (subjectFilter && subjectFilter !== "all") {
        const filteredTopicIds = topics
          ?.filter((topic) => topic.subject_id === subjectFilter)
          .map((topic) => topic.id);
        query = query.in("topic_id", filteredTopicIds);
      }

      if (difficultyFilter && difficultyFilter !== "all") {
        query = query.eq("difficulty", parseInt(difficultyFilter));
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      return {
        questions: data,
        total: count || 0,
      };
    },
  });

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
        <Button
          onClick={() => {
            setSelectedQuestion(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <QuestionFilters
        search={search}
        setSearch={setSearch}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        topicFilter={topicFilter}
        setTopicFilter={setTopicFilter}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={setDifficultyFilter}
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

      <QuestionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={selectedQuestion}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["questions"] });
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              question.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Questions;