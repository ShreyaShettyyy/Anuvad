import os
import cv2
import json
import time

DATA_DIR = './custom_dataset'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Here is a robust list of 25 common/useful words. 
# Feel free to edit this list before running the script!
WORDS = [
    'HELLO', 'THANK YOU', 'PLEASE', 'YES', 'NO',
    'WHO', 'WHAT', 'WHERE', 'WHEN', 'WHY', 
    'HOW', 'NAME', 'FINE', 'OKAY', 'GOOD', 
    'BAD', 'SORRY', 'HELP', 'FRIEND', 'FAMILY', 
    'WORRY', 'REMEMBER', 'WORK', 'HOME', 'TIME'
]

# Save the labels mapping so the training script knows what each ID means
labels_dict = {i: word for i, word in enumerate(WORDS)}
with open('custom_labels.json', 'w') as f:
    json.dump(labels_dict, f)

dataset_size = 150  # 150 frames per word is enough (about 5-6 seconds of video)

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print(f"Starting Custom Word Dataset Collection for {len(WORDS)} words.")

for j, word in enumerate(WORDS):
    class_path = os.path.join(DATA_DIR, str(j))
    if not os.path.exists(class_path):
        os.makedirs(class_path)

    print(f'\n--- Collecting data for: {word} ---')
    
    # Wait for the user to get ready
    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            continue
            
        cv2.putText(frame, f'Sign: {word}', (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(frame, 'Press "Q" to start recording!', (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.imshow('Custom Data Collection', frame)

        if cv2.waitKey(25) == ord('q'):
            break
            
    # Quick 1-second pause before recording starts
    time.sleep(1)
    
    # Record frames
    counter = 0
    while counter < dataset_size:
        ret, frame = cap.read()
        if not ret:
            continue
            
        cv2.putText(frame, f'Recording {word}: {counter}/{dataset_size}', (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)
        cv2.imshow('Custom Data Collection', frame)
        cv2.waitKey(25)

        img_name = os.path.join(class_path, f'{counter}.jpg')
        cv2.imwrite(img_name, frame)
        counter += 1

print("\nData collection complete! You can now run the training script.")
cap.release()
cv2.destroyAllWindows()
