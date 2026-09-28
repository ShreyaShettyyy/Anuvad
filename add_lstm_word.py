import json
import os

file_path = 'words.json'

# Load the existing list of words
try:
    with open(file_path, 'r') as f:
        words = json.load(f)
except FileNotFoundError:
    words = []
except json.JSONDecodeError:
    print(f"Error: {file_path} is corrupted.")
    exit()

print(f"Current number of words: {len(words)}")
print("Type a new word to add to the dataset (or press Enter without typing anything to save and exit).")

while True:
    new_word = input("\nEnter new word: ").strip().upper()
    
    if not new_word:
        break
        
    if new_word in words:
        print(f"'{new_word}' is already in the list!")
    else:
        words.append(new_word)
        print(f"Added '{new_word}'. Total words: {len(words)}")

# Save the updated list back to the file
with open(file_path, 'w') as f:
    json.dump(words, f, indent=4)

print("\nSaved updated word list successfully!")
print("You can now run Run_Data_Collection.bat to start recording video sequences for all the words.")
