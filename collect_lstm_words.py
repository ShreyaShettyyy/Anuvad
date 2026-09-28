import os
import cv2
import numpy as np
import json
import time

DATA_DIR = './lstm_dataset'
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Load the words you want to train for the LSTM model.
try:
    with open('words.json', 'r') as f:
        WORDS = json.load(f)
except Exception:
    print("Error: Could not load words.json")
    exit()

# Save the labels mapping
labels_dict = {i: word for i, word in enumerate(WORDS)}
with open('lstm_labels.json', 'w') as f:
    json.dump(labels_dict, f)

# LSTM Data Collection Parameters
no_sequences = 30    # Number of videos/sequences per word
sequence_length = 60 # Number of frames per sequence (2 seconds of motion)

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit()

print(f"Starting LSTM Data Collection for {len(WORDS)} dynamic words.")

for j, word in enumerate(WORDS):
    # Create a folder for each word
    word_path = os.path.join(DATA_DIR, str(j))
    if not os.path.exists(word_path):
        os.makedirs(word_path)

    print(f'\n--- Collecting data for: {word} ---')
    
    # Wait for the user to get ready
    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            continue
            
        cv2.putText(frame, f'Sign: {word}', (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
        cv2.putText(frame, 'Press "Q" to start recording sequences!', (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
        cv2.imshow('LSTM Data Collection', frame)

        if cv2.waitKey(25) == ord('q'):
            break

    # Loop through sequences (videos)
    for sequence in range(no_sequences):
        # Create a folder for each sequence
        sequence_path = os.path.join(word_path, str(sequence))
        if not os.path.exists(sequence_path):
            os.makedirs(sequence_path)
            
        # Loop through frames in the sequence
        for frame_num in range(sequence_length):
            ret, frame = cap.read()
            if not ret:
                continue

            if frame_num == 0: 
                cv2.putText(frame, 'GET READY...', (120, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 4, cv2.LINE_AA)
                cv2.putText(frame, f'Recording "{word}" - Video {sequence + 1}/{no_sequences}', (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2, cv2.LINE_AA)
                cv2.imshow('LSTM Data Collection', frame)
                cv2.waitKey(1000) # Wait 1 second before starting next sequence
            else: 
                cv2.putText(frame, f'Recording "{word}" - Video {sequence + 1}/{no_sequences}', (15, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2, cv2.LINE_AA)
                cv2.imshow('LSTM Data Collection', frame)

            img_name = os.path.join(sequence_path, f'{frame_num}.jpg')
            cv2.imwrite(img_name, frame)
            
            cv2.waitKey(10)

print("\nData collection complete! You can now run the LSTM training script.")
cap.release()
cv2.destroyAllWindows()
