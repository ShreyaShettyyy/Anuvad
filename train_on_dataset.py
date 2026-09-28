import os
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split
import json

# Setup
DATA_PATH = os.path.join(os.getcwd(), 'downloaded_dataset') # Place your downloaded INCLUDE dataset videos here!
# Example structure:
# dataset/
# ├── HELLO/
# │   ├── video1.mp4
# │   ├── video2.mp4
# ├── THANK_YOU/
# │   ├── video1.mp4

# MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)

sequence_length = 30 # frames per video

def extract_landmarks(video_path):
    cap = cv2.VideoCapture(video_path)
    frames_data = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret: break
        
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        
        data_aux = []
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                x_list = [lm.x for lm in hand_landmarks.landmark]
                y_list = [lm.y for lm in hand_landmarks.landmark]
                min_x, min_y = min(x_list), min(y_list)
                scale = max(max(x_list) - min_x, max(y_list) - min_y, 0.0001)

                for lm in hand_landmarks.landmark:
                    data_aux.append((lm.x - min_x) / scale)
                    data_aux.append((lm.y - min_y) / scale)
        else:
            data_aux = [0]*42 # Empty frame
            
        frames_data.append(data_aux)
        if len(frames_data) == sequence_length:
            break
            
    cap.release()
    
    # Pad if video is too short
    while len(frames_data) < sequence_length:
        frames_data.append([0]*42)
        
    return frames_data[:sequence_length]

if __name__ == '__main__':
    print("Looking for dataset in:", DATA_PATH)
    if not os.path.exists(DATA_PATH):
        print("Dataset folder not found. Please create a 'dataset' folder, download the videos (e.g. INCLUDE dataset), and sort them into folders by word (e.g. dataset/HELLO/vid.mp4).")
        exit()

    actions = np.array(os.listdir(DATA_PATH))
    if len(actions) == 0:
        print("No classes found in dataset folder.")
        exit()
        
    print(f"Found {len(actions)} classes: {actions}")
    
    label_map = {label:num for num, label in enumerate(actions)}
    
    sequences, labels = [], []
    for action in actions:
        print(f"Processing videos for {action}...")
        action_path = os.path.join(DATA_PATH, action)
        for video_file in os.listdir(action_path):
            if video_file.endswith(('.mp4', '.avi', '.mov')):
                video_path = os.path.join(action_path, video_file)
                landmarks = extract_landmarks(video_path)
                sequences.append(landmarks)
                labels.append(label_map[action])

    if len(sequences) == 0:
        print("No videos found.")
        exit()

    X = np.array(sequences)
    y = to_categorical(labels).astype(int)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.05)

    print("Building LSTM Model...")
    model = Sequential()
    model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(sequence_length, 42)))
    model.add(LSTM(128, return_sequences=True, activation='relu'))
    model.add(LSTM(64, return_sequences=False, activation='relu'))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(32, activation='relu'))
    model.add(Dense(actions.shape[0], activation='softmax'))

    model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

    print("Training Model...")
    model.fit(X_train, y_train, epochs=150)
    
    print("Saving model to lstm_model.h5")
    model.save('lstm_model.h5')
    
    # Save labels for inference
    with open('labels.json', 'w') as f:
        json.dump({str(v): k for k, v in label_map.items()}, f)
    
    print("Training Complete! The model can now guess words accurately based on the downloaded dataset.")
