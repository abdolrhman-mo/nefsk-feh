const form = document.getElementById("checkoutForm");
const items = Array.from(document.querySelectorAll("#itemSummary [data-price]"));
const totalEl = document.getElementById("total");
const messageEl = document.getElementById("message");
const paymentRadios = Array.from(document.querySelectorAll('input[name="payment"]'));
const cardFields = document.getElementById("cardFields");
const cardPreview = document.getElementById("cardPreview");

const formatMoney = (n) => `$${n.toFixed(2)}`;

const updateTotal = () => {
  const total = items.reduce((sum, item) => sum + Number(item.dataset.price), 0);
  totalEl.textContent = formatMoney(total);
};

const maskCard = (value) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "Enter card details to pay by credit card.";
  const masked = digits.replace(/.(?=.{4})/g, "•");
  return `Paying with card: ${masked}`;
};

const togglePayment = () => {
  const method = paymentRadios.find((r) => r.checked)?.value;
  const showCard = method === "card";
  cardFields.classList.toggle("hidden", !showCard);
  if (!showCard) cardPreview.textContent = "Paying with cash on delivery.";
};

const validateForm = () => {
  const name = form.name.value.trim();
  const phone = form.phone.value.trim();
  const address = form.address.value.trim();
  const payment = paymentRadios.find((r) => r.checked)?.value;
  if (!name || !phone || !address) return "Name, phone, and address are required.";
  if (phone.replace(/\D/g, "").length < 7) return "Phone should be at least 7 digits.";
  if (!payment) return "Choose a payment method.";
  if (payment === "card") {
    const num = document.getElementById("cardNumber").value.trim();
    const exp = document.getElementById("cardExpiry").value.trim();
    const cvc = document.getElementById("cardCvc").value.trim();
    if (!num || !exp || !cvc) return "Enter card number, expiry, and CVC.";
  }
  return "";
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const error = validateForm();
  if (error) {
    messageEl.textContent = error;
    messageEl.className = "message error";
    return;
  }

  // Prepare payload to send to backend
  const payment = paymentRadios.find((r) => r.checked)?.value;
  const payload = {
    customer: {
      name: form.name.value.trim(),
      phone: form.phone.value.trim(),
      address: form.address.value.trim(),
      notes: form.notes.value.trim()
    },
    items: items.map((i) => ({ name: i.dataset.name, price: Number(i.dataset.price) })),
    total: Number(totalEl.textContent.replace('$', '')),
    paymentMethod: payment,
    card: payment === "card" ? {
      number: document.getElementById("cardNumber").value.trim(),
      expiry: document.getElementById("cardExpiry").value.trim(),
      cvc: document.getElementById("cardCvc").value.trim()
    } : null,
    status: 'processing'
  };

  try {
    // Send order to backend
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    messageEl.textContent = `Order confirmed! ID: ${data.id}`;
    messageEl.className = "message success";

    // Save last order ID for tracking
    localStorage.setItem("lastOrder", JSON.stringify(data));

    // Redirect to tracking page after short delay
    setTimeout(() => {
      window.location.href = "order-tracking.html";
    }, 800
  );

    form.reset();
    togglePayment();
    updateTotal();
    cardPreview.textContent = "Paying with cash on delivery.";

  } catch (err) {
    console.error(err);
    messageEl.textContent = "Error placing order. Please try again.";
    messageEl.className = "message error";
  }
};

document.getElementById("cardNumber").addEventListener("input", (e) => {
  cardPreview.textContent = maskCard(e.target.value);
});
paymentRadios.forEach((r) => r.addEventListener("change", togglePayment));
form.addEventListener("submit", handleSubmit);

updateTotal();
togglePayment();
