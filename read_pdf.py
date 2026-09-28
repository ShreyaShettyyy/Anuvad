import sys
import os
os.system(f"{sys.executable} -m pip install PyMuPDF -q")
import fitz
doc = fitz.open("required/benchmark_dataset_collection.pdf")
print(doc[0].get_text()[:1000])
