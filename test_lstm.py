import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
import numpy as np
import tensorflow as tf
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

print("[TEST] Loading LSTM Model...")
model = load_model('lstm_model.h5')
print("[TEST] LSTM Model loaded successfully!")

print("[TEST] Generating a fake sequence of 30 frames (42 landmarks each)...")
# Sequence of shape (1, 30, 42)
fake_sequence = np.random.rand(1, 30, 42)

print("[TEST] Running prediction...")
res = model.predict(fake_sequence)[0]
prediction_idx = np.argmax(res)
predicted_word = isl_words[prediction_idx]
confidence = res[prediction_idx] * 100

print(f"[SUCCESS] Test prediction complete!")
print(f"[SUCCESS] Predicted Gesture: {predicted_word}")
print(f"[SUCCESS] Confidence: {confidence:.2f}%")
