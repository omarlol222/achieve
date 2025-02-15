
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

    let totalSelectedQuestions = 0;
    let selectedQuestions = [];

    // Select questions per topic based on exact question_count
    for (const topicConfig of moduleTopics) {
      console.log(`Processing topic ${topicConfig.topic_id}, needs ${topicConfig.question_count} questions`);
      
      const topicQuestions = await getTopicQuestions(
        currentModule.id,
        currentModule.test_type_id,
        currentModule.subject_id,
        topicConfig.topic_id
      );

      if (!topicQuestions.length) {
        console.warn(`No questions available for topic ${topicConfig.topic_id}, skipping`);
        continue;
      }

      // Select exactly question_count questions for this topic
      const questionsToSelect = Math.min(topicConfig.question_count, topicQuestions.length);
      const shuffledQuestions = [...topicQuestions].sort(() => 0.5 - Math.random());
      const topicSelectedQuestions = shuffledQuestions.slice(0, questionsToSelect);

      console.log(`Selected ${topicSelectedQuestions.length} questions for topic ${topicConfig.topic_id}`);
      selectedQuestions = [...selectedQuestions, ...topicSelectedQuestions];
      totalSelectedQuestions += topicSelectedQuestions.length;
    }

    // Insert all selected questions
    console.log(`Total questions selected: ${selectedQuestions.length}`);
    for (const question of selectedQuestions) {
      await insertModuleQuestion(currentModule.id, question.id);
    }

    const finalQuestions = await getFinalModuleQuestions(currentModule.id);
    console.log(`Final question count: ${finalQuestions.length}`);

    if (finalQuestions.length === 0) {
      throw new Error("No questions could be selected for this module");
    }

    if (finalQuestions.length < currentModule.total_questions) {
      console.warn(
        `Warning: Could only find ${finalQuestions.length} questions ` +
        `out of ${currentModule.total_questions} requested for module ${currentModule.name}`
      );
    }

    return finalQuestions;
  } catch (error: any) {
    onError(error.message);
    return [];
  }
}
