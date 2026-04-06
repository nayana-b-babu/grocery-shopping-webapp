document.addEventListener("DOMContentLoaded", () => {
  const orderTable = document.querySelector("#orderTable tbody");

  function formatCurrency(amount) {
  return "₹" + Number(amount).toFixed(2);
}


  function showMessage(msg, type) {
    alert(msg); // You can replace this with custom toast/alert
  }

  let orders = [];

  function loadOrdersFromAPI() {
    fetch("http://localhost:5000/orders") // Make sure Flask has CORS enabled
      .then((res) => res.json())
      .then((data) => {
        orders = data;
        renderOrders();
      })
      .catch((err) => {
        console.error("Failed to load orders:", err);
       
      });
  }
  
  function renderOrders() {
    orderTable.innerHTML = "";
    orders.forEach((o, i) => {
      orderTable.innerHTML += `
        <tr>
          <td>${o.id}</td>
          <td>${o.customer || "N/A"}</td>
          <td>${o.items}</td>
          <td>${formatCurrency(o.total)}</td>
          <td>${o.status}</td>
          <td>
            ${
              o.status.toLowerCase() !== "delivered"
                ? `<button class="btn btn-sm btn-outline-success" onclick="markDelivered(${i})">Mark Delivered</button>`
                : `<span class="badge bg-success">Delivered</span>`
            }
          </td>
        </tr>
      `;
    });
  }


  window.markDelivered = function (index) {
    const order = orders[index];
    const numericId = order.id.replace("ORD", "");

    fetch(`http://localhost:5000/updateOrderStatus/${numericId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "Delivered" })
    })
      .then((res) => res.json())
      .then(() => {
        orders[index].status = "Delivered";
        renderOrders();
        showMessage("Order marked as delivered", "success");
      })
      .catch((err) => {
        console.error("Failed to update status:", err);
        showMessage("Failed to mark as delivered.", "error");
      });
  };

  // Start by loading the real orders
  loadOrdersFromAPI();
});
