import cv2
import numpy as np

# Create a video writer object
# 30 fps, 640x480 resolution
fourcc = cv2.VideoWriter_fourcc(*'mp4v')
out = cv2.VideoWriter('dashboard/public/sample_test.mp4', fourcc, 30.0, (640, 480))

words = ["I", "WANT", "GO", "HOSPITAL"]
colors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0)]

# Generate 30 frames (1 second) for each word
for i, word in enumerate(words):
    for frame_idx in range(30):
        # Create a black image
        frame = np.zeros((480, 640, 3), dtype=np.uint8)
        
        # Add text
        font = cv2.FONT_HERSHEY_SIMPLEX
        text_size = cv2.getTextSize(word, font, 3, 5)[0]
        text_x = (640 - text_size[0]) // 2
        text_y = (480 + text_size[1]) // 2
        
        cv2.putText(frame, word, (text_x, text_y), font, 3, colors[i], 5, cv2.LINE_AA)
        
        # Write the frame
        out.write(frame)

# Generate 30 blank frames at the end
for _ in range(30):
    frame = np.zeros((480, 640, 3), dtype=np.uint8)
    out.write(frame)

out.release()
print("Generated sample_test.mp4 in dashboard/public successfully.")
