import React, { useEffect, useRef, useState } from 'react'

export default function WebcamScreen() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const resultCanvasRef = useRef(null) // Canvas for drawing bounding boxes
  
  const [stream, setStream] = useState(null)
  const [capturedDataUrl, setCapturedDataUrl] = useState(null)
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [detections, setDetections] = useState([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState(null)

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
      const response = await fetch('http://localhost:4000/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Draw bounding boxes on canvas
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
      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.bbox_xyxy
        const w = x2 - x1
        const h = y2 - y1
        
        // Draw box
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 3
        ctx.strokeRect(x1, y1, w, h)
        
        // Draw label background
        const label = `${det.class_name} ${(det.confidence * 100).toFixed(1)}%`
        ctx.font = '16px Arial'
        const textWidth = ctx.measureText(label).width
        ctx.fillStyle = '#00ff00'
        ctx.fillRect(x1, y1 - 25, textWidth + 10, 25)
        
        // Draw label text
        ctx.fillStyle = '#000000'
        ctx.fillText(label, x1 + 5, y1 - 7)
      })
    }
    img.src = imageDataUrl
  }

  return (
    <div className="card">
      <h2>Webcam Detection</h2>

      <div className="section-title">Live Preview</div>
      <video ref={videoRef} playsInline muted></video>

      <div className="row" style={{ marginTop: 12 }}>
        <button onClick={handleCapture} disabled={isDetecting}>
          {isDetecting ? 'Detecting...' : 'Capture & Detect'}
        </button>
      </div>

      <div className="row" style={{ marginTop: 16 }}>
        <label className="file">
          <input type="file" accept="image/*" onChange={handleFileChange} />
          Upload Image
        </label>
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginTop: 12, padding: 12, background: '#1f1419', borderRadius: 8 }}>
          Error: {error}
        </div>
      )}

      {/* Hidden canvas for capturing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Results */}
      {detections.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="section-title">Detection Results ({detections.length} objects found)</div>
          <canvas ref={resultCanvasRef} style={{ width: '100%', borderRadius: 12, border: '1px solid #1f2a44' }} />
          
          <div style={{ marginTop: 12, fontSize: 14 }}>
            {detections.map((det, i) => (
              <div key={i} style={{ padding: 8, background: '#0b1220', marginBottom: 8, borderRadius: 8 }}>
                <strong>{det.class_name}</strong> - {(det.confidence * 100).toFixed(1)}% confidence
              </div>
            ))}
          </div>
        </div>
      )}

      {detections.length === 0 && !isDetecting && !error && (
        <div className="small" style={{ marginTop: 20 }}>
          Click "Capture & Detect" or upload an image to run object detection
        </div>
      )}
    </div>
  )
}