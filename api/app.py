import os
import io
import numpy as np
from PIL import Image
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
from tensorflow.keras.preprocessing.image import img_to_array
import datetime
import logging

from model import load_unet_model

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'api/models/unet_dental_segmentation.h5'
IMAGE_SIZE = (256, 256)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Class mapping yang BENAR sesuai dengan output model
CLASS_NAMES = {
    0: 'tooth',
    1: 'caries',
    2: 'cavity',
    3: 'crack'
}

# Color mapping yang BENAR dan konsisten
CLASS_COLORS = {
    0: (0, 255, 0),      # tooth - Green
    1: (255, 255, 0),    # caries - Yellow
    2: (255, 0, 0),      # cavity - Red
    3: (255, 165, 0)     # crack - Orange
}

model = None

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
app.logger.setLevel(logging.INFO)

def initialize_model():
    global model
    try:
        if not os.path.exists(MODEL_PATH):
            app.logger.error(f"ERROR: Model file not found at {MODEL_PATH}")
            return False
        app.logger.info(f"Loading model from {MODEL_PATH}...")
        model = load_unet_model(MODEL_PATH)
        app.logger.info(f"✅ Model loaded successfully from {MODEL_PATH}")
        return True
    except Exception as e:
        app.logger.error(f"❌ Failed to initialize model: {e}", exc_info=True)
        return False

model_loaded = initialize_model()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- FUNGSI PREPROCESS YANG DIPERBARUI (FIX BGR/RGB) ---
def preprocess_image(image_bytes, target_size):
    try:
        # 1. Buka gambar menggunakan PIL
        image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # 2. Ubah dari PIL (RGB) ke format array NumPy
        image_rgb_array = np.array(image_pil)
        
        # 3. Konversi dari RGB ke BGR agar sesuai dengan training model (cv2)
        image_bgr_array = cv2.cvtColor(image_rgb_array, cv2.COLOR_RGB2BGR)

        # 4. Ubah ukuran gambar menggunakan cv2 untuk konsistensi
        image_resized = cv2.resize(image_bgr_array, target_size)

        # 5. Normalisasi dan perluas dimensi untuk model
        image_array = image_resized / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array.astype(np.float32)

    except Exception as e:
        app.logger.error(f"Error in preprocessing image: {e}", exc_info=True)
        raise

def convert_mask_to_classes(predicted_mask):
    if predicted_mask.shape[-1] > 1:
        return np.argmax(predicted_mask, axis=-1)
    else:
        squeezed_mask = np.squeeze(predicted_mask, axis=-1)
        return (squeezed_mask > 0.5).astype(np.uint8)

def analyze_multiclass_segmentation(predicted_mask, total_pixels):
    try:
        predicted_classes = convert_mask_to_classes(predicted_mask)
        class_percentages = {}
        class_pixel_counts = {}
        
        for class_id, class_name in CLASS_NAMES.items():
            pixel_count = np.sum(predicted_classes == class_id)
            percentage = (pixel_count / total_pixels) * 100
            class_percentages[class_name] = round(percentage, 2)
            class_pixel_counts[class_name] = int(pixel_count)

        pathology_percentages = {k: v for k, v in class_percentages.items() if k != 'tooth'}
        
        if not pathology_percentages or max(pathology_percentages.values()) < 1.0:
            detected_class = "Healthy - No significant dental issues detected"
            severity = "healthy"
            dominant_condition = "healthy"
        else:
            dominant_condition = max(pathology_percentages, key=pathology_percentages.get)
            dominant_value = pathology_percentages[dominant_condition]
            
            detected_class = f"Dental condition detected: {dominant_condition.capitalize()}"
            if dominant_value < 5:
                severity = "mild"
            elif dominant_value < 15:
                severity = "moderate"
            else:
                severity = "severe"
        
        return {
            "detected_class": detected_class,
            "severity": severity,
            "class_percentages": class_percentages,
            "class_pixel_counts": class_pixel_counts,
            "dominant_condition": dominant_condition
        }
    except Exception as e:
        app.logger.error(f"Error in analyze_multiclass_segmentation: {e}", exc_info=True)
        raise

def create_multiclass_overlay(original_image_pil, predicted_mask, alpha=0.6):
    try:
        original_resized_pil = original_image_pil.resize(IMAGE_SIZE, Image.LANCZOS)
        original_array = np.array(original_resized_pil.convert("RGB"))
        
        predicted_classes = convert_mask_to_classes(predicted_mask)
        
        overlay = np.zeros_like(original_array)
        
        for class_id, color in CLASS_COLORS.items():
            overlay[predicted_classes == class_id] = color
        
        non_zero_mask = predicted_classes > 0 # Hanya untuk area selain 'tooth' jika 'tooth' adalah kelas 0
        if not CLASS_NAMES.get(0) == 'tooth':
             non_zero_mask = predicted_classes > 0
        else: # Jika 'tooth' adalah kelas 0, maka semua area terdeteksi harus di-overlay
             non_zero_mask = np.any(predicted_classes >= 0)


        result = original_array.copy()
        # Terapkan overlay hanya pada piksel yang memiliki kelas terdeteksi (bukan background implisit)
        # Cari piksel mana yang memiliki prediksi kelas
        valid_class_mask = np.isin(predicted_classes, list(CLASS_NAMES.keys()))
        if np.any(valid_class_mask):
            result[valid_class_mask] = cv2.addWeighted(
                original_array[valid_class_mask], 
                1 - alpha, 
                overlay[valid_class_mask], 
                alpha, 
                0
            )
        
        return Image.fromarray(result)
    except Exception as e:
        app.logger.error(f"Error in create_multiclass_overlay: {e}", exc_info=True)
        raise

@app.route('/predict_endpoint', methods=['POST'])
def predict_endpoint_route():
    app.logger.info("🔄 Received prediction request")
    
    if model is None:
        return jsonify({'error': 'Model tidak dapat dimuat.'}), 500

    if 'file' not in request.files:
        return jsonify({'error': 'Tidak ada file dalam permintaan.'}), 400

    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Tipe file tidak valid atau tidak ada file dipilih.'}), 400

    try:
        image_bytes = file.read()
        original_image_pil = Image.open(io.BytesIO(image_bytes))
        
        processed_image_array = preprocess_image(image_bytes, IMAGE_SIZE)

        predicted_mask_batch = model.predict(processed_image_array)
        predicted_mask_single = predicted_mask_batch[0]

        total_image_pixels = IMAGE_SIZE[0] * IMAGE_SIZE[1]
        analysis_data = analyze_multiclass_segmentation(predicted_mask_single, total_image_pixels)
        final_image_to_send_pil = create_multiclass_overlay(original_image_pil, predicted_mask_single)

        buffered = io.BytesIO()
        final_image_to_send_pil.save(buffered, format="PNG")
        img_str_processed = base64.b64encode(buffered.getvalue()).decode()

        response_data = {
            'processed_image': 'data:image/png;base64,' + img_str_processed,
            'analysis': analysis_data
        }
        
        app.logger.info("✅ Analysis completed successfully")
        return jsonify(response_data)

    except Exception as e:
        error_msg = f'Terjadi kesalahan saat memproses gambar: {str(e)}'
        app.logger.error(f"❌ {error_msg}", exc_info=True)
        return jsonify({'error': error_msg}), 500

if __name__ == '__main__':
    app.logger.info("🚀 Starting Flask server...")
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)