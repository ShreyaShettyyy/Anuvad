import React, { useState, useRef, useEffect } from 'react';
import { Upload, Video, Play, Pause, Activity } from 'lucide-react';

export default function AnuvaadVideo() {
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sentence, setSentence] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setSentence('');
    }
  };

  useEffect(() => {
    if (videoFile) {
      processVideo();
    }
  }, [videoFile]);

  const loadDefaultTestVideo = async () => {
    try {
      const response = await fetch("/sample_test.mp4");
      const blob = await response.blob();
      const file = new File([blob], "sample_test.mp4", { type: "video/mp4" });
      setVideoFile(file);
      setVideoSrc("/sample_test.mp4");
      setSentence('');
    } catch (e) {
      console.error("Error loading test video", e);
    }
  };

  const processVideo = async () => {
    if (!videoFile) return;
    setIsProcessing(true);
    setSentence("Analyzing real video... (Awaiting Backend Integration)");

    const formData = new FormData();
    formData.append('video', videoFile);

    try {
      const response = await fetch('http://localhost:3000/api/predict_video', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setSentence(data.translation + (data.source === 'Local AI Fallback' ? ' (Fallback to Local 91-Word Advanced LSTM Model)' : ''));
        // We could also store data.raw if we want to show the raw gestures
      } else {
        setSentence("Error processing video: " + data.error);
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      setSentence("Failed to connect to AI translation server.");
    } finally {
      setIsProcessing(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="translator-layout">
      <div className="input-panel glass-panel" style={{ flex: 1 }}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2>Anuvaad Video - Upload & Predict</h2>
          </div>
        </div>
        
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {!videoSrc ? (
            <div 
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer'
              }}
            >
              <Upload size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} onClick={() => document.getElementById('video-upload').click()}/>
              <h3 style={{ marginBottom: '8px' }}>Upload Sign Language Video</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>Upload your own video to test the model.</p>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn-primary" onClick={() => document.getElementById('video-upload').click()}>
                  Browse Files
                </button>
                <button className="btn-secondary" onClick={loadDefaultTestVideo}>
                  Use Sample Test Video
                </button>
              </div>

              <input 
                type="file" 
                id="video-upload" 
                accept="video/*" 
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%', backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden' }}>
              <video 
                ref={videoRef}
                src={videoSrc}
                style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                onEnded={() => setIsPlaying(false)}
              />
              <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '30px' }}>
                <button onClick={togglePlay} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </button>
                <button onClick={() => { setVideoSrc(null); setVideoFile(null); setSentence(''); }} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                  Change Video
                </button>
              </div>
              {isProcessing && (
                <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', padding: '6px 12px', borderRadius: '8px', color: '#00ff88', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={12} className="pulse" />
                  Gemini AI Processing...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="output-panel glass-panel" style={{ flex: 1 }}>
        <div className="card-header">
          <h2>Sequence & NLP Output</h2>
        </div>
        
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase' }}>Gemini AI Translation</h4>
            <div style={{ padding: '24px', background: 'linear-gradient(145deg, rgba(29, 78, 216, 0.1), rgba(14, 165, 233, 0.1))', borderRadius: '16px', border: '1px solid rgba(14, 165, 233, 0.2)', minHeight: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: '600', color: 'var(--text-primary)', textAlign: 'center' }}>
                {sentence || "Upload and play a video to begin analysis."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
