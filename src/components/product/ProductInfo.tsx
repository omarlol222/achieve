import { Star } from "lucide-react";

interface Permission {
  has_course: boolean;
  has_simulator: boolean;
  test_type: {
    name: string;
  };
}

interface ProductInfoProps {
  name: string;
  description: string;
  permissions: Permission[];
}

export const ProductInfo = ({ name, description, permissions }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      <h1 className="text-5xl font-bold text-[#1B2E35]">{name}</h1>
      
      <div>
        <h2 className="text-xl font-bold text-[#1B2E35] mb-4">PRODUCT DESCRIPTION:</h2>
        <p className="text-gray-700 leading-relaxed">{description}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#1B2E35] mb-4">FEATURES:</h2>
        <ul className="space-y-4">
          {permissions.map((permission, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <Star className="h-5 w-5 text-[#1B2E35]" />
              <span className="text-gray-700">
                {permission.test_type.name}
                {permission.has_course && " Course"}
                {permission.has_simulator && " + Simulator"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};