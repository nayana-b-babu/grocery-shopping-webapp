from sql_connection import get_sql_connection

def get_all_products():
    conn = get_sql_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT  id, name, price, category, unit FROM products")
    result = cursor.fetchall()
    cursor.close()
    conn.close()
    return result

def insert_product(name, price, category, unit):
    conn = get_sql_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO products (name, price, category, unit)
        VALUES (%s, %s, %s, %s)
    """
    cursor.execute(query, (name, price, category, unit))
    conn.commit()

    product_id = cursor.lastrowid
    cursor.close()
    conn.close()

    return product_id



def delete_product(product_id):
    conn = get_sql_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM products WHERE id = %s", (product_id,))
        conn.commit()
        return True
    except Exception as e:
        print("Error deleting product:", e)
        return False
    finally:
        cursor.close()
        conn.close()





def get_next_available_id():
    conn = get_sql_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM products ORDER BY id")
    ids = [row[0] for row in cursor.fetchall()]
    cursor.close()
    conn.close()

    # Find the smallest unused positive ID
    i = 1
    while i in ids:
        i += 1
    return i


def insert_order(product_id, quantity, customer_name):
    conn = get_sql_connection()
    cursor = conn.cursor()

    query = """
        INSERT INTO orders (product_id, quantity, customer_name, order_date)
        VALUES (%s, %s, %s, NOW())
    """
    cursor.execute(query, (product_id, quantity, customer_name))
    conn.commit()
    order_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return order_id


