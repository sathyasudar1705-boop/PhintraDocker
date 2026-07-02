import api from './api';

// Custom error class to differentiate between actionable API errors and generic fallback situations
export class AIConnectionError extends Error {
  constructor(message, isActionable = false) {
    super(message);
    this.name = "AIConnectionError";
    this.isActionable = isActionable;
  }
}

// Initialize the global debug state
if (typeof window !== 'undefined' && !window.aiDebugState) {
  window.aiDebugState = {
    tokenLoaded: false,
    apiStatus: "Idle", // Connected, Failed, Retrying, Idle, Testing
    modelStatus: "Unknown", // Ready, Loading, Unavailable, Unknown
    lastError: "",
    lastResponseBody: "",
    activeModel: "mistralai/Mistral-7B-Instruct-v0.2",
    lastHttpStatus: null,
    lastParsedFormat: ""
  };
}

/**
 * Sends a chatbot message to the backend proxy API.
 * Keeps the API token secure on the server side.
 */
export const sendMessageToAI = async (message, chatHistory) => {
  try {
    const response = await api.post('/api/ai/chat', { message, chatHistory });
    return response.data.answer;
  } catch (error) {
    const errMsg = error.response?.data?.detail || error.message || "Failed to contact Phintra AI service.";
    console.error("AI Service Error:", errMsg);
    throw new AIConnectionError(errMsg, false);
  }
};

/**
 * Triggers backend connection diagnostics and updates the global debugging panel state.
 */
export const testAIConnection = async () => {
  console.log("Requesting backend to execute Hugging Face connection diagnostics...");
  
  if (typeof window !== 'undefined' && window.aiDebugState) {
    window.aiDebugState.apiStatus = "Testing";
  }

  try {
    const response = await api.get('/api/ai/diagnostics');
    const diag = response.data;
    
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.tokenLoaded = diag.tokenLoaded;
      window.aiDebugState.apiStatus = diag.apiStatus;
      window.aiDebugState.modelStatus = diag.modelStatus;
      window.aiDebugState.lastError = diag.lastError;
      window.aiDebugState.lastResponseBody = diag.lastResponseBody;
      window.aiDebugState.activeModel = diag.activeModel;
      window.aiDebugState.lastHttpStatus = diag.lastHttpStatus;
      window.aiDebugState.lastParsedFormat = diag.lastParsedFormat;
    }
    console.log("AI connection diagnostics completed: ", diag.apiStatus);
  } catch (error) {
    const errMsg = error.response?.data?.detail || error.message || "Failed to fetch diagnostics from backend.";
    console.error("AI Diagnostics failed:", errMsg);
    
    if (typeof window !== 'undefined' && window.aiDebugState) {
      window.aiDebugState.apiStatus = "Failed";
      window.aiDebugState.modelStatus = "Unavailable";
      window.aiDebugState.lastError = errMsg;
    }
  }
};
