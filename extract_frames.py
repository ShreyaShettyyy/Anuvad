import sys
import cv2
import base64
import json

def extract_frames(video_path, num_frames=25):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(json.dumps({"error": "Cannot open video"}))
        return
        
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        total_frames = 30
        
    step = max(1, total_frames // num_frames)
    frames_b64 = []
    
    for i in range(num_frames):
        cap.set(cv2.CAP_PROP_POS_FRAMES, min(i * step, total_frames - 1))
        ret, frame = cap.read()
        if ret:
            frame = cv2.resize(frame, (640, 640))
            _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
            b64 = base64.b64encode(buffer).decode('utf-8')
            frames_b64.append(b64)
            
    cap.release()
    print(json.dumps({"frames": frames_b64}))

if __name__ == "__main__":
    extract_frames(sys.argv[1])
