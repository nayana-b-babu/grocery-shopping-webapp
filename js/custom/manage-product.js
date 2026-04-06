let products = []; // Define the global products array
let currentOrder = {
  customer: "",
  items: []
};


const productTable = document.querySelector("#productTable tbody");

// Format price as currency
function formatCurrency(value) {
  return "₹" + parseFloat(value).toFixed(2);
}

// Render the products in the table
function renderProducts() {
  productTable.innerHTML = "";

  products.forEach((p) => {
    productTable.innerHTML += `
      <tr>
        <td>${p.name}</td>
        <td>${formatCurrency(p.price)}</td>
        <td>${p.category}</td>
        <td>${p.unit}</td>
        <td>
          <input type="number" id="qty-${p.id}" min="1" value="1" style="width: 60px;" />
          
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}




// Load all products from the backend API
function loadProductsFromAPI() {
  fetch("http://localhost:5000/getProducts")
    .then(res => res.json())
    .then(data => {
      products = data;
      renderProducts();
    })
    .catch(err => console.error("Error loading products:", err));
}

// Submit form to add a new product
document.getElementById("productForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("productName").value;
  const price = document.getElementById("productPrice").value;
  const category = document.getElementById("productCategory").value;
  const unit = document.getElementById("productUnit").value;

  fetch("http://localhost:5000/addProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({name, price, category, unit })
  })
    .then(res => res.json())
    .then(() => {
      document.getElementById("productForm").reset(); // Corrected 'this' to form ID
      loadProductsFromAPI(); // Reload product list
    })
    .catch(err => console.error("Error adding product:", err));
});


// Delete product by ID
function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  fetch(`http://localhost:5000/deleteProduct/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(() => loadProductsFromAPI())
    .catch(err => console.error("Error deleting product:", err));
}


function submitOrder() {
  const customerName = document.getElementById("customerName").value.trim();

  if (currentOrder.items.length === 0) {
    showMessage("No items in the order!", "error");
    return;
  }

  currentOrder.customer = customerName || "Guest";

  fetch("http://localhost:5000/createOrder", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(currentOrder)
  })
    .then(res => res.json())
    .then(() => {
      showMessage("Order submitted!", "success");
      currentOrder.items = [];
    })
    .catch(err => {
      console.error("Failed to submit order", err);
      showMessage("Error submitting order.", "error");
    });
}


// Load products when page loads
loadProductsFromAPI();


