import os
import cv2
import json

# 1. Load existing labels
labels_file = 'labels.json'
try:
    with open(labels_file, 'r') as f:
        labels_dict = json.load(f)
except FileNotFoundError:
    print("Error: labels.json not found!")
    exit()

# 2. Get the new word from the user
new_word = input("Enter the new word or phrase you want to add: ").strip()

if new_word in labels_dict.values():
    print(f"Warning: The word '{new_word}' already exists in the dictionary!")
    proceed = input("Do you want to add it anyway as a separate class? (y/n): ")
    if proceed.lower() != 'y':
        exit()

# The next available class ID is the length of the dictionary
# Wait, let's just find the max integer key and add 1 to be safe
max_id = -1
for k in labels_dict.keys():
    if int(k) > max_id:
        max_id = int(k)
new_class_id = max_id + 1

# 3. Collect Images
DATA_DIR = './data'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

dataset_size = 2000
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

class_path = os.path.join(DATA_DIR, str(new_class_id))
if not os.path.exists(class_path):
    os.makedirs(class_path)

print(f"\n--- Recording '{new_word}' (Class {new_class_id}) ---")

# Wait for user to be ready
while True:
    ret, frame = cap.read()
    if not ret or frame is None:
        continue

    cv2.putText(frame, f'Word: {new_word} | Press "Q" to start!', (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2, cv2.LINE_AA)
    cv2.imshow('Camera Feed', frame)

    if cv2.waitKey(25) == ord('q'):
        break

# Record 2000 frames
print("Recording started. Please perform the gesture!")
counter = 0
while counter < dataset_size:
    ret, frame = cap.read()
    if not ret:
        continue

    # Show progress
    display_frame = frame.copy()
    cv2.putText(display_frame, f'Recording... {counter}/{dataset_size}', (50, 50),
                cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2, cv2.LINE_AA)
    cv2.imshow('Camera Feed', display_frame)
    cv2.waitKey(25)

    img_name = os.path.join(class_path, '{}.jpg'.format(counter))
    cv2.imwrite(img_name, frame)

    counter += 1

print(f"Data collection for '{new_word}' complete!")
cap.release()
cv2.destroyAllWindows()

# 4. Save to labels.json
labels_dict[str(new_class_id)] = new_word
with open(labels_file, 'w') as f:
    json.dump(labels_dict, f, indent=4)
print(f"Success! Added '{new_word}' to labels.json under ID {new_class_id}.")
print("\nIMPORTANT: You must now run the following scripts to update the model:")
print("1. python create_dataset.py (to extract hand landmarks)")
print("2. python train_classifier.py (to train the AI model on the new word)")
input("Press Enter to close this window...")
