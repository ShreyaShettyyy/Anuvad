import sys
import cv2
import mediapipe as mp
import numpy as np
import json
import os
from tensorflow.keras.models import load_model

def process_video(video_path):
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    
    try:
        model = load_model('lstm_model_custom.h5')
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        return
        
    try:
        with open('lstm_labels.json', 'r') as f:
            labels_dict = {int(k): v for k, v in json.load(f).items()}
    except Exception as e:
        print(f"Error loading labels: {e}", file=sys.stderr)
        return

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video {video_path}", file=sys.stderr)
        return

    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=False, min_detection_confidence=0.5)

    sequence = []
    
    # We will grab all frames and make a prediction on the 30-frame sequence
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
        else:
            data_aux = list(np.zeros(42))

        sequence.append(data_aux)

    cap.release()
    hands.close()

    if not sequence:
        print("NO_HANDS_DETECTED")
        return

    # Pad or truncate the sequence to exactly 60 frames
    sequence = sequence[-60:] # Take the last 60 frames
    while len(sequence) < 60:
        sequence.insert(0, list(np.zeros(42)))

    try:
        res = model.predict(np.expand_dims(sequence, axis=0), verbose=0)[0]
        predicted_word = labels_dict[np.argmax(res)]
        
        # Always output the best guess for the presentation!
        print(predicted_word)
    except Exception as e:
        pass

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_video_lstm.py <video_path>", file=sys.stderr)
        sys.exit(1)
    
    video_path = sys.argv[1]
    process_video(video_path)
