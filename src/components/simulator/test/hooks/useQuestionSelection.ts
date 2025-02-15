
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

    // Collect all available questions first
    const availableQuestionsByTopic = new Map();
    let totalAvailableQuestions = 0;

    for (const topicConfig of moduleTopics) {
      const topicQuestions = await getTopicQuestions(
        currentModule.id,
        currentModule.test_type_id,
        currentModule.subject_id,
        topicConfig.topic_id
      );

      if (topicQuestions.length > 0) {
        availableQuestionsByTopic.set(topicConfig.topic_id, topicQuestions);
        totalAvailableQuestions += topicQuestions.length;
      } else {
        console.warn(`No questions available for topic ${topicConfig.topic_id}`);
      }
    }

    if (totalAvailableQuestions === 0) {
      throw new Error("No questions available for any topics in this module");
    }

    // Adjust question distribution based on available questions
    const targetTotal = currentModule.total_questions;
    let remainingQuestions = targetTotal;
    let selectedQuestions = [];

    // First pass: select questions up to the minimum of available or requested count
    for (const topicConfig of moduleTopics) {
      const availableQuestions = availableQuestionsByTopic.get(topicConfig.topic_id) || [];
      if (availableQuestions.length === 0) continue;

      const requestedCount = topicConfig.question_count;
      const possibleCount = Math.min(availableQuestions.length, requestedCount);
      
      // Randomly select questions
      const shuffled = [...availableQuestions].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, possibleCount);
      
      selectedQuestions = [...selectedQuestions, ...selected];
      remainingQuestions -= selected.length;
    }

    // If we still need more questions and have available ones, distribute them
    if (remainingQuestions > 0) {
      const allAvailableQuestions = Array.from(availableQuestionsByTopic.values())
        .flat()
        .filter(q => !selectedQuestions.find(sq => sq.id === q.id));

      if (allAvailableQuestions.length > 0) {
        const additional = allAvailableQuestions
          .sort(() => 0.5 - Math.random())
          .slice(0, remainingQuestions);
        
        selectedQuestions = [...selectedQuestions, ...additional];
      }
    }

    // Insert selected questions
    for (const question of selectedQuestions) {
      await insertModuleQuestion(currentModule.id, question.id);
    }

    const finalQuestions = await getFinalModuleQuestions(currentModule.id);
    console.log(`Final question count: ${finalQuestions.length} out of expected ${currentModule.total_questions}`);

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
