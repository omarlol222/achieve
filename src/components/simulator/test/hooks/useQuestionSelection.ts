
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
    console.log(`Selecting questions for module ${currentModule.id} (index: ${currentModuleIndex})`);

    // Clear existing questions for this module
    await clearModuleQuestions(currentModule.id);
    console.log(`Cleared existing questions for module ${currentModule.id}`);

    // Process each topic in the module
    for (const topicConfig of currentModule.module_topics || []) {
      const topicQuestions = await getTopicQuestions(
        currentModule.id,
        currentModule.test_type_id,
        currentModule.subject_id,
        topicConfig.topic_id
      );

      if (topicQuestions.length < topicConfig.question_count) {
        console.warn(
          `Warning: Topic ${topicConfig.topic_id} has only ${topicQuestions.length} ` +
          `questions available, but ${topicConfig.question_count} were requested`
        );
      }

      // Select random questions up to the requested count
      const shuffledQuestions = [...topicQuestions].sort(() => Math.random() - 0.5);
      const selectedCount = Math.min(topicConfig.question_count, shuffledQuestions.length);
      
      console.log(`Selecting ${selectedCount} questions for topic ${topicConfig.topic_id}`);
      
      // Insert selected questions
      for (let i = 0; i < selectedCount; i++) {
        await insertModuleQuestion(currentModule.id, shuffledQuestions[i].id);
      }
    }

    // Get final questions for the module
    const finalQuestions = await getFinalModuleQuestions(currentModule.id);
    console.log(`Final question count for module ${currentModule.id}: ${finalQuestions.length}`);

    if (finalQuestions.length === 0) {
      throw new Error("No questions could be selected for this module");
    }

    return finalQuestions;

  } catch (error: any) {
    console.error("Error selecting module questions:", error);
    onError(error.message);
    return [];
  }
}
