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
    const newQuestionsAttempted = (existingProgress.questions_attempted || 0) + 1;
    const newQuestionsCorrect = (existingProgress.questions_correct || 0) + (isCorrect ? 1 : 0);
    
    // Calculate percentage change in performance
    const oldPercentage = existingProgress.questions_attempted > 0
      ? (existingProgress.questions_correct / existingProgress.questions_attempted) * 100
      : 0;
    
    const newPercentage = (newQuestionsCorrect / newQuestionsAttempted) * 100;
    const percentageChange = newPercentage - oldPercentage;
    
    // Calculate points adjustment based on percentage change
    let pointsAdjustment = 0;
    
    if (isCorrect) {
      // For correct answers, award points based on current performance trend
      if (percentageChange >= 0) {
        // Improving or maintaining performance
        pointsAdjustment = 20; // Base points for correct answer
        if (percentageChange > 5) {
          pointsAdjustment += 10; // Bonus for significant improvement
        }
      } else {
        // Still correct but overall performance dropping
        pointsAdjustment = 15;
      }
    } else {
      // For incorrect answers, deduct points based on performance impact
      pointsAdjustment = -10; // Base deduction for wrong answer
      if (percentageChange < -5) {
        pointsAdjustment -= 5; // Additional deduction for significant drop
      }
    }
    
    // Calculate new points value, ensuring it stays within 0-1000 range
    const newPoints = Math.max(0, Math.min(1000, existingProgress.points + pointsAdjustment));

    // Update existing progress
    const { error: updateError } = await supabase
      .from("user_progress")
      .update({
        questions_attempted: newQuestionsAttempted,
        questions_correct: newQuestionsCorrect,
        points: newPoints,
        last_activity: now
      })
      .eq("id", existingProgress.id);

    if (updateError) throw updateError;

    return { 
      success: true, 
      pointsChange: pointsAdjustment 
    };
  } else {
    // Create new progress entry
    const initialPoints = isCorrect ? 20 : 0; // Award 20 points for first correct answer
    
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

    return { 
      success: true, 
      pointsChange: initialPoints 
    };
  }
};