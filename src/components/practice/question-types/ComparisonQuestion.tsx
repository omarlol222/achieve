type ComparisonQuestionProps = {
  value1: string;
  value2: string;
};

export function ComparisonQuestion({ value1, value2 }: ComparisonQuestionProps) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-8 bg-gray-50 p-6 rounded-lg">
        <div className="text-center space-y-2">
          <p className="font-medium text-gray-700">Value 1</p>
          <p className="text-lg">{value1}</p>
        </div>
        <div className="text-center space-y-2">
          <p className="font-medium text-gray-700">Value 2</p>
          <p className="text-lg">{value2}</p>
        </div>
      </div>
    </div>
  );
}