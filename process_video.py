import sys
import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model
import json
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

if len(sys.argv) < 2:
    print("Error: No video path provided")
    sys.exit(1)

video_path = sys.argv[1]

try:
    with open('labels.json', 'r') as f:
        label_map = json.load(f)
        # label_map is {"0": "DOCTOR", "1": "FOOD", ...}
except:
    print("Error: labels.json not found")
    sys.exit(1)

num_classes = len(label_map)

try:
    model = load_model('lstm_model.h5')
except:
    print("Error: lstm_model.h5 not found")
    sys.exit(1)

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)

cap = cv2.VideoCapture(video_path)
sequence_length = 30
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
        # If no hand, pad with 0s
        data_aux = [0]*42
        
    frames_data.append(data_aux)

cap.release()

if len(frames_data) == 0:
    print("No frames processed.")
    sys.exit(0)

# Process in chunks of 30 frames
predictions = []
threshold = 0.6

# We'll stride through the video
stride = 15
for i in range(0, len(frames_data) - sequence_length + 1, stride):
    seq = frames_data[i:i+sequence_length]
    seq_np = np.expand_dims(seq, axis=0)
    res = model.predict(seq_np, verbose=0)[0]
    idx = np.argmax(res)
    if res[idx] > threshold:
        predicted_word = label_map[str(idx)]
        if len(predictions) == 0 or predictions[-1] != predicted_word:
            predictions.append(predicted_word)

if len(predictions) == 0:
    print("No gestures confidently detected.")
else:
    print(" ".join(predictions))
