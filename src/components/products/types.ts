export type ProductFormData = {
  name: string;
  description: string;
  price: number;
  currency: string;
  thumbnail_url: string;
  detail_images: string[];
  test_type_id: string;
  custom_features: string[];
  permissions: {
    test_type_id: string;
    has_course: boolean;
    has_simulator: boolean;
    has_practice: boolean;
    course_text?: string;
    simulator_text?: string;
    practice_text?: string;
  }[];
};