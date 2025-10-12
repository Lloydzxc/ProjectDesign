Foot Detection Classification System

Overview:
This project is a foot detection classification system built using YOLOv8 for object detection. It includes both backend (FastAPI) and frontend (React) components. The system allows for real-time foot detection from webcam input and image uploads.

Backend (FastAPI):
The backend is powered by FastAPI, exposing an API for object detection. The model used is YOLOv8 (detect_best.pt).
- Detection Endpoint: /api/detect
- The model is loaded from Foot_classification/ml/detect_best.pt.

Backend Setup:
To set up the backend:
1. Install Python dependencies:
   pip install -r Foot_classification/ml/requirements.txt
2. Start the FastAPI service:
   uvicorn Foot_classification/ml/detect_service:app --reload

API Endpoints:
1. GET / - Returns a welcome message.
2. POST /detect - Accepts a base64 image for detection and returns bounding boxes of detected objects.

Frontend (React):
The frontend is built with React and interacts with the backend to send images for detection.
- Login Button: Users can log in to interact with the webcam screen.
- Capture/Upload: Users can capture images from their webcam or upload an image for detection.

Frontend Setup:
To set up the frontend:
1. Install Node.js dependencies:
   npm install
2. Start the React app:
   npm run dev

How to Train the YOLO Model:
1. Edit the train_detect.py file if necessary and run it to train the model:
   python Foot_classification/ml/train_detect.py
2. The best model weights will be saved in the ml/runs/ directory.

Deployment:
1. Set up the backend on your server with FastAPI.
2. Set up the frontend to interact with the FastAPI server for image detection.

License:
This project is licensed under the MIT License.
