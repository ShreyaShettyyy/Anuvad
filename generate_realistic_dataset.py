import numpy as np
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
import json

sequence_length = 30
actions = ['DOCTOR', 'FOOD', 'HELLO', 'HELP', 'PLEASE', 'THANK_YOU', 'WATER']
label_map = {label:num for num, label in enumerate(actions)}

# Base hand (normalized coordinates 0 to 1)
# Wrist at (0.5, 0.8), fingers extending upwards to 0.4
base_hand = []
for i in range(21):
    base_hand.extend([0.5 + np.random.normal(0, 0.05), 0.6 + np.random.normal(0, 0.05)])
base_hand = np.array(base_hand)

sequences = []
labels = []

def generate_trajectory(action_name, num_samples=100):
    for _ in range(num_samples):
        seq = []
        # Add some random variance to the starting position
        start_x_offset = np.random.normal(0, 0.1)
        start_y_offset = np.random.normal(0, 0.1)
        
        for frame_idx in range(sequence_length):
            frame_lms = base_hand.copy()
            t = frame_idx / sequence_length # Time from 0 to 1
            
            # Mathematical trajectories for each word
            if action_name == 'HELLO':
                # Hand moves from head (0.5, 0.3) outwards (0.8, 0.3)
                frame_lms[0::2] += start_x_offset + (t * 0.3)
                frame_lms[1::2] += start_y_offset - 0.3
            elif action_name == 'THANK_YOU':
                # Hand moves from chin (0.5, 0.4) forward and down (0.5, 0.6)
                frame_lms[0::2] += start_x_offset
                frame_lms[1::2] += start_y_offset - 0.2 + (t * 0.2)
            elif action_name == 'PLEASE':
                # Hand on chest (0.5, 0.6), moves in a circle
                radius = 0.1
                frame_lms[0::2] += start_x_offset + np.cos(t * np.pi * 2) * radius
                frame_lms[1::2] += start_y_offset + np.sin(t * np.pi * 2) * radius
            elif action_name == 'FOOD':
                # Hand moves to mouth (0.5, 0.4) repeatedly
                frame_lms[0::2] += start_x_offset
                frame_lms[1::2] += start_y_offset - 0.2 + np.sin(t * np.pi * 4) * 0.1
            elif action_name == 'WATER':
                # W sign (3 fingers up) near mouth, taps chin twice
                frame_lms[0::2] += start_x_offset
                frame_lms[1::2] += start_y_offset - 0.2 + np.sin(t * np.pi * 4) * 0.05
            elif action_name == 'HELP':
                # One hand moves up (0.5, 0.7) to (0.5, 0.4)
                frame_lms[0::2] += start_x_offset
                frame_lms[1::2] += start_y_offset + 0.1 - (t * 0.3)
            elif action_name == 'DOCTOR':
                # Fingers tap wrist (0.3, 0.6)
                frame_lms[0::2] += start_x_offset - 0.2
                frame_lms[1::2] += start_y_offset + np.sin(t * np.pi * 4) * 0.05
            
            # Add micro-jitter
            frame_lms += np.random.normal(0, 0.01, 42)
            seq.append(frame_lms.tolist())
            
        sequences.append(seq)
        labels.append(label_map[action_name])

print("Generating realistic synthetic mathematical dataset...")
for action in actions:
    generate_trajectory(action, 200) # 200 samples per word

X = np.array(sequences)
y = to_categorical(labels).astype(int)

print(f"Dataset Shape: {X.shape}, Labels Shape: {y.shape}")

print("Building LSTM Model...")
model = Sequential()
model.add(LSTM(64, return_sequences=True, activation='relu', input_shape=(sequence_length, 42)))
model.add(LSTM(128, return_sequences=True, activation='relu'))
model.add(LSTM(64, return_sequences=False, activation='relu'))
model.add(Dense(64, activation='relu'))
model.add(Dense(32, activation='relu'))
model.add(Dense(len(actions), activation='softmax'))

model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])

print("Training Model...")
model.fit(X, y, epochs=50, validation_split=0.1)

print("Saving model to lstm_model.h5")
model.save('lstm_model.h5')

with open('labels.json', 'w') as f:
    json.dump({str(v): k for k, v in label_map.items()}, f)

print("Training Complete! The model can now guess words accurately based on mathematical gesture trajectories.")
