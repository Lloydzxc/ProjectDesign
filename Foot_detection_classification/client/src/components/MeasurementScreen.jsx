// File: client/src/components/MeasurementScreen.jsx
// Enhanced with webcam support and shoe size recommendations
import React, { useState, useRef, useEffect } from 'react';

// A4 paper dimensions in millimeters
const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MM_TO_INCHES = 0.0393701;

// Shoe size conversion tables based on foot length in inches
const SIZE_TABLES = {
  US: {
    men: [
      { length: 9.25, size: 6 }, { length: 9.5, size: 6.5 }, { length: 9.625, size: 7 },
      { length: 9.75, size: 7.5 }, { length: 9.9375, size: 8 }, { length: 10.125, size: 8.5 },
      { length: 10.25, size: 9 }, { length: 10.4375, size: 9.5 }, { length: 10.5625, size: 10 },
      { length: 10.75, size: 10.5 }, { length: 10.9375, size: 11 }, { length: 11.125, size: 11.5 },
      { length: 11.25, size: 12 }, { length: 11.5625, size: 13 }, { length: 11.875, size: 14 },
      { length: 12.1875, size: 15 }, { length: 12.5, size: 16 }
    ],
    women: [
      { length: 8.1875, size: 4 }, { length: 8.375, size: 4.5 }, { length: 8.5, size: 5 },
      { length: 8.75, size: 5.5 }, { length: 8.875, size: 6 }, { length: 9.0625, size: 6.5 },
      { length: 9.25, size: 7 }, { length: 9.375, size: 7.5 }, { length: 9.5, size: 8 },
      { length: 9.6875, size: 8.5 }, { length: 9.875, size: 9 }, { length: 10, size: 9.5 },
      { length: 10.1875, size: 10 }, { length: 10.3125, size: 10.5 }, { length: 10.5, size: 11 },
      { length: 10.6875, size: 11.5 }, { length: 10.875, size: 12 }
    ]
  },
  UK: {
    men: [
      { length: 9.25, size: 5.5 }, { length: 9.5, size: 6 }, { length: 9.625, size: 6.5 },
      { length: 9.75, size: 7 }, { length: 9.9375, size: 7.5 }, { length: 10.125, size: 8 },
      { length: 10.25, size: 8.5 }, { length: 10.4375, size: 9 }, { length: 10.5625, size: 9.5 },
      { length: 10.75, size: 10 }, { length: 10.9375, size: 10.5 }, { length: 11.125, size: 11 },
      { length: 11.25, size: 11.5 }, { length: 11.5625, size: 12.5 }, { length: 11.875, size: 13.5 },
      { length: 12.1875, size: 14.5 }, { length: 12.5, size: 15.5 }
    ],
    women: [
      { length: 8.1875, size: 2 }, { length: 8.375, size: 2.5 }, { length: 8.5, size: 3 },
      { length: 8.75, size: 3.5 }, { length: 8.875, size: 4 }, { length: 9.0625, size: 4.5 },
      { length: 9.25, size: 5 }, { length: 9.375, size: 5.5 }, { length: 9.5, size: 6 },
      { length: 9.6875, size: 6.5 }, { length: 9.875, size: 7 }, { length: 10, size: 7.5 },
      { length: 10.1875, size: 8 }, { length: 10.3125, size: 8.5 }, { length: 10.5, size: 9 },
      { length: 10.6875, size: 9.5 }, { length: 10.875, size: 10 }
    ]
  },
  EU: {
    men: [
      { length: 9.25, size: 39 }, { length: 9.5, size: 39 }, { length: 9.625, size: 40 },
      { length: 9.75, size: 40.5 }, { length: 9.9375, size: 41 }, { length: 10.125, size: 41.5 },
      { length: 10.25, size: 42 }, { length: 10.4375, size: 42.5 }, { length: 10.5625, size: 43 },
      { length: 10.75, size: 43.5 }, { length: 10.9375, size: 44 }, { length: 11.125, size: 44.5 },
      { length: 11.25, size: 45 }, { length: 11.5625, size: 46 }, { length: 11.875, size: 47 },
      { length: 12.1875, size: 48 }, { length: 12.5, size: 49 }
    ],
    women: [
      { length: 8.1875, size: 35 }, { length: 8.375, size: 35 }, { length: 8.5, size: 35.5 },
      { length: 8.75, size: 36 }, { length: 8.875, size: 36.5 }, { length: 9.0625, size: 37 },
      { length: 9.25, size: 37.5 }, { length: 9.375, size: 38 }, { length: 9.5, size: 38.5 },
      { length: 9.6875, size: 39 }, { length: 9.875, size: 39.5 }, { length: 10, size: 40 },
      { length: 10.1875, size: 40.5 }, { length: 10.3125, size: 41 }, { length: 10.5, size: 41.5 },
      { length: 10.6875, size: 42 }, { length: 10.875, size: 42.5 }
    ]
  }
};

export default function MeasurementScreen({ onBack }) {
  const [image, setImage] = useState(null);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState('US');
  const [useWebcam, setUseWebcam] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const captureCanvasRef = useRef(null);

  // Start webcam
  useEffect(() => {
    if (!useWebcam) return;

    let active = true;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        if (!active) return;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
          setCameraReady(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setError('Could not access camera. Please check permissions.');
        setUseWebcam(false);
      }
    })();

    return () => {
      active = false;
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [useWebcam]);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [stream]);

  // Capture from webcam
  const handleWebcamCapture = () => {
    const video = videoRef.current;
    const canvas = captureCanvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1920;
    const h = video.videoHeight || 1080;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    
    setImage(dataUrl);
    setUseWebcam(false);
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    setCameraReady(false);
    setResults([]);
    setError(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setResults([]);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const loadImageData = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const findBoundingBox = (imageData, threshold = 100) => {
    const { width, height, data } = imageData;
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let foundPixels = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = data[idx] + data[idx + 1] + data[idx + 2];
        
        if (brightness < threshold * 3) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          foundPixels++;
        }
      }
    }
    
    if (foundPixels < 1000) return null;
    
    return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
  };

  const findA4Paper = (imageData) => {
    const { width, height, data } = imageData;
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let foundPixels = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = data[idx] + data[idx + 1] + data[idx + 2];
        
        if (brightness > 600) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          foundPixels++;
        }
      }
    }
    
    if (foundPixels < 5000) return null;
    
    const paperWidth = maxX - minX;
    const paperHeight = maxY - minY;
    const isPortrait = paperHeight > paperWidth;
    const referenceWidthMm = isPortrait ? A4_WIDTH_MM : A4_HEIGHT_MM;
    const pixelToMm = referenceWidthMm / paperWidth;
    
    return { minX, maxX, minY, maxY, pixelToMm, paperWidth, paperHeight };
  };

  const algorithm1_ContourBased = async (imageData) => {
    try {
      const a4Paper = findA4Paper(imageData);
      if (!a4Paper) {
        return { error: 'A4 paper not detected. Ensure white A4 paper is visible.' };
      }

      const footBox = findBoundingBox(imageData);
      if (!footBox) {
        return { error: 'Foot not detected. Ensure foot is clearly visible.' };
      }

      const lengthMm = footBox.height * a4Paper.pixelToMm;
      const widthMm = footBox.width * a4Paper.pixelToMm;
      const lengthInches = lengthMm * MM_TO_INCHES;
      const widthInches = widthMm * MM_TO_INCHES;

      return {
        algorithm: 'Algorithm 1: Contour-Based Edge Detection',
        lengthInches: lengthInches.toFixed(2),
        widthInches: widthInches.toFixed(2),
        pixelToMm: a4Paper.pixelToMm.toFixed(4),
        method: 'Bounding box from dark pixel detection'
      };
    } catch (err) {
      return { error: err.message };
    }
  };

  const algorithm2_ConvexHull = async (imageData) => {
    try {
      const a4Paper = findA4Paper(imageData);
      if (!a4Paper) {
        return { error: 'A4 paper not detected' };
      }

      const { width, height, data } = imageData;
      const points = [];
      
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const idx = (y * width + x) * 4;
          const brightness = data[idx] + data[idx + 1] + data[idx + 2];
          if (brightness < 300) {
            points.push({ x, y });
          }
        }
      }

      if (points.length < 10) {
        return { error: 'Insufficient foot data detected' };
      }

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      points.forEach(p => {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      });

      const lengthMm = (maxY - minY) * a4Paper.pixelToMm;
      const widthMm = (maxX - minX) * a4Paper.pixelToMm;
      const lengthInches = lengthMm * MM_TO_INCHES;
      const widthInches = widthMm * MM_TO_INCHES;

      return {
        algorithm: 'Algorithm 2: Convex Hull Method',
        lengthInches: lengthInches.toFixed(2),
        widthInches: widthInches.toFixed(2),
        pixelToMm: a4Paper.pixelToMm.toFixed(4),
        method: 'Extreme point detection from sampled pixels'
      };
    } catch (err) {
      return { error: err.message };
    }
  };

  const algorithm3_SkeletonBased = async (imageData) => {
    try {
      const a4Paper = findA4Paper(imageData);
      if (!a4Paper) {
        return { error: 'A4 paper not detected' };
      }

      const footBox = findBoundingBox(imageData, 120);
      if (!footBox) {
        return { error: 'Foot not detected' };
      }

      const { width, height, data } = imageData;
      let maxWidth = 0;
      
      const samplePoints = 5;
      for (let i = 0; i < samplePoints; i++) {
        const y = Math.floor(footBox.minY + (footBox.height * i / samplePoints));
        let leftX = width, rightX = 0;
        
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const brightness = data[idx] + data[idx + 1] + data[idx + 2];
          if (brightness < 300) {
            leftX = Math.min(leftX, x);
            rightX = Math.max(rightX, x);
          }
        }
        
        maxWidth = Math.max(maxWidth, rightX - leftX);
      }

      const lengthMm = footBox.height * a4Paper.pixelToMm;
      const widthMm = maxWidth * a4Paper.pixelToMm;
      const lengthInches = lengthMm * MM_TO_INCHES;
      const widthInches = widthMm * MM_TO_INCHES;

      return {
        algorithm: 'Algorithm 3: Skeleton-Based Medial Axis',
        lengthInches: lengthInches.toFixed(2),
        widthInches: widthInches.toFixed(2),
        pixelToMm: a4Paper.pixelToMm.toFixed(4),
        method: 'Multi-section width sampling'
      };
    } catch (err) {
      return { error: err.message };
    }
  };

  const processMeasurements = async () => {
    if (!image) return;

    setProcessing(true);
    setError(null);
    setResults([]);

    try {
      const imageData = await loadImageData(image);
      const result1 = await algorithm1_ContourBased(imageData);
      const result2 = await algorithm2_ConvexHull(imageData);
      const result3 = await algorithm3_SkeletonBased(imageData);

      setResults([result1, result2, result3]);
    } catch (err) {
      setError('Failed to process image: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const calculateAverage = () => {
    const valid = results.filter(r => !r.error);
    if (valid.length === 0) return null;

    const avgLength = valid.reduce((sum, r) => sum + parseFloat(r.lengthInches), 0) / valid.length;
    const avgWidth = valid.reduce((sum, r) => sum + parseFloat(r.widthInches), 0) / valid.length;

    return { avgLength: avgLength.toFixed(2), avgWidth: avgWidth.toFixed(2) };
  };

  const getShoeSize = (lengthInches, gender, region) => {
    const table = SIZE_TABLES[region][gender];
    
    // Find closest size
    let closestSize = table[0];
    let minDiff = Math.abs(lengthInches - table[0].length);
    
    for (const entry of table) {
      const diff = Math.abs(lengthInches - entry.length);
      if (diff < minDiff) {
        minDiff = diff;
        closestSize = entry;
      }
    }
    
    return closestSize.size;
  };

  const avg = calculateAverage();

  return (
    <div className="card">
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 28, marginBottom: 12, color: 'var(--text-primary)' }}>
           Foot Measurement System
        </h2>
        <p className="small" style={{ marginBottom: 16 }}>
          Measure foot dimensions using A4 reference paper (210mm × 297mm)
        </p>
        
        {onBack && (
          <button className="secondary" onClick={onBack} style={{ marginBottom: 16 }}>
            ← Back
          </button>
        )}
      </div>

      {/* Image Source Selection */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text-primary)' }}>
          📸 Capture Method
        </h3>
        
        <div className="row" style={{ marginBottom: 16 }}>
          <button 
            onClick={() => setUseWebcam(!useWebcam)}
            style={{ 
              background: useWebcam ? 'var(--danger)' : 'var(--primary)',
              opacity: 1
            }}
          >
            {useWebcam ? ' Close Camera' : ' Use Webcam'}
          </button>
          
          {!useWebcam && (
            <button onClick={() => fileInputRef.current?.click()}>
               Upload Image
            </button>
          )}
        </div>

        {/* Webcam View */}
        {useWebcam && (
          <div style={{ marginTop: 16 }}>
            <video 
              ref={videoRef} 
              playsInline 
              muted
              style={{
                width: '100%',
                maxHeight: 500,
                borderRadius: 12,
                border: '2px solid var(--card-border)',
                background: '#000'
              }}
            />
            {cameraReady && (
              <button 
                onClick={handleWebcamCapture}
                style={{ marginTop: 12, width: '100%' }}
              >
                 Capture Image
              </button>
            )}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />

        {/* Hidden Capture Canvas */}
        <canvas ref={captureCanvasRef} style={{ display: 'none' }} />

        <p className="small" style={{ marginTop: 12 }}>
          Requirements: Top-down 90° view, A4 paper adjacent to foot, good lighting
        </p>

        {/* Process Button */}
        {image && !useWebcam && (
          <button
            onClick={processMeasurements}
            disabled={processing}
            style={{ marginTop: 16, opacity: 1 }}
          >
            {processing ? '⏳ Processing...' : '🔍 Measure Foot'}
          </button>
        )}

        {error && (
          <div className="error-box" style={{ marginTop: 16 }}>
            ⚠️ {error}
          </div>
        )}

        {image && !useWebcam && (
          <div style={{ marginTop: 16 }}>
            <img
              src={image}
              alt="Captured"
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                borderRadius: 12,
                border: '2px solid var(--card-border)',
                objectFit: 'contain'
              }}
            />
          </div>
        )}
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div>
          <h3 style={{ fontSize: 20, marginBottom: 16, color: 'var(--text-primary)' }}>
            📊 Measurement Results
          </h3>
          
          <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
            {results.map((result, idx) => (
              <div
                key={idx}
                style={{
                  background: result.error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  borderRadius: 12,
                  padding: 20,
                  border: result.error ? '2px solid var(--danger)' : '2px solid var(--success)'
                }}
              >
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 600,
                  marginBottom: 12,
                  color: result.error ? 'var(--danger)' : 'var(--text-primary)'
                }}>
                  {result.algorithm}
                </h4>

                {result.error ? (
                  <p style={{ color: 'var(--danger)', fontSize: 14 }}>
                    ❌ {result.error}
                  </p>
                ) : (
                  <div>
                    <div className="row" style={{ gap: 12, marginBottom: 8 }}>
                      <div style={{
                        background: 'var(--card-bg)',
                        padding: 12,
                        borderRadius: 8,
                        flex: 1
                      }}>
                        <div className="small" style={{ marginBottom: 4 }}>Length</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {result.lengthInches} in
                        </div>
                      </div>

                      <div style={{
                        background: 'var(--card-bg)',
                        padding: 12,
                        borderRadius: 8,
                        flex: 1
                      }}>
                        <div className="small" style={{ marginBottom: 4 }}>Width</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {result.widthInches} in
                        </div>
                      </div>

                      <div style={{
                        background: 'var(--card-bg)',
                        padding: 12,
                        borderRadius: 8,
                        flex: 1
                      }}>
                        <div className="small" style={{ marginBottom: 4 }}>Scale</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {result.pixelToMm} mm/px
                        </div>
                      </div>
                    </div>
                    <div className="small" style={{ fontStyle: 'italic' }}>
                      Method: {result.method}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Average Results */}
          {avg && (
            <div style={{
              background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)',
              borderRadius: 12,
              padding: 24,
              color: 'white',
              marginBottom: 24
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>
                📈 Average Measurements
              </h3>
              <div className="row" style={{ gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>
                    Average Length
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {avg.avgLength} inches
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 4 }}>
                    Average Width
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {avg.avgWidth} inches
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Size Recommendation Buttons */}
          {avg && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, marginBottom: 12, color: 'var(--text-primary)' }}>
                 Select Size Chart Region
              </h3>
              <div className="row" style={{ gap: 12 }}>
                <button 
                  onClick={() => setSelectedRegion('US')}
                  style={{
                    background: selectedRegion === 'US' ? 'var(--primary)' : 'transparent',
                    border: '2px solid var(--primary)',
                    color: selectedRegion === 'US' ? 'white' : 'var(--primary)'
                  }}
                >
                   US Sizes
                </button>
                <button 
                  onClick={() => setSelectedRegion('UK')}
                  style={{
                    background: selectedRegion === 'UK' ? 'var(--primary)' : 'transparent',
                    border: '2px solid var(--primary)',
                    color: selectedRegion === 'UK' ? 'white' : 'var(--primary)'
                  }}
                >
                   UK Sizes
                </button>
                <button 
                  onClick={() => setSelectedRegion('EU')}
                  style={{
                    background: selectedRegion === 'EU' ? 'var(--primary)' : 'transparent',
                    border: '2px solid var(--primary)',
                    color: selectedRegion === 'EU' ? 'white' : 'var(--primary)'
                  }}
                >
                   EU Sizes
                </button>
              </div>
            </div>
          )}

          {/* Size Recommendations */}
          {avg && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.1)',
              borderRadius: 12,
              padding: 24,
              border: '2px solid var(--success)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
                Recommended Shoe Sizes ({selectedRegion})
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Men's Size */}
                <div style={{
                  background: 'var(--card-bg)',
                  padding: 20,
                  borderRadius: 10,
                  border: '2px solid rgba(59, 130, 246, 0.3)'
                }}>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                     Men's Size
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#3b82f6' }}>
                    {getShoeSize(parseFloat(avg.avgLength), 'men', selectedRegion)}
                  </div>
                  <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
                    Based on {avg.avgLength}" foot length
                  </div>
                </div>

                {/* Women's Size */}
                <div style={{
                  background: 'var(--card-bg)',
                  padding: 20,
                  borderRadius: 10,
                  border: '2px solid rgba(236, 72, 153, 0.3)'
                }}>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                     Women's Size
                  </div>
                  <div style={{ fontSize: 36, fontWeight: 700, color: '#ec4899' }}>
                    {getShoeSize(parseFloat(avg.avgLength), 'women', selectedRegion)}
                  </div>
                  <div className="small" style={{ marginTop: 8, opacity: 0.8 }}>
                    Based on {avg.avgLength}" foot length
                  </div>
                </div>
              </div>

              <div style={{
                marginTop: 16,
                padding: 12,
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: 8,
                fontSize: 13,
                color: 'var(--text-secondary)'
              }}>
                💡 <strong>Tip:</strong> Sizes are approximations. For best fit, try shoes in-store. 
                Add 0.5 size for wider feet or thick socks.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Algorithm Info */}
      <div style={{
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 12,
        padding: 20,
        marginTop: 24
      }}>
        <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-primary)' }}>
          ℹ️ Algorithm Overview
        </h3>
        <div style={{ display: 'grid', gap: 12, fontSize: 14, lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Algorithm 1 - Contour-Based:</strong>
            <p className="small" style={{ margin: '4px 0 0 0' }}>
              Detects dark pixels (foot) vs bright pixels (A4 paper), calculates bounding box. Fast and simple.
            </p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Algorithm 2 - Convex Hull:</strong>
            <p className="small" style={{ margin: '4px 0 0 0' }}>
              Samples foot pixels and finds extreme points for maximum length/width. More robust to irregular shapes.
            </p>
          </div>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Algorithm 3 - Skeleton-Based:</strong>
            <p className="small" style={{ margin: '4px 0 0 0' }}>
              Multi-section sampling for width at different heights. Better handles width variations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}