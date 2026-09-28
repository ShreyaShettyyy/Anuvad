@echo off
echo ===========================================
echo   Training the Custom Word Model...
echo ===========================================
set PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python
.\.venv\Scripts\python.exe train_lstm_words.py
pause
