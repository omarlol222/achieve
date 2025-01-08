import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QuestionDialog } from "@/components/questions/QuestionDialog";

const ITEMS_PER_PAGE = 10;

const Questions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);

  const { data: topics } = useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: questionsData, isLoading } = useQuery({
    queryKey: ["questions", search, topicFilter, difficultyFilter, currentPage],
    queryFn: async () => {
      let query = supabase
        .from("questions")
        .select(
          `
          *,
          topic:topics(name)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false });

      if (search) {
        query = query.ilike("question_text", `%${search}%`);
      }

      if (topicFilter && topicFilter !== "all") {
        query = query.eq("topic_id", topicFilter);
      }

      if (difficultyFilter && difficultyFilter !== "all") {
        query = query.eq("difficulty", parseInt(difficultyFilter));
      }

      // Calculate offset based on current page
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
        <Button onClick={() => {
          setSelectedQuestion(null);
          setDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={topicFilter} onValueChange={setTopicFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Topics</SelectItem>
            {topics?.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Levels</SelectItem>
            {[1, 2, 3, 4, 5].map((level) => (
              <SelectItem key={level} value={String(level)}>
                Level {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  Loading questions...
                </TableCell>
              </TableRow>
            ) : questionsData?.questions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-muted-foreground"
                >
                  No questions found. Add your first question to get started.
                </TableCell>
              </TableRow>
            ) : (
              questionsData?.questions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell className="font-medium">
                    {question.question_text}
                  </TableCell>
                  <TableCell>{question.topic?.name || "Uncategorized"}</TableCell>
                  <TableCell>Level {question.difficulty || "N/A"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedQuestion(question);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setQuestionToDelete(question);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(page);
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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