// Main DOM elements
const orderIdEl = document.getElementById("orderId");
const statusValue = document.getElementById("statusValue");
const statusItems = Array.from(document.querySelectorAll("[data-status]"));
const itemListEl = document.getElementById("itemList");
const totalEl = document.getElementById("total");

// Helper to format money
const formatMoney = (n) => `${n.toFixed(0)} EGP`;

// Map backend order status to UI steps
const statusMap = {
  processing: 0,
  preparing: 1,
  enroute: 2,
  completed: 3
};

// Update progress UI (colors + current status)
const paintStatus = (index) => {
  statusItems.forEach((li, i) => {
    li.classList.remove("done", "current");
    if (i < index) li.classList.add("done");
    if (i === index) li.classList.add("current");
  });

  const state = statusItems[index];
  if (state) {
    statusValue.textContent = state.dataset.status;
    statusValue.className = `status-pill ${state.dataset.status
      .toLowerCase()
      .replace(/\s/g, '')}`;
  }
};

// Fill order summary and items (runs once)
const updateSummary = (order) => {
  document.getElementById("infoOrder").textContent = order.id;

  // Fake ETA (current time + 35 minutes)
  document.getElementById("infoEta").textContent = new Date(
    Date.now() + 35 * 60000
  ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  document.getElementById("infoPayment").textContent =
    order.paymentMethod?.toUpperCase() || "N/A";

  document.getElementById("infoAddress").textContent =
    order.customer?.address || "Address not provided";

  // Render ordered items
  itemListEl.innerHTML = "";
  if (order.items?.length) {
    order.items.forEach(item => {
      const li = document.createElement("li");
      li.dataset.price = item.price;
      li.innerHTML = `
        <span>${item.name}</span>
        <strong>${formatMoney(item.price)}</strong>
      `;
      itemListEl.appendChild(li);
    });
  }

  // Calculate and display total
  const total = order.items?.reduce((s, i) => s + i.price, 0) || 0;
  totalEl.textContent = formatMoney(total);
};

// Track current status to avoid unnecessary UI updates
let currentStatus = null;

// Load full order details (first time only)
const loadOrder = async () => {
  const stored = JSON.parse(localStorage.getItem("lastOrder") || "{}");

  if (!stored.id) {
    orderIdEl.textContent = "N/A";
    statusValue.textContent = "Order not found";
    return;
  }

  orderIdEl.textContent = `#${stored.id}`;

  try {
    const res = await fetch(`/api/orders/${stored.id}`);
    if (!res.ok) throw new Error("Order not found");

    const order = await res.json();

    updateSummary(order);

    currentStatus = order.status;
    paintStatus(statusMap[currentStatus] || 0);

  } catch (err) {
    console.error(err);
  }
};

// Check only order status (lightweight polling)
const checkStatus = async () => {
  const stored = JSON.parse(localStorage.getItem("lastOrder") || "{}");
  if (!stored.id) return;

  try {
    const res = await fetch(`/api/orders/${stored.id}`);
    const order = await res.json();

    // Update UI only if status changed
    if (order.status !== currentStatus) {
      currentStatus = order.status;
      paintStatus(statusMap[currentStatus] || 0);
    }

  } catch (err) {
    console.error(err);
  }
};

// Initial load
loadOrder();

// Auto refresh order status every 4 seconds
setInterval(checkStatus, 4000);
