const store = new Store();

const storeList = document.querySelector("#store-list");
const form = document.querySelector("#product-form");
const products = document.querySelector("#products");
const emptyMessage = document.querySelector("#empty-message");
const total = document.querySelector("#total");
const storeMessage = document.querySelector("#store-message");

const nameInput = document.querySelector("#name");
const priceInput = document.querySelector("#price");
const qtyInput = document.querySelector("#qty");

function formatMoney(value) {
  return `${value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} ₸`;
}

function setError(input, errorElement, message) {
  errorElement.textContent = message;
  input.setAttribute("aria-invalid", String(Boolean(message)));
}

function createCard(item, index) {
  const card = document.createElement("article");
  card.className = "product-card";
  card.dataset.name = item.name;

  card.innerHTML = `
    <div class="product-visual" aria-hidden="true"></div>
    <div class="product-info">
      <h3></h3>
      <p class="product-price"></p>

      <label>Quantity</label>
      <input type="number" min="0" step="1" required>
      <p class="error" aria-live="polite"></p>

      <p class="product-subtotal"></p>

      <div class="actions">
        <button type="button" data-action="update">Update</button>
        <button type="button" data-action="remove">Remove</button>
      </div>
    </div>
  `;

  card.querySelector(".product-visual").textContent =
    item.name.slice(0, 2).toUpperCase();

  card.querySelector("h3").textContent = item.name;
  card.querySelector(".product-price").textContent =
    formatMoney(item.price);

  const input = card.querySelector("input");
  const label = card.querySelector("label");
  const error = card.querySelector(".error");

  input.id = `product-qty-${index}`;
  input.value = item.qty;

  label.htmlFor = input.id;
  error.id = `product-error-${index}`;
  input.setAttribute("aria-describedby", error.id);

  card.querySelector(".product-subtotal").textContent =
    `Subtotal: ${formatMoney(item.price * item.qty)}`;

  return card;
}

function render() {
  products.replaceChildren();

  const items = store.items;

  items.forEach((item, index) => {
    products.append(createCard(item, index));
  });

  emptyMessage.hidden = items.length > 0;
  total.textContent = formatMoney(store.total());
}

function addProduct() {
  const name = nameInput.value.trim();
  const price = priceInput.valueAsNumber;
  const qty = qtyInput.valueAsNumber;

  const nameError = name === ""
    ? "Enter a product name."
    : "";

  const priceError = !Number.isFinite(price) || price <= 0
    ? "Enter a price greater than zero."
    : "";

  const qtyError = !Number.isInteger(qty) || qty < 0
    ? "Enter a whole number of zero or more."
    : "";

  setError(
    nameInput,
    document.querySelector("#name-error"),
    nameError
  );

  setError(
    priceInput,
    document.querySelector("#price-error"),
    priceError
  );

  setError(
    qtyInput,
    document.querySelector("#qty-error"),
    qtyError
  );

  if (nameError || priceError || qtyError) {
    form.querySelector('[aria-invalid="true"]').focus();
    return;
  }

  const alreadyExists = Boolean(store.find(name));

  store.add({ name, price, qty });
  form.reset();
  render();

  storeMessage.textContent = alreadyExists
    ? `${name}: quantity increased. The original price was kept.`
    : `${name} added.`;

  nameInput.focus();
}

function updateProduct(card) {
  const input = card.querySelector("input");
  const error = card.querySelector(".error");
  const qty = input.valueAsNumber;

  if (!Number.isInteger(qty) || qty < 0) {
    setError(input, error, "Enter a whole number of zero or more.");
    input.focus();
    return;
  }

  const name = card.dataset.name;

  store.updateQty(name, qty);
  render();
  storeMessage.textContent = `${name}: quantity updated.`;
}

function removeProduct(card) {
  const name = card.dataset.name;

  store.remove(name);
  render();
  storeMessage.textContent = `${name} removed.`;
}

storeList.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button || !storeList.contains(button)) {
    return;
  }

  event.preventDefault();
  storeMessage.textContent = "";

  const action = button.dataset.action;

  if (action === "add") {
    addProduct();
    return;
  }

  const card = button.closest(".product-card");

  if (!card) {
    return;
  }

  if (action === "update") {
    updateProduct(card);
  } else if (action === "remove") {
    removeProduct(card);
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  storeMessage.textContent = "";
  addProduct();
});

render();