from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
import json

# 현재 파일의 절대 경로를 기반으로 정적 파일 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BUILD_DIR = os.path.join(BASE_DIR, '..', 'build')

app = Flask(__name__, 
            static_folder=BUILD_DIR,
            static_url_path='/')

# 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(BASE_DIR, 'canvases.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# CORS 설정
CORS(app, resources={
    r"/*": {
        "origins": ["*"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 모델 정의
class Canvas(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False, default='Untitled')
    data = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# 데이터베이스 테이블 생성
with app.app_context():
    db.create_all()

# 캔버스 저장 API
@app.route('/api/canvases', methods=['POST'])
def save_canvas():
    try:
        data = request.get_json()
        if not data or 'data' not in data:
            return jsonify({"error": "캔버스 데이터가 필요합니다."}), 400
        
        title = data.get('title', 'Untitled')
        canvas_data = json.dumps(data['data'])  # 데이터를 JSON 문자열로 변환
        
        new_canvas = Canvas(title=title, data=canvas_data)
        db.session.add(new_canvas)
        db.session.commit()
        
        return jsonify({"message": "캔버스가 저장되었습니다.", "id": new_canvas.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 캔버스 목록 조회 API
@app.route('/api/canvases', methods=['GET'])
def get_canvases():
    try:
        canvases = Canvas.query.order_by(Canvas.updated_at.desc()).all()
        return jsonify([canvas.to_dict() for canvas in canvases])
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 특정 캔버스 조회 API
@app.route('/api/canvases/<int:canvas_id>', methods=['GET'])
def get_canvas(canvas_id):
    try:
        canvas = Canvas.query.get_or_404(canvas_id)
        return jsonify({
            'id': canvas.id,
            'title': canvas.title,
            'data': json.loads(canvas.data),
            'created_at': canvas.created_at.isoformat(),
            'updated_at': canvas.updated_at.isoformat()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 캔버스 삭제 API
@app.route('/api/canvases/<int:canvas_id>', methods=['DELETE'])
def delete_canvas(canvas_id):
    try:
        canvas = Canvas.query.get_or_404(canvas_id)
        db.session.delete(canvas)
        db.session.commit()
        return jsonify({"message": "캔버스가 성공적으로 삭제되었습니다."}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 캔버스 수정 API
@app.route('/api/canvases/<int:canvas_id>', methods=['PUT'])
def update_canvas(canvas_id):
    try:
        data = request.get_json()
        if not data or 'data' not in data:
            return jsonify({"error": "캔버스 데이터가 필요합니다."}), 400
        
        canvas = Canvas.query.get_or_404(canvas_id)
        
        # 제목이 제공된 경우에만 업데이트
        if 'title' in data:
            canvas.title = data.get('title', canvas.title)
        
        # 데이터 업데이트
        canvas.data = json.dumps(data['data'])
        canvas.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            "message": "캔버스가 성공적으로 수정되었습니다.",
            "canvas": canvas.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# 테스트 API 엔드포인트
@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "Flask 백엔드에 연결되었습니다!"})

# 정적 파일 서빙을 위한 라우트
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(BUILD_DIR, path)):
        return send_from_directory(BUILD_DIR, path)
    else:
        return send_from_directory(BUILD_DIR, 'index.html')

# 루트 경로는 serve 함수가 처리하므로 중복 제거

if __name__ == '__main__':
    print(f"Serving files from: {BUILD_DIR}")
    print(f"Directory contents: {os.listdir(BUILD_DIR) if os.path.exists(BUILD_DIR) else 'Directory not found'}")
    app.run(debug=True, port=5002)