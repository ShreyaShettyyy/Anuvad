import os
import subprocess
import json
import urllib.request
import time

ZENODO_API_URL = "https://zenodo.org/api/records/4010759"
DATA_DIR = "include_dataset"

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

CATEGORIES = [
    "Greetings", "Pronouns", "Days_and_Time", 
    "Places", "People", "Jobs", "Adjectives",
    "Animals", "Society", "Colours"
]

print("Fetching metadata from Zenodo...")
response = urllib.request.urlopen(ZENODO_API_URL)
data = json.loads(response.read())

files_to_download = []
for file_info in data['files']:
    file_name = file_info['key']
    if any(file_name.startswith(cat) for cat in CATEGORIES) and file_name.endswith('.zip'):
        files_to_download.append({
            'name': file_name,
            'url': file_info['links']['self']
        })

def download_with_curl(url, output_path):
    # -L: Follow redirects
    # -C -: Resume broken download
    # --retry 10: Retry 10 times on transient errors
    cmd = [
        "curl.exe", "-L", "-C", "-", "--retry", "10", 
        "--retry-delay", "5", "-o", output_path, url
    ]
    
    max_attempts = 20
    for attempt in range(max_attempts):
        print(f"\nDownloading {os.path.basename(output_path)} (Attempt {attempt+1}/{max_attempts})")
        result = subprocess.run(cmd)
        
        # Check if zip file is valid
        if result.returncode == 0:
            import zipfile
            try:
                with zipfile.ZipFile(output_path, 'r') as zip_ref:
                    if zip_ref.testzip() is None:
                        print(f"Successfully downloaded and verified {os.path.basename(output_path)}!")
                        return True
            except Exception as e:
                print(f"Zip file corrupted, retrying... {e}")
                # Delete corrupted file so curl can start fresh
                os.remove(output_path)
                cmd = ["curl.exe", "-L", "--retry", "10", "--retry-delay", "5", "-o", output_path, url] # remove -C - since we deleted
        
        print("Download failed or connection dropped. Waiting 5 seconds before retrying...")
        time.sleep(5)
    
    return False

for file_obj in files_to_download:
    file_path = os.path.join(DATA_DIR, file_obj['name'])
    
    success = download_with_curl(file_obj['url'], file_path)
    if success:
        print(f"Extracting {file_obj['name']}...")
        import zipfile
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(DATA_DIR)
            os.remove(file_path) # Clean up zip after extraction
        except Exception as e:
            print(f"Failed to extract {file_obj['name']}: {e}")
    else:
        print(f"CRITICAL ERROR: Could not download {file_obj['name']} after {max_attempts} attempts.")

print("\n--- ALL ROBUST DOWNLOADS COMPLETED ---")
print("You can now safely run train_include_lstm.py")
