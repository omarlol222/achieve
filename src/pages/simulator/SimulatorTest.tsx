import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { QuestionContent } from "@/components/practice/QuestionContent";
import { TestHeader } from "@/components/simulator/test/TestHeader";
import { TestNavigation } from "@/components/simulator/test/TestNavigation";
import { useTestSession } from "@/components/simulator/test/useTestSession";
import { StartModule } from "@/components/simulator/StartModule";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SimulatorTest() {
  const navigate = useNavigate();
  const {
    questions,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flagged,
    timeLeft,
    loading,
    error,
    handleAnswer,
    handleModuleComplete,
    toggleFlag,
    currentModule,
    hasStarted,
    setHasStarted,
    sessionId,
    isLastModule
  } = useTestSession();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertDescription>No test module found. Please try again later.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!hasStarted) {
    return <StartModule module={currentModule} onStart={() => setHasStarted(true)} />;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const handleComplete = async () => {
    await handleModuleComplete();
    if (isLastModule && sessionId) {
      navigate(`/gat/simulator/results/${sessionId}`);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container py-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          <TestHeader
            moduleName={currentModule.name}
            timeLeft={timeLeft}
            questions={questions}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            flagged={flagged}
            onQuestionSelect={setCurrentQuestionIndex}
          />

          <Progress value={progress} className="h-2" />

          <Card className="p-6">
            {currentQuestion && (
              <QuestionContent
                question={currentQuestion}
                selectedAnswer={answers[currentQuestion.id] || null}
                showFeedback={false}
                onAnswerSelect={(answer) => handleAnswer(currentQuestion.id, answer)}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
              />
            )}
          </Card>

          <TestNavigation
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            flagged={flagged}
            onPrevious={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
            onFlag={() => currentQuestion && toggleFlag(currentQuestion.id)}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </div>
  );
}