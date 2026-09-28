import os
import pickle
import mediapipe as mp
import cv2
import numpy as np
import json
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 1. First, create the landmarks (dataset creation)
print("Step 1: Extracting landmarks from collected images...")
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, min_detection_confidence=0.3)

DATA_DIR = './custom_dataset'
data = []
labels = []

for dir_ in os.listdir(DATA_DIR):
    class_path = os.path.join(DATA_DIR, dir_)
    if not os.path.isdir(class_path):
        continue
        
    for img_path in os.listdir(class_path):
        data_aux = []
        x_ = []
        y_ = []

        img = cv2.imread(os.path.join(class_path, img_path))
        if img is None: continue
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        results = hands.process(img_rgb)
        if results.multi_hand_landmarks:
            for hand_landmarks in results.multi_hand_landmarks:
                for i in range(len(hand_landmarks.landmark)):
                    x_.append(hand_landmarks.landmark[i].x)
                    y_.append(hand_landmarks.landmark[i].y)

                for i in range(len(hand_landmarks.landmark)):
                    data_aux.append(hand_landmarks.landmark[i].x - min(x_))
                    data_aux.append(hand_landmarks.landmark[i].y - min(y_))

            if len(data_aux) == 42: # 21 landmarks * 2 (x,y)
                data.append(data_aux)
                labels.append(int(dir_))

print(f"Extracted landmarks for {len(data)} images.")

# 2. Train the Random Forest Model
print("\nStep 2: Training the Random Forest model...")
data = np.asarray(data)
labels = np.asarray(labels)

x_train, x_test, y_train, y_test = train_test_split(data, labels, test_size=0.2, shuffle=True)

model = RandomForestClassifier()
model.fit(x_train, y_train)

y_predict = model.predict(x_test)
score = accuracy_score(y_predict, y_test)

print(f"\nTraining Complete! Model Accuracy: {score * 100:.2f}%")

# Save the model
with open('custom_model.p', 'wb') as f:
    pickle.dump({'model': model}, f)

print("Saved model to 'custom_model.p'")
print("\nSuccess! Now update server.js to use custom_model.p and custom_labels.json!")
