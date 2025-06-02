# Personal RAG Chatbot with Ollama

A simple locally-hosted chatbot that uses your personal content to provide relevant answers through Retrieval Augmented Generation (RAG).

## Features

- 🤖 Runs completely locally - no API keys or cloud services needed
- 🔍 Uses RAG to retrieve relevant context from your documents
- 📚 Easily add your own content (resume, projects, blog posts, etc.)
- 🌐 Can be hosted on GitHub Pages with WebGPU (advanced setup)
- 🔄 Simple command-line interface

## Prerequisites

1. Python 3.9+ installed
2. [Ollama](https://ollama.ai/) installed and running
3. LLM model downloaded via Ollama (e.g., `ollama pull llama3`)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/personal-chatbot.git
cd personal-chatbot
```

2. Install requirements:
```bash
pip install -r requirements.txt
```

3. Add content:
   - Create `.txt` files in the `content` directory
   - Add any information you want your chatbot to know about you, your projects, etc.

4. Run the chatbot:
```bash
python llm_integration.py
```

## Adding Your Content

The chatbot learns about you from text files in the `content` directory. Here are some ideas:

- Resume and work experience
- Project descriptions
- Blog posts or articles you've written
- Personal information you want the chatbot to know

Simply save these as text files in the `content` folder, and the chatbot will use them as context.

## Command Line Options

```bash
python llm_integration.py --model llama3 --content ./my_content --rebuild
```

- `--model`: Specify which Ollama model to use (default: llama3)
- `--content`: Directory with your content files (default: content)
- `--rebuild`: Force rebuild of the vector store

## Web Interface (Optional)

To run with a Gradio web interface, create a `web_interface.py` file and integrate with the provided code.

## Deploying to GitHub

1. Create a GitHub repository for your chatbot
2. Push your code to the repository
3. For advanced users: Consider using GitHub Actions to automate building and deployment

## Advanced: Browser-Based Deployment

For a fully browser-based solution:
1. Use [WebLLM](https://github.com/mlc-ai/web-llm) to run models in the browser
2. Convert your vector store to a compatible format
3. Host the static files on GitHub Pages

## Limitations

- Runs locally, requiring computational resources
- Limited by the capabilities of the chosen LLM model
- Knowledge is limited to what's in your content files

## Contributing

Feel free to submit issues or pull requests with improvements.

## License

MIT
