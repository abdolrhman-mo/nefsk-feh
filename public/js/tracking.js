const orderIdEl = document.getElementById("orderId");
const statusValue = document.getElementById("statusValue");
const statusItems = Array.from(document.querySelectorAll("[data-status]"));
const itemListEl = document.getElementById("itemList");
const totalEl = document.getElementById("total");

// Format money
const formatMoney = (n) => `$${n.toFixed(2)}`;

// Mapping backend status → frontend stage index
const statusMap = {
  processing: 0,
  preparing: 1,
  enroute: 2,
  completed: 3
};

// Color + progress update
const paintStatus = (index) => {
  statusItems.forEach((li, i) => {
    li.classList.remove("done", "current");
    if (i < index) li.classList.add("done");
    if (i === index) li.classList.add("current");
  });

  const state = statusItems[index];
  if(state) {
    statusValue.textContent = state.dataset.status;
    statusValue.className = `status-pill ${state.dataset.status
      .toLowerCase()
      .replace(/\s/g,'')}`;
  }
};

// Fill order details + items (runs once)
const updateSummary = (order) => {
  document.getElementById("infoOrder").textContent = order.id;

  document.getElementById("infoEta").textContent = new Date(Date.now() + 35*60000)
    .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  document.getElementById("infoPayment").textContent =
    order.paymentMethod?.toUpperCase() || "N/A";

  document.getElementById("infoAddress").textContent =
    order.customer?.address || "Address not provided";

  // Items
  itemListEl.innerHTML = "";
  if(order.items?.length){
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

  // Total
  const total = order.items?.reduce((s, i) => s + i.price, 0) || 0;
  totalEl.textContent = formatMoney(total);
};

let currentStatus = null;

// Load all details (first time only)
const loadOrder = async () => {
  const stored = JSON.parse(localStorage.getItem("lastOrder") || "{}");

  if(!stored.id){
    orderIdEl.textContent = "N/A";
    statusValue.textContent = "Order not found";
    return;
  }

  orderIdEl.textContent = `#${stored.id}`;

  try {
    const res = await fetch(`/api/orders/${stored.id}`);
    if(!res.ok) throw new Error("Order not found");

    const order = await res.json();
    
    updateSummary(order);

    currentStatus = order.status;
    paintStatus(statusMap[currentStatus] || 0);

  } catch(err){
    console.error(err);
  }
};

// Only check status (efficient)
const checkStatus = async () => {
  const stored = JSON.parse(localStorage.getItem("lastOrder") || "{}");
  if(!stored.id) return;

  try {
    const res = await fetch(`/api/orders/${stored.id}`);
    const order = await res.json();

    if(order.status !== currentStatus){
      currentStatus = order.status;
      paintStatus(statusMap[currentStatus] || 0);
    }

  } catch(err){
    console.error(err);
  }
};

// Run first time
loadOrder();

// Auto-update every 4 seconds
setInterval(checkStatus, 4000);
