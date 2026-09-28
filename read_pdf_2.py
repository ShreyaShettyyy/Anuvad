import os
import subprocess
subprocess.check_call(["pip", "install", "PyPDF2", "-q"])
import PyPDF2
reader = PyPDF2.PdfReader('required/benchmark_dataset_collection.pdf')
text = ""
for i in range(len(reader.pages)):
    text += reader.pages[i].extract_text()
print("DATASET MENTIONS:")
print(text[:2000])
if "ISL" in text or "INCLUDE" in text or "WLASL" in text:
    print("Found common datasets in text!")
