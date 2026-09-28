import os
import cv2
import yt_dlp
import numpy as np
import mediapipe as mp
from tensorflow.keras.utils import to_categorical
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from sklearn.model_selection import train_test_split
import json

# ========================================================
# 1. DATASET DEFINITION (YouTube Links for Sign Language)
# ========================================================
# Replace these with actual short YouTube video links of ISL signs
dataset_links = {
    "HELLO": "https://www.youtube.com/watch?v=Fq2CjcX09f4",       # Example ASL/ISL Hello
    "THANK_YOU": "https://www.youtube.com/watch?v=5z-U6-D8zvw",
    "PLEASE": "https://www.youtube.com/watch?v=1b-3F2yB338",
    "HELP": "https://www.youtube.com/watch?v=_uYQz1TzPCE",
    "WATER": "https://www.youtube.com/watch?v=7z90K9Q_MGA",
    "FOOD": "https://www.youtube.com/watch?v=Xz2Q26g_q3s",
    "DOCTOR": "https://www.youtube.com/watch?v=5h9G8k2D7_A"
}

DATA_DIR = "downloaded_dataset"
os.makedirs(DATA_DIR, exist_ok=True)

# ========================================================
# 2. DOWNLOAD VIDEOS AUTOMATICALLY
# ========================================================
def download_videos():
    print("--- DOWNLOADING DATASET ---")
    for word, url in dataset_links.items():
        word_dir = os.path.join(DATA_DIR, word)
        os.makedirs(word_dir, exist_ok=True)
        
        # Check if already downloaded
        if len(os.listdir(word_dir)) > 0:
            print(f"[{word}] Already downloaded.")
            continue
            
        print(f"Downloading {word} from {url}...")
        ydl_opts = {
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4',
            'outtmpl': f'{word_dir}/video.%(ext)s',
            'quiet': True,
            'no_warnings': True
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
        except Exception as e:
            print(f"Failed to download {word}: {e}")

# ========================================================
# 3. EXTRACT MEDIAPIPE LANDMARKS
# ========================================================
sequence_length = 30
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)

def augment_landmarks(landmarks):
    """Add slight noise to landmarks to artificially increase dataset size"""
    noise = np.random.normal(0, 0.01, len(landmarks))
    return list(np.array(landmarks) + noise)

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
        if len(frames_data) >= sequence_length:
            break
            
    cap.release()
    
    # Pad if video is too short
    while len(frames_data) < sequence_length:
        frames_data.append([0]*42)
        
    return frames_data[:sequence_length]

# ========================================================
# 4. TRAIN THE LSTM MODEL
# ========================================================
def train_model():
    print("--- EXTRACTING FEATURES ---")
    actions = list(dataset_links.keys())
    label_map = {label:num for num, label in enumerate(actions)}
    
    sequences, labels = [], []
    for action in actions:
        action_path = os.path.join(DATA_DIR, action)
        if not os.path.exists(action_path): continue
            
        for video_file in os.listdir(action_path):
            if video_file.endswith('.mp4'):
                video_path = os.path.join(action_path, video_file)
                base_landmarks = extract_landmarks(video_path)
                
                # Data augmentation: Generate 20 variations of each video's landmarks
                for _ in range(20):
                    augmented_seq = [augment_landmarks(frame) if sum(frame) != 0 else frame for frame in base_landmarks]
                    sequences.append(augmented_seq)
                    labels.append(label_map[action])
                    
    if len(sequences) == 0:
        print("No data extracted. Ensure videos downloaded correctly.")
        return

    X = np.array(sequences)
    y = to_categorical(labels).astype(int)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.1)

    print("--- TRAINING LSTM MODEL ---")
    model = Sequential([
        LSTM(64, return_sequences=True, activation='relu', input_shape=(sequence_length, 42)),
        LSTM(128, return_sequences=True, activation='relu'),
        LSTM(64, return_sequences=False, activation='relu'),
        Dense(64, activation='relu'),
        Dense(32, activation='relu'),
        Dense(len(actions), activation='softmax')
    ])

    model.compile(optimizer='Adam', loss='categorical_crossentropy', metrics=['categorical_accuracy'])
    model.fit(X_train, y_train, epochs=100)
    
    print("--- SAVING MODEL ---")
    model.save('lstm_model.h5')
    with open('labels.json', 'w') as f:
        json.dump({str(v): k for k, v in label_map.items()}, f)
    print("Fully Automated Training Complete!")

if __name__ == '__main__':
    download_videos()
    train_model()
