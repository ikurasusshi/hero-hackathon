# coding: utf-8

import json
import sqlite3
from flask import Flask, render_template_string, request, jsonify

app = Flask(__name__)
DB_NAME = 'meeting_app.db'

def get_db_connection():
    """SQLiteデータベースへの接続を確立し、カーソルを返す"""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row  # 列名でデータにアクセスできるようにする
    return conn

def init_db():
    """データベーステーブルを初期化する"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS meetings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_minutes TEXT,
            slides TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

@app.route('/')
def index():
    """フロントエンドのHTMLをレンダリングして提供する"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/save', methods=['POST'])
def save_data():
    """議事録とスライドデータを保存するAPIエンドポイント"""
    data = request.json
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    meeting_minutes = data.get('meeting_minutes', '')
    slides = data.get('slides', [])
    slides_json = json.dumps(slides)  # リストをJSON文字列に変換

    conn = get_db_connection()
    try:
        conn.execute(
            'INSERT INTO meetings (meeting_minutes, slides) VALUES (?, ?)',
            (meeting_minutes, slides_json)
        )
        conn.commit()
        return jsonify({'message': 'Data saved successfully'}), 200
    except sqlite3.Error as e:
        conn.rollback()
        return jsonify({'error': f'Database error: {e}'}), 500
    finally:
        conn.close()

if __name__ == '__main__':
    init_db()  # アプリ起動時にデータベースを初期化
    app.run(debug=True)
