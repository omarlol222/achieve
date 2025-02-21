
export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  rating?: number;
  marked_as_understood?: boolean;
  image?: string;
  imageBase64?: string;
};
