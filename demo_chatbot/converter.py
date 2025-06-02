#!/usr/bin/env python3
"""
Content Converter: Converts text files in the content directory to JSON format for the browser interface
"""

import os
import json
import argparse
from pathlib import Path

def convert_text_to_json(input_dir, output_dir, chunk_size=300, overlap=50):
    """
    Convert text files to JSON format with chunking for better retrieval
    
    Args:
        input_dir (str): Directory containing text files
        output_dir (str): Directory to output JSON files
        chunk_size (int): Size of chunks to split text into
        overlap (int): Overlap between chunks
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Process each text file
    for file_path in Path(input_dir).glob('*.txt'):
        # Read the file content
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        
        # Create documents with metadata
        documents = []
        
        for i, paragraph in enumerate(paragraphs):
            # Skip very short paragraphs
            if len(paragraph) < 10:
                continue
                
            # Create chunks if paragraph is too long
            if len(paragraph) > chunk_size:
                chunks = create_chunks(paragraph, chunk_size, overlap)
                for j, chunk in enumerate(chunks):
                    documents.append({
                        "id": f"{file_path.stem}_{i}_{j}",
                        "text": chunk,
                        "metadata": {
                            "source": file_path.name,
                            "section": file_path.stem,
                            "chunk": j
                        }
                    })
            else:
                documents.append({
                    "id": f"{file_path.stem}_{i}",
                    "text": paragraph,
                    "metadata": {
                        "source": file_path.name,
                        "section": file_path.stem
                    }
                })
        
        # Create output JSON structure
        output = {
            "documents": documents,
            "metadata": {
                "source": file_path.name,
                "type": "content",
                "count": len(documents)
            }
        }
        
        # Write to JSON file
        output_path = Path(output_dir) / f"{file_path.stem}.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output, f, indent=2, ensure_ascii=False)
            
        print(f"Converted {file_path.name} to {output_path.name} ({len(documents)} documents)")

def create_chunks(text, chunk_size, overlap):
    """
    Split text into overlapping chunks
    
    Args:
        text (str): Text to split
        chunk_size (int): Size of chunks
        overlap (int): Overlap between chunks
        
    Returns:
        list: List of text chunks
    """
    chunks = []
    start = 0
    
    while start < len(text):
        # Get chunk with potential extra to avoid cutting words
        end = min(start + chunk_size, len(text))
        
        # Adjust end to avoid cutting words in the middle
        if end < len(text):
            # Try to find a good breaking point (space, period, etc.)
            for i in range(min(30, end - start)):
                if end - i > 0 and text[end - i - 1] in ['.', '!', '?', '\n'] and text[end - i] in [' ', '\n']:
                    end = end - i
                    break
        
        # Add chunk
        chunks.append(text[start:end])
        
        # Move start position for next chunk with overlap
        start = end - overlap
        
        # Make sure we're making progress
        if start >= end:
            start = end
    
    return chunks

def main():
    parser = argparse.ArgumentParser(description='Convert text files to JSON format for the browser interface')
    parser.add_argument('--input', type=str, default='content', help='Input directory containing text files')
    parser.add_argument('--output', type=str, default='content', help='Output directory for JSON files')
    parser.add_argument('--chunk-size', type=int, default=300, help='Size of chunks to split text into')
    parser.add_argument('--overlap', type=int, default=50, help='Overlap between chunks')
    
    args = parser.parse_args()
    
    convert_text_to_json(args.input, args.output, args.chunk_size, args.overlap)
    
if __name__ == '__main__':
    main() 