import React, { useEffect, useRef, useState } from 'react'

export default function WebcamScreen({ onViewHistory }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resultCanvasRef = useRef(null)
  
  const [stream, setStream] = useState(null)
  const [capturedDataUrl, setCapturedDataUrl] = useState(null)
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [detections, setDetections] = useState([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [lastCaptureTime, setLastCaptureTime] = useState(0)
  const CAPTURE_COOLDOWN = 5000 // 5 seconds between captures

  // Start camera on mount
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        })
        if (!active) return
        setStream(s)
        if (videoRef.current) {
          videoRef.current.srcObject = s
          await videoRef.current.play()
          setCameraReady(true)
        }
      } catch (err) {
        console.error('Camera error:', err)
        alert('Could not access camera. Check permissions and try again.')
      }
    })()
    
    return () => {
      active = false
      if (stream) {
        stream.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Capture current frame and auto-detect
  const handleCapture = async () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    const w = video.videoWidth || 1280
    const h = video.videoHeight || 720
    canvas.width = w
    canvas.height = h

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, w, h)
    const dataUrl = canvas.toDataURL('image/png')
    setCapturedDataUrl(dataUrl)
    
    // Automatically detect objects after capture
    await detectObjects(dataUrl)
  }

  // Handle file upload and auto-detect
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    
    const reader = new FileReader()
    reader.onload = async (event) => {
      const dataUrl = event.target.result
      setUploadedPreviewUrl(dataUrl)
      // Automatically detect objects after upload
      await detectObjects(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  // Send image to detection API
  const detectObjects = async (imageDataUrl) => {
    setIsDetecting(true)
    setError(null)
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:4000/api/detect', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          image_base64: imageDataUrl,
          conf: 0.25,
          imgsz: 640
        })
      })

      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Detections:', data)
      setDetections(data.detections || [])
      
      // Draw bounding boxes
      drawBoundingBoxes(imageDataUrl, data.detections || [])
    } catch (err) {
      console.error('Detection error:', err)
      setError(err.message)
    } finally {
      setIsDetecting(false)
    }
  }

  // Draw bounding boxes on canvas with improved styling
  const drawBoundingBoxes = (imageDataUrl, detections) => {
    const canvas = resultCanvasRef.current
    if (!canvas) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      
      // Draw original image
      ctx.drawImage(img, 0, 0)
      
      // Draw each detection
      detections.forEach((det, index) => {
        const [x1, y1, x2, y2] = det.bbox_xyxy
        const w = x2 - x1
        const h = y2 - y1
        
        // Color palette for multiple detections
        const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
        const color = colors[index % colors.length]
        
        // Draw box with shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
        ctx.shadowBlur = 8
        ctx.strokeStyle = color
        ctx.lineWidth = 4
        ctx.strokeRect(x1, y1, w, h)
        ctx.shadowBlur = 0
        
        // Draw label background
        const label = `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`
        ctx.font = 'bold 18px Inter, Arial'
        const textWidth = ctx.measureText(label).width
        const padding = 12
        
        ctx.fillStyle = color
        ctx.fillRect(x1, y1 - 36, textWidth + padding * 2, 36)
        
        // Draw label text
        ctx.fillStyle = '#ffffff'
        ctx.fillText(label, x1 + padding, y1 - 12)
      })
    }
    img.src = imageDataUrl
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2> Foot Detection and Classification</h2>
        {cameraReady && <span className="status-badge">Camera Ready</span>}
      </div>

      <div className="section-title">📹 Live Camera Feed</div>
      <video ref={videoRef} playsInline muted></video>

      <div className="row" style={{ marginTop: 16 }}>
        <button onClick={handleCapture} disabled={isDetecting || !cameraReady}>
          {isDetecting ? (
            <><span className="loading"></span>Detecting...</>
          ) : (
            '📸 Capture & Detect'
          )}
        </button>
        
        <label className="file">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          Upload Image
        </label>

        <button className="secondary" onClick={onViewHistory}>
           View History
        </button>
      </div>

      {error && (
        <div className="error-box">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Results */}
      {detections.length > 0 && (
        <div style={{ marginTop: 28 }}>
          <div className="section-title">
             Detection Results ({detections.length} {detections.length === 1 ? 'object' : 'objects'} found)
          </div>
          <canvas ref={resultCanvasRef} style={{ width: '100%', borderRadius: 12, border: '2px solid #1f2937', marginBottom: 16 }} />
          
          <div>
            {detections.map((det, i) => (
              <div key={i} className="detection-item">
                <strong> {det.class_name}</strong>
                <span className="confidence">{(det.confidence * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {detections.length === 0 && !isDetecting && !error && (
        <div className="small" style={{ marginTop: 24, textAlign: 'center', padding: 20, background: 'rgba(59, 130, 246, 0.05)', borderRadius: 10 }}>
          💡 <strong>Tip:</strong> Click "Capture & Detect" to analyze the camera feed, or upload an image to get started
        </div>
      )}
    </div>
  )
}