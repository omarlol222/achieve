
import { useToast } from "@/hooks/use-toast";
import { getModuleByIndex } from "../utils/moduleOperations";
import { 
  clearModuleQuestions, 
  getTopicQuestions, 
  insertModuleQuestion,
  getFinalModuleQuestions
} from "../utils/questionOperations";

export async function selectModuleQuestions(
  currentModuleIndex: number, 
  onError: (message: string) => void
) {
  try {
    const currentModule = await getModuleByIndex(currentModuleIndex);
    console.log("Current module:", {
      id: currentModule.id,
      name: currentModule.name,
      subject: currentModule.subject?.name,
      subjectId: currentModule.subject_id,
      topicsCount: currentModule.module_topics?.length,
      totalQuestions: currentModule.total_questions
    });

    const moduleTopics = currentModule.module_topics || [];
    if (!moduleTopics.length) {
      throw new Error("No topics configured for this module");
    }

    await clearModuleQuestions(currentModule.id);

    // Process each topic according to its configuration
    for (const topicConfig of moduleTopics) {
      const topicQuestions = await getTopicQuestions(
        currentModule.id,
        currentModule.test_type_id,
        currentModule.subject_id,
        topicConfig.topic_id
      );

      if (!topicQuestions.length) {
        console.warn(`No questions available for topic ${topicConfig.topic_id}`);
        continue;
      }

      console.log(`Found ${topicQuestions.length} questions for topic ${topicConfig.topic_id}, selecting ${topicConfig.question_count}`);

      // Select random questions based on the configured question count
      const selectedQuestions = [...topicQuestions]
        .sort(() => 0.5 - Math.random())
        .slice(0, topicConfig.question_count);

      // Insert selected questions
      for (const question of selectedQuestions) {
        await insertModuleQuestion(currentModule.id, question.id);
      }
    }

    const finalQuestions = await getFinalModuleQuestions(currentModule.id);
    console.log(`Final question count: ${finalQuestions.length} out of expected ${currentModule.total_questions}`);

    return finalQuestions;
  } catch (error: any) {
    onError(error.message);
    return [];
  }
}
