import os
import sys
import argparse
from typing import List, Dict, Any

# Import necessary libraries - install with pip
import ollama
import faiss
import numpy as np
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain_community.llms import Ollama

class PersonalChatbot:
    def __init__(
        self, 
        model_name: str = "llama3", 
        embedding_model: str = "all-MiniLM-L6-v2",
        content_dir: str = "content"
    ):
        self.model_name = model_name
        self.embedding_model = embedding_model
        self.content_dir = content_dir
        self.vector_db_path = "vector_store"
        
        # Initialize embeddings
        self.embeddings = HuggingFaceEmbeddings(model_name=embedding_model)
        
        # Check if vector store exists
        if os.path.exists(self.vector_db_path) and os.listdir(self.vector_db_path):
            self.vector_store = FAISS.load_local(self.vector_db_path, self.embeddings)
            print("Loaded existing vector store")
        else:
            print("Creating new vector store from content...")
            self.vector_store = self._create_vector_store()
        
        # Initialize the LLM
        self.llm = Ollama(model=model_name)
        
        # Create the retrieval chain
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=self.vector_store.as_retriever(search_kwargs={"k": 3})
        )
    
    def _create_vector_store(self) -> FAISS:
        """Create a vector store from content files"""
        if not os.path.exists(self.content_dir):
            os.makedirs(self.content_dir)
            print(f"Created content directory at {self.content_dir}")
            print("Add text files with your content to this directory")
            return FAISS.from_texts(["No content available yet."], self.embeddings)
        
        # Load documents from the content directory
        loader = DirectoryLoader(
            self.content_dir, 
            glob="**/*.txt", 
            loader_cls=TextLoader
        )
        documents = loader.load()
        
        if not documents:
            print("No documents found in content directory")
            return FAISS.from_texts(["No content available yet."], self.embeddings)
        
        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        texts = text_splitter.split_documents(documents)
        
        # Create and save the vector store
        vector_store = FAISS.from_documents(texts, self.embeddings)
        os.makedirs(self.vector_db_path, exist_ok=True)
        vector_store.save_local(self.vector_db_path)
        
        return vector_store
    
    def chat(self, query: str) -> str:
        """Process a query and return a response"""
        try:
            response = self.qa_chain.invoke({"query": query})
            return response["result"]
        except Exception as e:
            return f"Error processing query: {str(e)}"
    
    def rebuild_vector_store(self) -> None:
        """Rebuild the vector store from content files"""
        self.vector_store = self._create_vector_store()
        print("Vector store rebuilt successfully")


def main():
    parser = argparse.ArgumentParser(description="Personal RAG Chatbot")
    parser.add_argument("--model", type=str, default="llama3", help="Name of the Ollama model to use")
    parser.add_argument("--content", type=str, default="content", help="Directory containing your content files")
    parser.add_argument("--rebuild", action="store_true", help="Rebuild the vector store")
    
    args = parser.parse_args()
    
    chatbot = PersonalChatbot(
        model_name=args.model,
        content_dir=args.content
    )
    
    if args.rebuild:
        chatbot.rebuild_vector_store()
        return
    
    print(f"\nPersonal Chatbot (using {args.model}) is ready!")
    print("Type 'exit' to quit\n")
    
    while True:
        query = input("You: ")
        if query.lower() in ["exit", "quit", "q"]:
            break
        
        response = chatbot.chat(query)
        print(f"Bot: {response}\n")


if __name__ == "__main__":
    main()
