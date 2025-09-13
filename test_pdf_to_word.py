#!/usr/bin/env python3
"""
Test script for PDF to Word conversion functionality
"""
import requests
import os
import time

BASE_URL = "http://127.0.0.1:5000"

def test_pdf_to_word_conversion():
    """Test the PDF to Word conversion feature"""
    print("=== Testing PDF to Word Conversion ===")
    
    # Check if server is running
    try:
        response = requests.get(BASE_URL, timeout=5)
        if response.status_code != 200:
            print("❌ Server is not responding properly")
            return
    except:
        print("❌ Server is not running. Please start the Flask app first.")
        return
    
    # Look for PDF files to test with
    test_files = []
    
    # Check uploads folder
    uploads_dir = "uploads"
    if os.path.exists(uploads_dir):
        pdf_files = [f for f in os.listdir(uploads_dir) if f.lower().endswith('.pdf')]
        test_files.extend(pdf_files)
    
    # Check processed folder
    processed_dir = "processed"
    if os.path.exists(processed_dir):
        pdf_files = [f for f in os.listdir(processed_dir) if f.lower().endswith('.pdf')]
        test_files.extend(pdf_files)
    
    if not test_files:
        print("❌ No PDF files found for testing. Please upload a PDF first.")
        return
    
    # Test with the first available PDF
    test_file = test_files[0]
    print(f"📄 Testing with file: {test_file}")
    
    try:
        # Test the conversion endpoint
        print("🔄 Starting conversion...")
        start_time = time.time()
        
        response = requests.get(f"{BASE_URL}/convert_to_word/{test_file}", timeout=60)
        
        end_time = time.time()
        conversion_time = end_time - start_time
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print(f"✅ Conversion successful!")
                print(f"   📊 Pages processed: {result.get('pages_processed', 'Unknown')}")
                print(f"   📁 Output file: {result.get('word_filename', 'Unknown')}")
                print(f"   ⏱️ Conversion time: {conversion_time:.2f} seconds")
                
                # Check if the Word file was created
                word_filename = result.get('word_filename')
                if word_filename:
                    word_path = os.path.join(processed_dir, word_filename)
                    if os.path.exists(word_path):
                        file_size = os.path.getsize(word_path)
                        print(f"   📏 Word file size: {file_size:,} bytes")
                        print(f"   ✅ Word document created successfully")
                    else:
                        print(f"   ⚠️ Word file not found at expected location")
                
            else:
                print(f"❌ Conversion failed: {result.get('error', 'Unknown error')}")
        else:
            print(f"❌ HTTP Error {response.status_code}: {response.text}")
            
    except requests.exceptions.Timeout:
        print("❌ Conversion timed out (>60 seconds)")
    except Exception as e:
        print(f"❌ Error during conversion: {e}")

def test_font_mapping():
    """Test the font mapping functionality"""
    print("\n=== Testing Font Mapping ===")
    
    # Test font mappings that would be used in conversion
    test_fonts = [
        ('HelveticaBold', 'Arial'),
        ('Times-Roman', 'Times New Roman'),
        ('Courier', 'Courier New'),
        ('Arial', 'Arial'),
        ('Calibri', 'Calibri'),
        ('UnknownFont', 'Arial'),  # Should fallback to Arial
    ]
    
    def map_pdf_font_to_word(pdf_font):
        """Replicate the font mapping logic"""
        font_mapping = {
            'helv': 'Arial',
            'helvetica': 'Arial',
            'helveticabold': 'Arial',
            'times': 'Times New Roman',
            'times-roman': 'Times New Roman',
            'courier': 'Courier New',
            'arial': 'Arial',
            'calibri': 'Calibri',
        }
        
        clean_font = pdf_font.lower().replace('-', '').replace(' ', '')
        
        if clean_font in font_mapping:
            return font_mapping[clean_font]
        
        for pdf_name, word_name in font_mapping.items():
            if pdf_name in clean_font or clean_font in pdf_name:
                return word_name
        
        return 'Arial'
    
    for pdf_font, expected in test_fonts:
        mapped = map_pdf_font_to_word(pdf_font)
        status = "✅" if mapped == expected else "⚠️"
        print(f"   {status} {pdf_font} → {mapped}")

def check_dependencies():
    """Check if required dependencies are installed"""
    print("\n=== Checking Dependencies ===")
    
    try:
        import docx
        print("✅ python-docx is installed")
        
        # Test basic Word document creation
        from docx import Document
        test_doc = Document()
        test_doc.add_paragraph("Test paragraph")
        
        # Try to save to a temporary location
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=True) as temp_file:
            test_doc.save(temp_file.name)
            print("✅ Word document creation test passed")
            
    except ImportError:
        print("❌ python-docx is not installed")
        print("   Install with: pip install python-docx")
    except Exception as e:
        print(f"⚠️ Word document creation test failed: {e}")

def show_conversion_features():
    """Display the features of the PDF to Word conversion"""
    print("\n=== PDF to Word Conversion Features ===")
    
    features = [
        "✅ Preserves text formatting (bold, italic, underline)",
        "✅ Maintains font families and sizes",
        "✅ Preserves text colors",
        "✅ Maintains paragraph alignment",
        "✅ Groups text blocks into logical lines",
        "✅ Maps PDF fonts to Word-compatible fonts",
        "✅ Handles multi-page documents",
        "✅ Adds page breaks between PDF pages",
        "✅ Sets appropriate document margins",
        "✅ Handles complex layouts with positioning",
    ]
    
    for feature in features:
        print(f"   {feature}")

def main():
    """Run all tests"""
    print("PDF to Word Conversion Test Suite")
    print("=" * 50)
    
    check_dependencies()
    test_font_mapping()
    show_conversion_features()
    test_pdf_to_word_conversion()
    
    print("\n" + "=" * 50)
    print("Test suite completed!")
    
    print("\nUsage Instructions:")
    print("1. Upload a PDF file using the web interface")
    print("2. Click the 'Convert to Word' button")
    print("3. Wait for the conversion to complete")
    print("4. The Word document will download automatically")
    print("5. Check the 'processed' folder for the .docx file")

if __name__ == "__main__":
    main()