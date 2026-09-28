@echo off
echo ===========================================
echo   PHASE 1: Robust Dataset Download
echo ===========================================
.\.venv\Scripts\python.exe download_include.py

echo ===========================================
echo   PHASE 2: LSTM Model Training
echo ===========================================
.\.venv\Scripts\python.exe train_include_lstm.py

echo ===========================================
echo   ALL TASKS COMPLETED SUCCESSFULLY!
echo ===========================================
pause
