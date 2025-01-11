import { ScrollArea } from "@/components/ui/scroll-area";

type PassageQuestionProps = {
  passageText: string;
};

export function PassageQuestion({ passageText }: PassageQuestionProps) {
  return (
    <ScrollArea className="h-[200px] rounded-lg">
      <div className="bg-gray-50 p-4">
        <p className="whitespace-pre-wrap">{passageText}</p>
      </div>
    </ScrollArea>
  );
}