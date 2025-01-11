import React from 'react';

type ProductFeaturesProps = {
  customFeatures?: string[];
};

export const ProductFeatures = ({ customFeatures = [] }: ProductFeaturesProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-[#1B2E35] uppercase">FEATURES:</h2>
    <ul className="space-y-3">
      {customFeatures.map((feature, index) => (
        <li key={`custom-${index}`} className="flex items-center gap-3">
          <span className="text-[#1B2E35] text-2xl">✦</span>
          <span className="text-lg text-gray-700">{feature}</span>
        </li>
      ))}
    </ul>
  </div>
);