export type ChatHistory = {
  role: string;
  content: string;
  timestamp: number;
};

// Define the types for incoming requests
export type StreamRequestBody = {
  model: string;
  chatName: string;
  query: string;
  chatHistory: Array<ChatHistory>;
};
