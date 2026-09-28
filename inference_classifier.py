import pickle
import cv2
import mediapipe as mp
import numpy as np

try:
    model_dict = pickle.load(open('./model.p', 'rb'))
    model = model_dict['model']
except FileNotFoundError:
    print("Error: 'model.p' not found. Please run train_classifier.py first!")
    exit()

cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)


cv2.namedWindow('Sign Language Detector', cv2.WINDOW_NORMAL)
cv2.setWindowProperty('Sign Language Detector', cv2.WND_PROP_ASPECT_RATIO, cv2.WINDOW_FULLSCREEN)

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)

import json
try:
    with open('labels.json', 'r') as f:
        labels_dict = {int(k): v for k, v in json.load(f).items()}
except FileNotFoundError:
    print("Error: 'labels.json' not found!")
    labels_dict = {}

while True:
    data_aux = []
    x_list = []
    y_list = []

    ret, frame = cap.read()
    if not ret or frame is None:
        continue

    H, W, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks[:2]:
            mp_drawing.draw_landmarks(
                frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style())

            x_list_hand = [lm.x for lm in hand_landmarks.landmark]
            y_list_hand = [lm.y for lm in hand_landmarks.landmark]
            min_x_h = min(x_list_hand)
            min_y_h = min(y_list_hand)
            max_x_h = max(x_list_hand)
            max_y_h = max(y_list_hand)
            scale = max(max_x_h - min_x_h, max_y_h - min_y_h, 0.0001)

            for lm in hand_landmarks.landmark:
                data_aux.append((lm.x - min_x_h) / scale)
                data_aux.append((lm.y - min_y_h) / scale)

            x_list.extend(x_list_hand)
            y_list.extend(y_list_hand)

        if len(results.multi_hand_landmarks) == 1:
            data_aux.extend([0.0] * 42)

        if x_list and y_list:
            min_x = min(x_list)
            min_y = min(y_list)

            try:
                prediction = model.predict([np.asarray(data_aux)])
                predicted_character = labels_dict.get(int(prediction[0]), "?")

                x1, y1 = int(min_x * W) - 20, int(min_y * H) - 20
                x2, y2 = int(max(x_list) * W) + 20, int(max(y_list) * H) + 20

                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(W, x2), min(H, y2)

                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 0), 4)
                cv2.putText(frame, str(predicted_character), (x1, y1 - 12),
                            cv2.FONT_HERSHEY_DUPLEX, 1.4, (0, 0, 0), 3, cv2.LINE_AA)
            except Exception as e:
                pass

    cv2.imshow('Sign Language Detector', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()