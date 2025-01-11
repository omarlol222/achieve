type ComparisonQuestionProps = {
  value1: string;
  value2: string;
};

export function ComparisonQuestion({ value1, value2 }: ComparisonQuestionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg mb-4">
      <div className="text-center">
        <p className="font-medium mb-2">Value 1</p>
        <p>{value1}</p>
      </div>
      <div className="text-center">
        <p className="font-medium mb-2">Value 2</p>
        <p>{value2}</p>
      </div>
    </div>
  );
}