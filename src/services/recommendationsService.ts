import { api } from "./api";

interface TextImprovementRequest {
  text: string;
}

interface TextImprovementResponse {
  originalText: string;
  improvedText: string;
  explanation: string;
}

interface CategorySuggestionRequest {
  text: string;
}

interface CategorySuggestionResponse {
  text: string;
  suggestedCategory: string;
  confidence: number;
}

interface TagRecommendationRequest {
  text: string;
}

interface TagRecommendationResponse {
  text: string;
  recommendedTags: string[];
}

interface TaskImprovementRequest {
  title: string;
  description: string;
  category?: string;
  tags?: string[];
}

interface TaskImprovementResponse {
  originalTitle: string;
  improvedTitle: string;
  originalDescription: string;
  improvedDescription: string;
  originalCategory: string;
  suggestedCategory: string;
  confidence: number;
  originalTags: string[];
  recommendedTags: string[];
  explanation: string;
}

const recommendationsService = {
  improveTaskComprehensive: async (
    title: string,
    description: string,
    category?: string,
    tags?: string[]
  ): Promise<TaskImprovementResponse> => {
    const response = await api.post(
      "/recommendations/improve-task-comprehensive",
      {
        title,
        description,
        category,
        tags,
      }
    );
    return response.data;
  },

  improveText: async (text: string): Promise<TextImprovementResponse> => {
    const response = await api.post("/recommendations/improve-text", { text });
    return response.data;
  },

  suggestCategory: async (
    text: string
  ): Promise<CategorySuggestionResponse> => {
    const response = await api.post("/recommendations/suggest-category", {
      text,
    });
    return response.data;
  },

  recommendTags: async (text: string): Promise<TagRecommendationResponse> => {
    const response = await api.post("/recommendations/recommend-tags", {
      text,
    });
    return response.data;
  },
};

export default recommendationsService;
