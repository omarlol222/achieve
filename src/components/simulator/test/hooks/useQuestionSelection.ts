
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
    const totalExpectedQuestions = currentModule.total_questions;

    console.log("Current module:", {
      id: currentModule.id,
      name: currentModule.name,
      subject: currentModule.subject?.name,
      subjectId: currentModule.subject_id,
      topicsCount: currentModule.module_topics?.length,
      totalQuestions: totalExpectedQuestions,
      topics: currentModule.module_topics?.map(t => ({
        topicId: t.topic_id,
        questionCount: t.question_count
      }))
    });

    const moduleTopics = currentModule.module_topics || [];
    if (!moduleTopics.length) {
      throw new Error("No topics configured for this module");
    }

    // Validate total questions matches sum of topic question counts
    const configuredTotal = moduleTopics.reduce((sum, topic) => sum + topic.question_count, 0);
    if (configuredTotal !== totalExpectedQuestions) {
      console.error(`Mismatch in question counts. Topics sum: ${configuredTotal}, Expected total: ${totalExpectedQuestions}`);
      throw new Error("Module configuration error: topic question counts don't match total expected questions");
    }

    await clearModuleQuestions(currentModule.id);

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

      if (topicQuestions.length < topicConfig.question_count) {
        console.warn(
          `Warning: Topic ${topicConfig.topic_id} has only ${topicQuestions.length} ` +
          `questions available, but ${topicConfig.question_count} were requested`
        );
      }

      // Select exactly question_count questions for this topic
      const questionsToSelect = Math.min(topicConfig.question_count, topicQuestions.length);
      const shuffledQuestions = [...topicQuestions].sort(() => 0.5 - Math.random());
      const topicSelectedQuestions = shuffledQuestions.slice(0, questionsToSelect);

      console.log(`Selected ${topicSelectedQuestions.length}/${topicConfig.question_count} questions for topic ${topicConfig.topic_id}`);
      selectedQuestions = [...selectedQuestions, ...topicSelectedQuestions];
    }

    // Insert all selected questions
    console.log(`Total questions selected: ${selectedQuestions.length}/${totalExpectedQuestions}`);
    for (const question of selectedQuestions) {
      await insertModuleQuestion(currentModule.id, question.id);
    }

    const finalQuestions = await getFinalModuleQuestions(currentModule.id);
    console.log(`Final question count: ${finalQuestions.length}/${totalExpectedQuestions}`);

    if (finalQuestions.length === 0) {
      throw new Error("No questions could be selected for this module");
    }

    if (finalQuestions.length < totalExpectedQuestions) {
      const errorMsg = `Could only find ${finalQuestions.length} questions out of ${totalExpectedQuestions} required for module ${currentModule.name}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    return finalQuestions;
  } catch (error: any) {
    onError(error.message);
    return [];
  }
}
