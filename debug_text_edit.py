#!/usr/bin/env python3
"""
Debug script to test text editing functionality
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_text_edit():
    print("Testing text edit functionality...")
    
    # First, check if we have any files
    import os
    uploads_dir = "uploads"
    processed_dir = "processed"
    
    # Look for files in both directories
    test_files = []
    if os.path.exists(uploads_dir):
        test_files.extend([f for f in os.listdir(uploads_dir) if f.endswith('.PDF')])
    if os.path.exists(processed_dir):
        test_files.extend([f for f in os.listdir(processed_dir) if f.endswith('.PDF')])
    
    if not test_files:
        print("No PDF files found. Please upload a PDF first.")
        return
    
    test_file = test_files[0]
    print(f"Using test file: {test_file}")
    
    # Get text blocks
    try:
        response = requests.get(f"{BASE_URL}/get_text_blocks/{test_file}")
        if response.status_code == 200:
            data = response.json()
            if data['success'] and data['pages_blocks']:
                first_page_blocks = data['pages_blocks'][0]['blocks']
                if first_page_blocks:
                    first_block = first_page_blocks[0]
                    print(f"First text block: {first_block['text'][:50]}...")
                    print(f"Bbox: {first_block['bbox']}")
                    print(f"Font: {first_block['font']}, Size: {first_block['size']}")
                    
                    # Test edit
                    edit_data = {
                        'filename': test_file,
                        'page_num': 1,
                        'old_text': first_block['text'],
                        'new_text': first_block['text'] + " [EDITED]",
                        'bbox': first_block['bbox'],
                        'preserve_formatting': True,
                        'font_info': {
                            'font': first_block['font'],
                            'size': first_block['size'],
                            'flags': first_block['flags'],
                            'color': first_block['color']
                        }
                    }
                    
                    print("Sending edit request...")
                    edit_response = requests.post(
                        f"{BASE_URL}/edit_text",
                        json=edit_data,
                        headers={'Content-Type': 'application/json'}
                    )
                    
                    if edit_response.status_code == 200:
                        result = edit_response.json()
                        if result['success']:
                            print(f"✅ Edit successful: {result['message']}")
                            new_filename = result['modified_filename']
                            
                            # Debug the new file
                            debug_response = requests.get(f"{BASE_URL}/debug_pdf/{new_filename}")
                            if debug_response.status_code == 200:
                                debug_data = debug_response.json()
                                print(f"📄 New file debug info:")
                                print(f"   Pages: {debug_data['page_count']}")
                                for page in debug_data['pages']:
                                    print(f"   Page {page['page_num']}: {page['text_blocks_count']} text blocks, {page['text_length']} chars")
                                    if page['text_preview']:
                                        print(f"   Preview: {page['text_preview'][:100]}...")
                        else:
                            print(f"❌ Edit failed: {result['error']}")
                    else:
                        print(f"❌ Edit request failed: {edit_response.status_code}")
                        print(edit_response.text)
                else:
                    print("No text blocks found in first page")
            else:
                print("No text blocks data received")
        else:
            print(f"Failed to get text blocks: {response.status_code}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_text_edit()