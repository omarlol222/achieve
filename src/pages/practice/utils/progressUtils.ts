import { supabase } from "@/integrations/supabase/client";

export const handleQuestionProgress = async (topicId: string, isCorrect: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // First, check if there's existing progress for this topic
  const { data: existingProgress, error: progressError } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("topic_id", topicId)
    .maybeSingle();

  if (progressError) throw progressError;

  const now = new Date().toISOString();

  if (existingProgress) {
    // Calculate new values for questions attempted and correct
    const totalQuestions = existingProgress.questions_attempted + 1;
    const correctQuestions = existingProgress.questions_correct + (isCorrect ? 1 : 0);
    
    // Calculate percentage change in performance
    const oldPercentage = existingProgress.questions_attempted > 0
      ? (existingProgress.questions_correct / existingProgress.questions_attempted) * 100
      : 0;
    
    const newPercentage = (correctQuestions / totalQuestions) * 100;
    const percentageChange = newPercentage - oldPercentage;
    
    // Calculate points adjustment based on percentage change
    let pointsAdjustment = 0;
    
    // Handle percentage decrease
    if (percentageChange < 0) {
      const decreaseSteps = Math.floor(Math.abs(percentageChange) / 10);
      pointsAdjustment = -5 * decreaseSteps;
    }
    // Handle percentage increase
    else if (percentageChange > 0) {
      const increaseSteps = Math.floor(percentageChange / 10);
      pointsAdjustment = 10 * increaseSteps;
    }
    
    // Add base points for correct/incorrect answer
    pointsAdjustment += isCorrect ? 50 : -30;
    
    // Calculate new points value, ensuring it stays within 0-1000 range
    const newPoints = Math.max(0, Math.min(1000, existingProgress.points + pointsAdjustment));

    // Update existing progress
    const { error: updateError } = await supabase
      .from("user_progress")
      .update({
        questions_attempted: totalQuestions,
        questions_correct: correctQuestions,
        points: newPoints,
        last_activity: now
      })
      .eq("id", existingProgress.id);

    if (updateError) throw updateError;
  } else {
    // Create new progress entry with initial points
    const initialPoints = isCorrect ? 50 : 0;
    
    const { error: insertError } = await supabase
      .from("user_progress")
      .insert({
        user_id: user.id,
        topic_id: topicId,
        questions_attempted: 1,
        questions_correct: isCorrect ? 1 : 0,
        points: initialPoints,
        last_activity: now
      });

    if (insertError) throw insertError;
  }
};