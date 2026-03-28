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
    
@app.route('/budgets', methods=['POST'])
def add_budget():
    data = request.get_json()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO budgets (category, budget_limit, month) VALUES (%s, %s, %s) ON CONFLICT (category) DO UPDATE SET budget_limit = EXCLUDED.budget_limit, month = EXCLUDED.month',
        (data['category'], data['budget_limit'], data['month'])
    )
    conn.commit()
    cursor.close()
    conn.close()
    return {'message': f"Budget for {data['category']} saved successfully"}

@app.route('/summary', methods=['GET'])
def get_summary():
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('SELECT * FROM transactions;')
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    import numpy as np
    df = pd.DataFrame(rows)
    if df.empty:
        return jsonify({'message': 'No transactions found'})

    df['amount'] = df['amount'].astype(float)
    expenses = df[df['type'] == 'expense']
    income = df[df['type'] == 'income']

    summary = {
        'total_income': round(float(np.sum(income['amount'])), 2),
        'total_expenses': round(float(np.sum(expenses['amount'])), 2),
        'average_expense': round(float(np.mean(expenses['amount'])), 2) if not expenses.empty else 0,
        'top_category': expenses.groupby('category')['amount'].sum().idxmax() if not expenses.empty else 'N/A',
        'net_savings': round(float(np.sum(income['amount'])) - float(np.sum(expenses['amount'])), 2)
    }
    return jsonify(summary)

if __name__ == '__main__':
    app.run(debug=True)