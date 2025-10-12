# Foot_classification/ml/detect_service.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from PIL import Image
import base64, io, os
from ultralytics import YOLO


# Initialize app
app = FastAPI(title="YOLOv8 Detection API")
# Add a simple route to handle the root request
@app.get("/")
def read_root():
    return {"message": "Welcome to the Foot Detection API!"}

# CORS middleware for React app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, update for more security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to trained YOLO model
DETECT_MODEL_PATH = os.getenv("DETECT_MODEL_PATH", "C:/Users/Admin/Desktop/pd32/Foot_classification/ml/model/detect_best.pt")
DEVICE = os.getenv("DEVICE", "0")  # "0" for GPU; use "cpu" if no GPU

# Load the model
_model = None
def load_model():
    global _model
    if _model is None:
        _model = YOLO(DETECT_MODEL_PATH)
    return _model

# Helper to convert base64 image to PIL Image
def b64_to_pil(data_url: str) -> Image.Image:
    b64 = data_url.split(",")[-1]
    return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")

# Define the request model
class DetectRequest(BaseModel):
    image_base64: str  # Base64 encoded image
    conf: float = 0.25  # Confidence threshold
    imgsz: int = 640  # Image size for inference

# Define the response model for detections
class DetBox(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bbox_xyxy: List[float]

class DetectResponse(BaseModel):
    detections: List[DetBox]

# Detect endpoint
@app.post("/detect", response_model=DetectResponse)
def detect(req: DetectRequest):
    img = b64_to_pil(req.image_base64)  # Convert the image from base64
    model = load_model()
    results = model.predict(img, conf=req.conf, imgsz=req.imgsz, device=DEVICE, verbose=False)  # Run inference
    detections = []
    for result in results:
        for box in result.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            x1, y1, x2, y2 = map(float, box.xyxy[0].tolist())
            detections.append({
                "class_id": cls_id,
                "class_name": result.names[cls_id],
                "confidence": conf,
                "bbox_xyxy": [x1, y1, x2, y2]
            })
    return {"detections": detections}

# Run the app with uvicorn: uvicorn detect_service:app --reload
