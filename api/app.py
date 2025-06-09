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

# --- PERUBAHAN ---
# Ukuran gambar disesuaikan dengan input model
MODEL_PATH = 'api/models/unet_dental_segmentation.h5'
IMAGE_SIZE = (256, 256) # Diubah dari (128, 128)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# Class mapping untuk multi-class segmentation
CLASS_NAMES = {
    0: 'tooth',
    1: 'caries',
    2: 'cavity',
    3: 'crack'
}

# Color mapping for visualization
CLASS_COLORS = {
    0: (0, 255, 0),      # tooth - Green
    1: (255, 255, 0),    # caries - Yellow
    2: (255, 0, 0),      # cavity - Red
    3: (255, 165, 0)     # crack - Orange
}

model = None

# Konfigurasi logging ke file
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('app.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

# Gunakan app.logger untuk logging di Flask
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

# Initialize model on startup
model_loaded = initialize_model()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_bytes, target_size):
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_resized = image.resize(target_size, Image.LANCZOS)
        image_array = img_to_array(image_resized)
        image_array = image_array / 255.0
        image_array = np.expand_dims(image_array, axis=0)
        return image_array
    except Exception as e:
        app.logger.error(f"Error in preprocessing image: {e}", exc_info=True)
        raise

# --- FUNGSI BARU ---
# Fungsi cerdas untuk mengonversi output model menjadi kelas
def convert_mask_to_classes(predicted_mask):
    """
    Secara cerdas mengubah output mask dari model (baik sigmoid atau softmax)
    menjadi array 2D yang berisi ID kelas untuk setiap piksel.
    """
    # Cek jika outputnya multi-kelas (softmax)
    if predicted_mask.shape[-1] > 1:
        # Kelas adalah indeks dari channel dengan nilai tertinggi
        return np.argmax(predicted_mask, axis=-1)
    # Jika tidak, asumsikan output biner (sigmoid)
    else:
        # Hapus dimensi terakhir (dari (H, W, 1) menjadi (H, W))
        squeezed_mask = np.squeeze(predicted_mask, axis=-1)
        # Terapkan ambang batas 0.5 untuk menentukan kelas (0 atau 1)
        return (squeezed_mask > 0.5).astype(np.uint8)

# --- FUNGSI YANG DIPERBARUI ---
# Fungsi analisis yang disederhanakan dan diperbaiki
def analyze_multiclass_segmentation(predicted_mask, total_pixels):
    """
    Menganalisis mask segmentasi untuk menghitung persentase setiap kelas.
    """
    try:
        predicted_classes = convert_mask_to_classes(predicted_mask)
        
        class_percentages = {}
        class_pixel_counts = {}
        
        # Hitung persentase untuk setiap kelas (kecuali background)
        for class_id, class_name in CLASS_NAMES.items():
            if class_name == 'background':
                continue
                
            # Untuk output biner, semua area terdeteksi dianggap 'tooth' (class_id 1)
            if predicted_mask.shape[-1] == 1 and class_id != 1:
                 pixel_count = 0
            else:
                 pixel_count = np.sum(predicted_classes == class_id)
            
            percentage = (pixel_count / total_pixels) * 100
            class_percentages[class_name] = round(percentage, 2)
            class_pixel_counts[class_name] = int(pixel_count)

        # Cari kelas dengan persentase non-gigi terbesar untuk menentukan kondisi
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

# --- FUNGSI YANG DIPERBARUI ---
# Fungsi overlay yang disederhanakan dan diperbaiki
def create_multiclass_overlay(original_image_pil, predicted_mask, alpha=0.6):
    """
    Membuat gambar overlay dengan warna berbeda untuk setiap kelas hasil segmentasi.
    """
    try:
        original_resized_pil = original_image_pil.resize(IMAGE_SIZE, Image.LANCZOS)
        original_array = np.array(original_resized_pil)
        
        predicted_classes = convert_mask_to_classes(predicted_mask)
        
        # Buat lapisan warna (overlay) kosong
        overlay = np.zeros_like(original_array)
        
        # Isi lapisan warna berdasarkan kelas prediksi
        for class_id, color in CLASS_COLORS.items():
            if class_id == 0:  # Lewati background
                continue
            
            # Untuk output biner, warnai semua area terdeteksi sbg 'tooth' (hijau)
            if predicted_mask.shape[-1] == 1 and class_id != 1:
                continue

            overlay[predicted_classes == class_id] = color
        
        # Gabungkan gambar asli dengan lapisan warna
        # Hanya gabungkan pada piksel yang bukan background
        non_bg_mask = predicted_classes > 0
        result = original_array.copy()
        if np.any(non_bg_mask):
            result[non_bg_mask] = cv2.addWeighted(
                original_array[non_bg_mask], 
                1 - alpha, 
                overlay[non_bg_mask], 
                alpha, 
                0
            )
        
        return Image.fromarray(result)
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

@app.route('/predict_endpoint', methods=['POST'])
def predict_endpoint_route():
    app.logger.info("🔄 Received prediction request")
    
    if model is None:
        error_msg = 'Model tidak dapat dimuat. Silakan periksa log server dan pastikan file model ada.'
        app.logger.error(f"❌ {error_msg}")
        return jsonify({'error': error_msg}), 500

    if 'file' not in request.files:
        error_msg = 'Tidak ada file dalam permintaan.'
        app.logger.error(f"❌ {error_msg}")
        return jsonify({'error': error_msg}), 400

    file = request.files['file']
    if file.filename == '':
        error_msg = 'Tidak ada file yang dipilih untuk diunggah.'
        app.logger.error(f"❌ {error_msg}")
        return jsonify({'error': error_msg}), 400

    if file and allowed_file(file.filename):
        try:
            app.logger.info(f"📁 Processing file: {file.filename}")
            
            image_bytes = file.read()
            original_image_pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            app.logger.info(f"📷 Original image size: {original_image_pil.size}")
            
            processed_image_array = preprocess_image(image_bytes, IMAGE_SIZE)
            app.logger.info(f"🔄 Preprocessed image shape: {processed_image_array.shape}")

            app.logger.info("🤖 Running model prediction...")
            predicted_mask_batch = model.predict(processed_image_array)
            predicted_mask_single = predicted_mask_batch[0]
            app.logger.info(f"📊 Prediction output shape: {predicted_mask_single.shape}")

            total_image_pixels = IMAGE_SIZE[0] * IMAGE_SIZE[1]
            
            app.logger.info("📈 Analyzing segmentation results...")
            analysis_data = analyze_multiclass_segmentation(predicted_mask_single, total_image_pixels)

            app.logger.info("🎨 Creating overlay visualization...")
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
    else:
        error_msg = 'Tipe file tidak diizinkan. Gunakan PNG, JPG, atau JPEG.'
        app.logger.error(f"❌ {error_msg}")
        return jsonify({'error': error_msg}), 400

@app.route('/logs', methods=['GET'])
def get_logs():
    log_file = 'app.log'
    if not os.path.exists(log_file):
        app.logger.warning(f"Attempted to access non-existent log file: {log_file}")
        return jsonify({'error': 'Log file not found.'}), 404
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            last_lines = lines[-200:] if len(lines) > 200 else lines
        app.logger.info(f"Accessed logs from {log_file}. Displaying {len(last_lines)} lines.")
        return app.response_class(
            response=''.join(last_lines),
            status=200,
            mimetype='text/plain'
        )
    except Exception as e:
        app.logger.error(f"Failed to read log file: {e}", exc_info=True)
        return jsonify({'error': f'Failed to read log file: {str(e)}'}), 500

if __name__ == '__main__':
    app.logger.info("🚀 Starting Flask server...")
    app.logger.info(f"📁 Current working directory: {os.getcwd()}")
    app.logger.info(f"🤖 Model loaded: {model is not None}")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)