import os
import gradio as gr
from llm_integration import PersonalChatbot

# Initialize the chatbot
chatbot = PersonalChatbot(
    model_name="llama3",  # Change to your preferred model
    content_dir="content"  # Change to your content directory
)

# Create chat history
chat_history = []

def respond(message, history):
    """Process the user message and return a response"""
    response = chatbot.chat(message)
    return response

# Create the Gradio interface
demo = gr.ChatInterface(
    fn=respond,
    title="Personal AI Assistant",
    description="Ask me anything about Yusuf's projects, experience, or background!",
    theme="soft",
    examples=[
        "Tell me about your experience at Cisco",
        "What projects have you worked on?",
        "What are your skills in machine learning?",
        "Tell me about your education"
    ],
    retry_btn=None,
    undo_btn=None,
    clear_btn="Clear",
)

# Add CSS for better styling
css = """
body {
    font-family: 'Poppins', sans-serif;
    background-color: #f8fafc;
}
.gradio-container {
    max-width: 800px !important;
    margin: 0 auto !important;
}
h1 {
    color: #3b5998 !important;
    text-align: center !important;
}
.examples {
    gap: 10px !important;
}
.examples > div {
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 8px !important;
    padding: 10px !important;
    transition: all 0.3s ease !important;
}
.examples > div:hover {
    transform: translateY(-3px) !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1) !important;
}
"""

# Launch the interface
if __name__ == "__main__":
    demo.launch(share=False, debug=True, css=css) 