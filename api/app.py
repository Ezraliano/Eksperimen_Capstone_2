import os
import io
import numpy as np
from PIL import Image
import cv2
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
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

def preprocess_image(image_bytes, target_size):
    try:
        image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_rgb_array = np.array(image_pil)
        image_bgr_array = cv2.cvtColor(image_rgb_array, cv2.COLOR_RGB2BGR)
        image_resized = cv2.resize(image_bgr_array, target_size)
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
    predicted_classes = convert_mask_to_classes(predicted_mask)
    class_percentages = {name: 0.0 for name in CLASS_NAMES.values()}
    class_pixel_counts = {name: 0 for name in CLASS_NAMES.values()}

    for class_id, class_name in CLASS_NAMES.items():
        pixel_count = np.sum(predicted_classes == class_id)
        class_pixel_counts[class_name] = int(pixel_count)
        class_percentages[class_name] = round((pixel_count / total_pixels) * 100, 2)

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

def create_multiclass_overlay(original_image_pil, predicted_mask, alpha=0.6):
    try:
        original_resized_pil = original_image_pil.resize(IMAGE_SIZE, Image.LANCZOS)
        original_array = np.array(original_resized_pil.convert("RGB"))
        predicted_classes = convert_mask_to_classes(predicted_mask)
        color_mask = np.zeros_like(original_array)
        for class_id, color in CLASS_COLORS.items():
            color_mask[predicted_classes == class_id] = color
        detected_pixels_mask = np.isin(predicted_classes, list(CLASS_NAMES.keys()))
        result_array = original_array.copy()
        result_array[detected_pixels_mask] = (
            (alpha * original_array[detected_pixels_mask]) + 
            ((1 - alpha) * color_mask[detected_pixels_mask])
        ).astype(np.uint8)
        return Image.fromarray(result_array)
    except Exception as e:
        app.logger.error(f"Error in create_multiclass_overlay: {e}", exc_info=True)
        raise

@app.route('/health', methods=['GET'])
def health_check():
    app.logger.info("Health check endpoint hit.")
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'model_path': MODEL_PATH,
        'model_exists': os.path.exists(MODEL_PATH),
        'current_directory': os.getcwd(),
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/logs', methods=['GET'])
def get_logs():
    log_file = 'app.log'
    if not os.path.exists(log_file):
        return jsonify({'error': 'Log file not found.'}), 404
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            last_lines = lines[-200:]
        return app.response_class(response=''.join(last_lines), status=200, mimetype='text/plain')
    except Exception as e:
        return jsonify({'error': f'Failed to read log file: {str(e)}'}), 500

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
        
        # --- LANGKAH DEBUGGING DIMULAI ---
        # Kita akan menyimpan gambar yang telah diproses ini ke disk untuk diperiksa
        try:
            # Ambil gambar dari batch, kembalikan ke rentang 0-255
            debug_image = processed_image_array[0] * 255.0
            
            # Tentukan path penyimpanan
            debug_image_path = os.path.join(os.path.dirname(__file__), 'debug_image_from_app.png')
            
            # Simpan gambar menggunakan cv2
            cv2.imwrite(debug_image_path, debug_image)
            app.logger.info(f"✅ Gambar debug disimpan di: {debug_image_path}")

        except Exception as debug_e:
            app.logger.error(f"❌ Gagal menyimpan gambar debug: {debug_e}")
        # --- LANGKAH DEBUGGING SELESAI ---

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
            'detected_class': analysis_data["detected_class"],
            'severity': analysis_data["severity"],
            'class_percentages': analysis_data["class_percentages"],
            'class_pixel_counts': analysis_data["class_pixel_counts"],
            'dominant_condition': analysis_data["dominant_condition"],
            'legend': {
                'tooth': 'Green - Normal tooth structure',
                'caries': 'Yellow - Dental caries detected',
                'cavity': 'Red - Cavity formation',
                'crack': 'Orange - Tooth crack/fracture'
            }
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
    app.run(host='0.0.0.0', port=port, debug=False)