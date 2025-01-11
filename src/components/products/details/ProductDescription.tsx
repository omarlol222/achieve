import React from 'react';

type ProductDescriptionProps = {
  description: string;
};

export const ProductDescription = ({ description }: ProductDescriptionProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-[#1B2E35] uppercase">PRODUCT DESCRIPTION:</h2>
    <p className="text-lg text-gray-700 leading-relaxed">{description}</p>
  </div>
);