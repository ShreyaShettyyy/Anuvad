import os
import cv2
import numpy as np
import mediapipe as mp
import json
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

print("Step 1: Setting up MediaPipe and preparing to extract real human landmarks...")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)

DATA_DIR = './include_dataset'
sequence_length = 60

sequences = []
labels = []
label_map = {}
current_label_id = 0

# Zenodo INCLUDE structure after unzip: include_dataset/word_name/video.mp4
# Some words might be inside subdirectories, so we walk the directory tree.
video_files = []
for root, dirs, files in os.walk(DATA_DIR):
    for file in files:
        if file.lower().endswith((".mp4", ".avi", ".mov")):
            video_files.append(os.path.join(root, file))

if not video_files:
    print(f"Error: No video files found in {DATA_DIR}. Please run download_include.py first.")
    exit()

print(f"Found {len(video_files)} professional video recordings to process. This will take some time.")

# Group videos by word (which is usually the parent folder name)
for video_path in video_files:
    # Get the parent folder name which represents the word (e.g., 'Hello', 'Please')
    word_name = os.path.basename(os.path.dirname(video_path)).upper()
    
    if word_name not in label_map:
        label_map[word_name] = current_label_id
        current_label_id += 1
        
    word_idx = label_map[word_name]
    
    cap = cv2.VideoCapture(video_path)
    window = []
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = hands.process(frame_rgb)
        
        data_aux = []
        x_ = []
        y_ = []
        
        if results.multi_hand_landmarks:
            hand_landmarks = results.multi_hand_landmarks[0]
            for i in range(len(hand_landmarks.landmark)):
                x_.append(hand_landmarks.landmark[i].x)
                y_.append(hand_landmarks.landmark[i].y)
            
            for i in range(len(hand_landmarks.landmark)):
                data_aux.append(hand_landmarks.landmark[i].x - min(x_))
                data_aux.append(hand_landmarks.landmark[i].y - min(y_))
        
        if len(data_aux) == 42:
            window.append(data_aux)

    cap.release()
    
    # Pad or truncate to exact sequence length (60 frames / 2 seconds)
    if len(window) > 0:
        window = window[-sequence_length:]
        while len(window) < sequence_length:
            window.insert(0, list(np.zeros(42)))
        sequences.append(window)
        labels.append(word_idx)

print(f"\nSuccessfully extracted MediaPipe landmarks for {len(sequences)} real videos across {len(label_map)} distinct words!")

# --- DATA AUGMENTATION ---
print("Applying Data Augmentation (simulating slight hand variations to prevent overfitting)...")
augmented_sequences = []
augmented_labels = []

for seq, label in zip(sequences, labels):
    augmented_sequences.append(seq)
    augmented_labels.append(label)
    
    # Generate 4 variations for every real video
    for _ in range(4):
        noise = np.random.normal(0, 0.02, (sequence_length, 42))
        noisy_seq = np.array(seq) + noise
        augmented_sequences.append(noisy_seq.tolist())
        augmented_labels.append(label)

sequences = augmented_sequences
labels = augmented_labels
print(f"Dataset expanded to {len(sequences)} sequences via augmentation.")
# -------------------------

print("\nStep 2: Training the LSTM Neural Network...")
X = np.array(sequences)
num_classes = len(label_map)
y = to_categorical(labels, num_classes=num_classes).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1)

model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(sequence_length, 42)))
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(num_classes, activation='softmax'))

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

model.fit(X_train, y_train, epochs=100, validation_split=0.1, callbacks=[early_stopping])

print("\nStep 3: Evaluating Model...")
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy * 100:.2f}%")

model.save('lstm_model_custom.h5')
with open('lstm_labels.json', 'w') as f:
    json.dump({int(v): k for k, v in label_map.items()}, f)

print("Saved model to 'lstm_model_custom.h5' and labels to 'lstm_labels.json'.")
print("SUCCESS: Your professional, real-human dataset is now fully trained and integrated!")
