import React from 'react';

type Permission = {
  has_course: boolean;
  has_simulator: boolean;
  has_practice: boolean;
  course_text?: string;
  simulator_text?: string;
  practice_text?: string;
  test_type: {
    name: string;
  };
};

type ProductFeaturesProps = {
  permissions: Permission[];
  customFeatures?: string[];
};

export const ProductFeatures = ({ permissions, customFeatures = [] }: ProductFeaturesProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-[#1B2E35] uppercase">FEATURES:</h2>
    <ul className="space-y-3">
      {permissions?.map((permission, index) => (
        <React.Fragment key={index}>
          {permission.has_course && (
            <li className="flex items-center gap-3">
              <span className="text-[#1B2E35] text-2xl">✦</span>
              <span className="text-lg text-gray-700">
                {permission.course_text || `Access to ${permission.test_type.name} Course`}
              </span>
            </li>
          )}
          {permission.has_simulator && (
            <li className="flex items-center gap-3">
              <span className="text-[#1B2E35] text-2xl">✦</span>
              <span className="text-lg text-gray-700">
                {permission.simulator_text || `Access to ${permission.test_type.name} Simulator`}
              </span>
            </li>
          )}
          {permission.has_practice && (
            <li className="flex items-center gap-3">
              <span className="text-[#1B2E35] text-2xl">✦</span>
              <span className="text-lg text-gray-700">
                {permission.practice_text || `Access to ${permission.test_type.name} Practice`}
              </span>
            </li>
          )}
        </React.Fragment>
      ))}
      {customFeatures.map((feature, index) => (
        <li key={`custom-${index}`} className="flex items-center gap-3">
          <span className="text-[#1B2E35] text-2xl">✦</span>
          <span className="text-lg text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);