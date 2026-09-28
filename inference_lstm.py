import cv2
import numpy as np
import mediapipe as mp
from tensorflow.keras.models import load_model

isl_words = [
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    '1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20',
    'HELLO', 'HOW', 'ARE', 'YOU', 'THANK', 'PLEASE', 'GOODBYE', 'YES', 'NO', 'LOVE', 'MORNING', 
    'AFTERNOON', 'WHY', 'WHAT', 'WHERE', 'WHEN', 'WHO', 'WATER', 'FOOD', 'EAT', 'DRINK', 'MORE', 
    'LESS', 'SIT', 'STAND', 'HOSPITAL', 'GO', 'WANT', 'NEED', 'HELP', 'DOCTOR', 'NURSE', 
    'MEDICINE', 'PAIN', 'SICK', 'FEVER', 'COUGH', 'COLD', 'HOT', 'WARM', 'SLEEP', 'WAKE', 
    'WORK', 'PLAY', 'HOME', 'SCHOOL', 'CAR', 'BUS', 'TRAIN', 'AIRPLANE', 'TIME', 'DAY', 
    'NIGHT', 'WEEK', 'MONTH', 'YEAR', 'TODAY', 'TOMORROW', 'YESTERDAY', 'HAPPY', 'SAD', 
    'ANGRY', 'EXCITED', 'TIRED', 'HUNGRY', 'THIRSTY', 'FRIEND', 'FAMILY', 'MOTHER', 'FATHER', 
    'BROTHER', 'SISTER', 'SON', 'DAUGHTER', 'BABY', 'MAN', 'WOMAN', 'BOY', 'GIRL', 'DOG', 
    'CAT', 'BIRD', 'FISH', 'HORSE', 'COW', 'PIG', 'SHEEP', 'BOOK', 'PAPER', 'PEN', 'PENCIL', 
    'COMPUTER', 'PHONE', 'INTERNET', 'WEBSITE', 'EMAIL', 'MESSAGE', 'CALL', 'TEXT', 'READ', 
    'WRITE', 'LEARN', 'STUDY', 'TEACH', 'TEACHER', 'STUDENT', 'CLASS', 'TEST', 'EXAM', 'PASS', 
    'FAIL', 'GOOD', 'BAD', 'RIGHT', 'WRONG', 'TRUE', 'FALSE', 'BIG', 'SMALL', 'TALL', 'SHORT', 
    'LONG', 'FAST', 'SLOW', 'NEW', 'OLD', 'YOUNG', 'BEAUTIFUL', 'UGLY', 'CLEAN', 'DIRTY', 
    'HOT', 'COLD', 'WET', 'DRY', 'HARD', 'SOFT', 'HEAVY', 'LIGHT', 'COLOR', 'RED', 'BLUE', 
    'GREEN', 'YELLOW', 'ORANGE', 'PURPLE', 'BLACK', 'WHITE', 'GRAY', 'BROWN', 'PINK', 'MONEY', 
    'DOLLAR', 'CENT', 'PRICE', 'COST', 'BUY', 'SELL', 'STORE', 'SHOP', 'MARKET', 'RESTAURANT', 
    'CAFE', 'BAR', 'HOTEL', 'MOTEL', 'ROOM', 'BED', 'CHAIR', 'TABLE', 'DESK', 'DOOR', 'WINDOW', 
    'HOUSE', 'APARTMENT', 'BUILDING', 'CITY', 'TOWN', 'VILLAGE', 'COUNTRY', 'STATE', 'PROVINCE', 
    'STREET', 'ROAD', 'HIGHWAY', 'BRIDGE', 'RIVER', 'LAKE', 'OCEAN', 'SEA', 'MOUNTAIN'
]

try:
    model = load_model('lstm_model.h5')
    print("LSTM model loaded successfully.")
except Exception as e:
    print("Error loading LSTM model:", e)
    exit()

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=1, min_detection_confidence=0.5)

cap = cv2.VideoCapture(0)
sequence = []
predictions = []
threshold = 0.6

cv2.namedWindow('LSTM Real-time Gesture Detection', cv2.WINDOW_NORMAL)

while True:
    ret, frame = cap.read()
    if not ret: break

    H, W, _ = frame.shape
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = hands.process(frame_rgb)
    
    data_aux = []

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_drawing.draw_landmarks(
                frame, hand_landmarks, mp_hands.HAND_CONNECTIONS,
                mp_drawing_styles.get_default_hand_landmarks_style(),
                mp_drawing_styles.get_default_hand_connections_style())

            x_list_hand = [lm.x for lm in hand_landmarks.landmark]
            y_list_hand = [lm.y for lm in hand_landmarks.landmark]
            min_x_h = min(x_list_hand)
            min_y_h = min(y_list_hand)
            scale = max(max(x_list_hand) - min_x_h, max(y_list_hand) - min_y_h, 0.0001)

            for lm in hand_landmarks.landmark:
                data_aux.append((lm.x - min_x_h) / scale)
                data_aux.append((lm.y - min_y_h) / scale)
        
        sequence.append(data_aux)
        sequence = sequence[-30:] # Maintain 30 frame stream
        
        if len(sequence) == 30:
            res = model.predict(np.expand_dims(sequence, axis=0))[0]
            prediction_idx = np.argmax(res)
            
            if res[prediction_idx] > threshold:
                predicted_word = isl_words[prediction_idx]
                
                # Simple smoothing
                if len(predictions) > 0:
                    if predicted_word != predictions[-1]:
                        predictions.append(predicted_word)
                else:
                    predictions.append(predicted_word)

            if len(predictions) > 5:
                predictions = predictions[-5:]

            cv2.rectangle(frame, (0, 0), (640, 40), (245, 117, 16), -1)
            cv2.putText(frame, ' '.join(predictions), (3, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)
            
            # Show confidence
            cv2.putText(frame, f"{res[prediction_idx]*100:.1f}%", (10, H - 20),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2, cv2.LINE_AA)
    
    else:
        # Clear sequence if hands are lost for a bit
        pass

    cv2.imshow('LSTM Real-time Gesture Detection', frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
