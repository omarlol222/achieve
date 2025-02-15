
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
    // Get current module info
    const currentModule = await getModuleByIndex(currentModuleIndex);
    console.log(`Starting question selection for module ${currentModule.id} (index: ${currentModuleIndex})`);

    // Clear existing questions for this specific module
    await clearModuleQuestions(currentModule.id);
    console.log(`Cleared existing questions for module ${currentModule.id}`);

    const moduleQuestions = new Set(); // Track selected question IDs to ensure uniqueness

    // Process each topic in the module
    for (const topicConfig of currentModule.module_topics || []) {
      console.log(`Processing topic ${topicConfig.topic_id} for module ${currentModule.id}`);
      
      const topicQuestions = await getTopicQuestions(
        currentModule.id,
        currentModule.test_type_id,
        currentModule.subject_id,
        topicConfig.topic_id
      );

      // Filter out questions that have already been selected for this module
      const availableQuestions = topicQuestions.filter(q => !moduleQuestions.has(q.id));

      if (availableQuestions.length < topicConfig.question_count) {
        console.warn(
          `Warning: Topic ${topicConfig.topic_id} has only ${availableQuestions.length} ` +
          `unique questions available, but ${topicConfig.question_count} were requested`
        );
      }

      // Select random questions up to the requested count
      const shuffledQuestions = [...availableQuestions].sort(() => Math.random() - 0.5);
      const selectedCount = Math.min(topicConfig.question_count, shuffledQuestions.length);
      
      console.log(`Selecting ${selectedCount} questions for topic ${topicConfig.topic_id}`);
      
      // Insert selected questions and track them
      for (let i = 0; i < selectedCount; i++) {
        const questionId = shuffledQuestions[i].id;
        if (!moduleQuestions.has(questionId)) {
          await insertModuleQuestion(currentModule.id, questionId);
          moduleQuestions.add(questionId);
        }
      }
    }

    // Get final questions for the module
    const finalQuestions = await getFinalModuleQuestions(currentModule.id);
    console.log(`Final question count for module ${currentModule.id}: ${finalQuestions.length}`);

    if (finalQuestions.length === 0) {
      throw new Error(`No questions could be selected for module ${currentModule.id}`);
    }

    return finalQuestions;

  } catch (error: any) {
    console.error("Error selecting module questions:", error);
    onError(error.message);
    return [];
  }
}
