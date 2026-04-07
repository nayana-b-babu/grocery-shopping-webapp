from flask import Flask, request, jsonify
from flask_cors import CORS
import products  # your products.py file
import mysql.connector
app = Flask(__name__)
CORS(app)

def get_sql_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="mysqlroot@123",
        database="grocery_store"
    )
@app.route('/getProducts', methods=['GET'])
def get_products():
    return jsonify(products.get_all_products())

@app.route('/addProduct', methods=['POST'])
def insert_product():
    data = request.get_json()
    name = data['name']
    price = data['price']
    category = data['category']
    unit = data['unit']

    product_id = products.insert_product(name, price, category, unit)

    return jsonify({'message': 'Product added', 'product_id': product_id})




@app.route('/deleteProduct/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_sql_connection()
    cursor = conn.cursor()

    # Check if product exists
    cursor.execute("SELECT id FROM products WHERE id = %s", (product_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    # Delete product (and automatically delete orders because of ON DELETE CASCADE)
    cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
    conn.commit()

    cursor.close()
    conn.close()
    return jsonify({"message": "Product deleted successfully"}), 200



@app.route('/orders', methods=['GET'])

def get_orders():
    conn = get_sql_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT o.order_id, o.customer_name, p.name, o.quantity, o.total_price, o.order_date, o.status
        FROM orders o
        JOIN products p ON o.product_id = p.id
        ORDER BY o.order_date DESC
    """)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    orders = []
    for row in rows:
        order_id, customer, product_name, quantity, total_price, order_date, status = row

        orders.append({
            "id": f"ORD{order_id:03d}",
            "customer": customer,
            "items": f"{product_name} x {quantity}",
            "total": float(total_price or 0),
            "order_date": order_date,
            "status": status
        })
    return jsonify(orders)


from decimal import Decimal

@app.route('/orders', methods=['POST'])
def place_order():
    data = request.get_json()

    customer_name = data.get('customer_name')
    product_id = data.get('product_id')
    quantity = data.get('quantity')

    if not all([customer_name, product_id, quantity]):
        return jsonify({"error": "Missing fields"}), 400

    # Convert quantity to int explicitly
    quantity = int(quantity)

    conn = get_sql_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT price FROM products WHERE id = %s", (product_id,))
    result = cursor.fetchone()
    if not result:
        cursor.close()
        conn.close()
        return jsonify({"error": "Product not found"}), 404

    price = result[0]  # Could be Decimal or string

    # Convert price to Decimal for safe arithmetic
    price = Decimal(str(price))

    total_price = price * quantity

    query = """
        INSERT INTO orders (customer_name, product_id, quantity, total_price, order_date)
        VALUES (%s, %s, %s, %s, NOW())
    """
    cursor.execute(query, (customer_name, product_id, quantity, float(total_price)))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Order placed successfully"}), 201


@app.route('/updateOrderStatus/<int:order_id>', methods=['PUT'])
def update_order_status(order_id):
    data = request.get_json()
    new_status = data.get('status')

    if not new_status:
        return jsonify({"error": "Status is required"}), 400

    conn = get_sql_connection()
    cursor = conn.cursor()

    try:
        # Use correct column name here
        cursor.execute("UPDATE orders SET status = %s WHERE order_id = %s", (new_status, order_id))
        conn.commit()

        if cursor.rowcount == 0:
            return jsonify({"error": "Order not found"}), 404

        return jsonify({"message": "Order status updated successfully"})
    except Exception as e:
        print("Error updating status:", e)
        return jsonify({"error": "Failed to update status"}), 500
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    app.run(debug=True, port=5000)


