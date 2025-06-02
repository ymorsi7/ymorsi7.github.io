// browser_integration.js
// Simple example of integrating WebLLM into your website

// This is a simplified demonstration and requires WebLLM library
// See full implementation details at: https://github.com/mlc-ai/web-llm

// Import required WebLLM components
import * as webllm from '@mlc-ai/web-llm';
import * as transformers from '@xenova/transformers';

// DOM elements
let chatContainer;
let userInput;
let sendButton;
let modelSelector;
let statusElement;

// Initialize vector store and model
let vectorStore = null;
let model = null;
let embedding = null;
let isModelLoaded = false;

// Configuration
const config = {
  // Model options
  models: [
    { name: 'phi-2.Q4_K_M.gguf', displayName: 'Phi-2 (Small)' },
    { name: 'phi-3-mini-4k-instruct.Q4_K_M.gguf', displayName: 'Phi-3 Mini' }
  ],
  // Default model
  defaultModel: 'phi-2.Q4_K_M.gguf',
  // Files to include in the knowledge base
  knowledgeFiles: [
    'content/resume.json',
    'content/projects.json',
    'content/personal.json'
  ]
};

// Initialize WebLLM
async function initializeWebLLM() {
  updateStatus('Loading model...');
  
  try {
    // Create chat instance
    model = new webllm.ChatModule({
      model: config.defaultModel,
      temperature: 0.7,
      convertors: [webllm.autoConverter()]
    });
    
    // Load model
    await model.reload();
    
    // Load embeddings model for RAG
    embedding = await new transformers.pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    // Load knowledge base
    await loadKnowledgeBase();
    
    isModelLoaded = true;
    updateStatus('Model loaded successfully!');
    enableInterface();
  } catch (error) {
    console.error('Error initializing WebLLM:', error);
    updateStatus('Error loading model. See console for details.');
  }
}

// Load knowledge base from JSON files
async function loadKnowledgeBase() {
  updateStatus('Loading knowledge base...');
  
  try {
    // In a real implementation, you would load and process your vector store
    // This is a simplified example
    vectorStore = {
      documents: [],
      embeddings: []
    };
    
    // Load knowledge files
    for (const file of config.knowledgeFiles) {
      const response = await fetch(file);
      const data = await response.json();
      
      // Process and add to vector store
      for (const doc of data.documents) {
        const docEmbedding = await embedding(doc.text);
        vectorStore.documents.push(doc);
        vectorStore.embeddings.push(docEmbedding);
      }
    }
    
    updateStatus('Knowledge base loaded!');
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    updateStatus('Error loading knowledge base. See console for details.');
  }
}

// Simple vector similarity search
async function searchKnowledgeBase(query, topK = 3) {
  if (!vectorStore || vectorStore.documents.length === 0) {
    return [];
  }
  
  // Get query embedding
  const queryEmbedding = await embedding(query);
  
  // Calculate similarities
  const similarities = vectorStore.embeddings.map((docEmb, index) => {
    // Calculate cosine similarity
    const similarity = calculateCosineSimilarity(queryEmbedding, docEmb);
    return { index, similarity };
  });
  
  // Sort by similarity and get top K
  const topResults = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
  
  // Return relevant documents
  return topResults.map(result => vectorStore.documents[result.index]);
}

// Calculate cosine similarity between embeddings
function calculateCosineSimilarity(embA, embB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < embA.length; i++) {
    dotProduct += embA[i] * embB[i];
    normA += embA[i] * embA[i];
    normB += embB[i] * embB[i];
  }
  
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  
  return dotProduct / (normA * normB);
}

// Process user message and generate response
async function processMessage(message) {
  if (!isModelLoaded) {
    return "The model is still loading. Please wait a moment.";
  }
  
  try {
    // Get relevant documents from knowledge base
    const relevantDocs = await searchKnowledgeBase(message);
    
    // Create context from relevant documents
    let context = '';
    if (relevantDocs.length > 0) {
      context = "Here is some relevant information about Yusuf Morsi:\n";
      relevantDocs.forEach(doc => {
        context += `${doc.text}\n\n`;
      });
    }
    
    // Create prompt with context
    const prompt = `${context}
    
    You are Yusuf Morsi's personal AI assistant. Answer the question based on the provided context.
    
    Question: ${message}
    
    Answer:`;
    
    // Generate response
    const response = await model.generate(prompt, {
      max_tokens: 500,
      temperature: 0.7
    });
    
    return response.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    return "I encountered an error while processing your request. Please try again.";
  }
}

// Add a message to the chat interface
function addMessage(sender, message) {
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
  
  const contentElement = document.createElement('div');
  contentElement.className = 'message-content';
  contentElement.textContent = message;
  
  messageElement.appendChild(contentElement);
  chatContainer.appendChild(messageElement);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Handle sending a message
async function handleSendMessage() {
  const message = userInput.value.trim();
  if (!message) return;
  
  // Add user message to chat
  addMessage('user', message);
  
  // Clear input
  userInput.value = '';
  
  // Show typing indicator
  const typingElement = document.createElement('div');
  typingElement.className = 'message bot-message typing';
  typingElement.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  chatContainer.appendChild(typingElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  // Generate response
  const response = await processMessage(message);
  
  // Remove typing indicator
  chatContainer.removeChild(typingElement);
  
  // Add bot response
  addMessage('bot', response);
}

// Update status message
function updateStatus(message) {
  if (statusElement) {
    statusElement.textContent = message;
  }
}

// Enable interface once model is loaded
function enableInterface() {
  if (sendButton) {
    sendButton.disabled = false;
  }
  if (userInput) {
    userInput.disabled = false;
    userInput.placeholder = "Ask me anything about Yusuf...";
  }
}

// Initialize the chat interface
function initializeChatInterface() {
  // Get DOM elements
  chatContainer = document.getElementById('chat-container');
  userInput = document.getElementById('user-input');
  sendButton = document.getElementById('send-button');
  modelSelector = document.getElementById('model-selector');
  statusElement = document.getElementById('status');
  
  // Disable interface until model is loaded
  if (sendButton) sendButton.disabled = true;
  if (userInput) {
    userInput.disabled = true;
    userInput.placeholder = "Loading model...";
  }
  
  // Add event listeners
  if (sendButton) {
    sendButton.addEventListener('click', handleSendMessage);
  }
  
  if (userInput) {
    userInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleSendMessage();
      }
    });
  }
  
  // Populate model selector
  if (modelSelector) {
    config.models.forEach(modelOption => {
      const option = document.createElement('option');
      option.value = modelOption.name;
      option.textContent = modelOption.displayName;
      modelSelector.appendChild(option);
    });
    
    modelSelector.value = config.defaultModel;
    
    modelSelector.addEventListener('change', async () => {
      const selectedModel = modelSelector.value;
      isModelLoaded = false;
      updateStatus(`Loading ${selectedModel}...`);
      
      try {
        await model.reload(selectedModel);
        isModelLoaded = true;
        updateStatus(`Model ${selectedModel} loaded successfully!`);
      } catch (error) {
        console.error('Error changing model:', error);
        updateStatus('Error loading model. See console for details.');
      }
    });
  }
  
  // Initial welcome message
  addMessage('bot', "Hi! I'm Yusuf's AI assistant. How can I help you today?");
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeChatInterface();
  initializeWebLLM();
});

// Export functions for external use
export {
  initializeWebLLM,
  processMessage
}; 