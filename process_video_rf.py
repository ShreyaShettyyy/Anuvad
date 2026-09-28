import sys
import pickle
import cv2
import mediapipe as mp
import numpy as np
import json
from collections import Counter
import os

def process_video(video_path):
    # Suppress tensorflow/mediapipe warnings
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
    
    try:
        model_dict = pickle.load(open('custom_model.p', 'rb'))
        model = model_dict['model']
    except Exception as e:
        print(f"Error loading model: {e}", file=sys.stderr)
        return
        
    try:
        with open('custom_labels.json', 'r') as f:
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

    predictions = []

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
            for hand_landmarks in results.multi_hand_landmarks:
                for i in range(len(hand_landmarks.landmark)):
                    x_.append(hand_landmarks.landmark[i].x)
                    y_.append(hand_landmarks.landmark[i].y)

                for i in range(len(hand_landmarks.landmark)):
                    data_aux.append(hand_landmarks.landmark[i].x - min(x_))
                    data_aux.append(hand_landmarks.landmark[i].y - min(y_))

            if len(data_aux) == 42:
                try:
                    prediction = model.predict([np.asarray(data_aux)])
                    predicted_character = labels_dict.get(int(prediction[0]), "?")
                    predictions.append(predicted_character)
                except Exception as e:
                    pass

    cap.release()
    hands.close()

    if not predictions:
        print("NO_HANDS_DETECTED")
        return

    # Get the most common prediction across all frames
    most_common = Counter(predictions).most_common(1)[0][0]
    print(most_common)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_video_rf.py <video_path>", file=sys.stderr)
        sys.exit(1)
    
    video_path = sys.argv[1]
    process_video(video_path)
