from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
import psycopg2.extras
import pandas as pd
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    return conn

@app.route('/health')
def health():
    try:
        conn = get_db_connection()
        conn.close()
        return {'status': 'ok', 'database': 'connected'}
    except Exception as e:
        return {'status': 'error', 'database': str(e)}, 500

@app.route('/transactions', methods=['GET'])
def get_transactions():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM transactions ORDER BY date DESC;')
    transactions = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(list(transactions))

@app.route('/upload', methods=['POST'])
def upload_csv():
    if 'file' not in request.files:
        return {'error': 'No file provided'}, 400
    file = request.files['file']
    df = pd.read_csv(file)
    df.columns = df.columns.str.lower().str.strip()
    conn = get_db_connection()
    cursor = conn.cursor()
    for _, row in df.iterrows():
        cursor.execute(
            'INSERT INTO transactions (date, description, amount, category, type) VALUES (%s, %s, %s, %s, %s)',
            (row['date'], row['description'], row['amount'], row['category'], row['type'])
        )
    conn.commit()
    cursor.close()
    conn.close()
    return {'message': f'{len(df)} transactions uploaded successfully'}

if __name__ == '__main__':
    app.run(debug=True)