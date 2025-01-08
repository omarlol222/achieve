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
    .single();

  if (progressError && progressError.code !== 'PGRST116') {
    throw progressError;
  }

  const now = new Date().toISOString();

  if (existingProgress) {
    // Update existing progress
    const { error: updateError } = await supabase
      .from("user_progress")
      .update({
        questions_attempted: existingProgress.questions_attempted + 1,
        questions_correct: existingProgress.questions_correct + (isCorrect ? 1 : 0),
        last_activity: now,
        updated_at: now
      })
      .eq("id", existingProgress.id);

    if (updateError) throw updateError;
  } else {
    // Create new progress entry
    const { error: insertError } = await supabase
      .from("user_progress")
      .insert({
        user_id: user.id,
        topic_id: topicId,
        questions_attempted: 1,
        questions_correct: isCorrect ? 1 : 0,
        last_activity: now,
        created_at: now,
        updated_at: now
      });

    if (insertError) throw insertError;
  }
};