const orderIdEl = document.getElementById("orderId");
const statusValue = document.getElementById("statusValue");
const statusItems = Array.from(document.querySelectorAll("[data-status]"));
const itemListEl = document.getElementById("itemList");
const totalEl = document.getElementById("total");

const statuses = [
  { name: "Pending", delay: 3000, color: "pending" },
  { name: "Preparing", delay: 4000, color: "pending" },
  { name: "Out for delivery", delay: 5000, color: "enroute" },
  { name: "Delivered", delay: 0, color: "delivered" }
];

const formatMoney = (n) => `$${n.toFixed(2)}`;

const setOrderId = () => {
  const stored = JSON.parse(localStorage.getItem("lastOrder") || "{}");
  const id = stored.orderId || `QB-${Math.floor(Math.random() * 90000 + 10000)}`;
  orderIdEl.textContent = `#${id}`;
  return id;
};

const updateTotal = () => {
  const items = Array.from(itemListEl.querySelectorAll("[data-price]"));
  const total = items.reduce((sum, li) => sum + Number(li.dataset.price), 0);
  totalEl.textContent = formatMoney(total);
};

const paintStatus = (index) => {
  statusItems.forEach((li, i) => {
    li.classList.remove("done", "current");
    if (i < index) li.classList.add("done");
    if (i === index) li.classList.add("current");
  });
  const state = statuses[index];
  statusValue.textContent = state.name;
  statusValue.className = `status-pill ${state.color} ${index === statuses.length - 1 ? "done" : "current"}`;
};

const runProgress = (idx = 0) => {
  paintStatus(idx);
  const state = statuses[idx];
  if (idx < statuses.length - 1) {
    setTimeout(() => runProgress(idx + 1), state.delay);
  }
};

const setSummary = () => {
  const stored = JSON.parse(localStorage.getItem("lastOrder") || "{}");
  document.getElementById("infoOrder").textContent = stored.orderId || orderIdEl.textContent;
  const eta = new Date(Date.now() + 35 * 60000);
  document.getElementById("infoEta").textContent = eta.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  document.getElementById("infoPayment").textContent = stored.payment ? stored.payment.toUpperCase() : "N/A";
  document.getElementById("infoAddress").textContent = stored.customer?.address || "Address not provided";

  if (stored.items?.length) {
    itemListEl.innerHTML = "";
    stored.items.forEach((item) => {
      const li = document.createElement("li");
      li.dataset.price = item.price;
      li.innerHTML = `<span>${item.name}</span><strong>${formatMoney(item.price)}</strong>`;
      itemListEl.appendChild(li);
    });
  }
};

setOrderId();
setSummary();
updateTotal();
runProgress();
