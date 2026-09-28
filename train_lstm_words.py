import os
import cv2
import numpy as np
import mediapipe as mp
import json
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import TensorBoard, EarlyStopping
from tensorflow.keras.utils import to_categorical
from sklearn.model_selection import train_test_split

print("Step 1: Extracting landmarks from collected video sequences...")

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)

DATA_DIR = './lstm_dataset'
no_sequences = 30
sequence_length = 60

# Load labels
with open('lstm_labels.json', 'r') as f:
    labels_dict = {int(k): v for k, v in json.load(f).items()}
num_classes = len(labels_dict)

sequences, labels = [], []

for word_idx in range(num_classes):
    word_dir = os.path.join(DATA_DIR, str(word_idx))
    if not os.path.exists(word_dir):
        continue
        
    for sequence in range(no_sequences):
        window = []
        sequence_dir = os.path.join(word_dir, str(sequence))
        if not os.path.exists(sequence_dir):
            continue
            
        for frame_num in range(sequence_length):
            img_path = os.path.join(sequence_dir, f'{frame_num}.jpg')
            img = cv2.imread(img_path)
            if img is None:
                # If frame missing, pad with zeros
                window.append(np.zeros(42))
                continue
                
            img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            results = hands.process(img_rgb)
            
            data_aux = []
            x_ = []
            y_ = []
            
            if results.multi_hand_landmarks:
                # Just take the first hand for consistency
                hand_landmarks = results.multi_hand_landmarks[0]
                for i in range(len(hand_landmarks.landmark)):
                    x_.append(hand_landmarks.landmark[i].x)
                    y_.append(hand_landmarks.landmark[i].y)
                
                for i in range(len(hand_landmarks.landmark)):
                    data_aux.append(hand_landmarks.landmark[i].x - min(x_))
                    data_aux.append(hand_landmarks.landmark[i].y - min(y_))
            if len(data_aux) == 42:
                window.append(data_aux)
            
        if len(window) == sequence_length:
            sequences.append(window)
            labels.append(word_idx)

print(f"Extracted features for {len(sequences)} original video sequences.")

# --- DATA AUGMENTATION ---
# To prevent "overfitting" (memorizing a small dataset), we artificially multiply the dataset.
# We do this by adding slight mathematical noise and scaling to simulate different hand positions/speeds.
print("Applying Data Augmentation to prevent overfitting...")
augmented_sequences = []
augmented_labels = []

for seq, label in zip(sequences, labels):
    # 1. Add the original sequence
    augmented_sequences.append(seq)
    augmented_labels.append(label)
    
    # 2. Add 4 variations of the sequence with slight random noise (simulating shaky hands/different angles)
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
y = to_categorical(labels, num_classes=num_classes).astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1)

# Build LSTM Architecture
model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(sequence_length, 42)))
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(num_classes, activation='softmax'))

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

# Early stopping to prevent overfitting
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)

model.fit(X_train, y_train, epochs=100, validation_split=0.1, callbacks=[early_stopping])

print("\nStep 3: Evaluating Model...")
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Test Accuracy: {accuracy * 100:.2f}%")

# Save the model
model.save('lstm_model_custom.h5')
print("Saved neural network to 'lstm_model_custom.h5'")
print("\nSuccess! Your Advanced LSTM Model is fully trained.")
