// Grocery Inventory Management (Static Version)
// This file works on GitHub Pages because it uses localStorage (no backend API).

const itemForm = document.getElementById("itemForm");
const itemIdInput = document.getElementById("itemId");
const nameInput = document.getElementById("name");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelBtn");
const messageBox = document.getElementById("message");
const tableBody = document.getElementById("itemsTableBody");

const STORAGE_KEY = "grocery_inventory_items";
const COUNTER_KEY = "grocery_inventory_last_id";

let items = [];

function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;

  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message";
  }, 3000);
}

function validateForm(name, quantity, price) {
  if (!name || name.trim().length < 2) {
    return "Item name must have at least 2 characters.";
  }

  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
    return "Quantity must be a whole number 0 or greater.";
  }

  const parsedPrice = Number(price);
  if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
    return "Price must be a valid number 0 or greater.";
  }

  return null;
}

function loadFromStorage() {
  const storedItems = localStorage.getItem(STORAGE_KEY);
  items = storedItems ? JSON.parse(storedItems) : [];
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getNextId() {
  const lastId = Number(localStorage.getItem(COUNTER_KEY) || "0");
  const nextId = lastId + 1;
  localStorage.setItem(COUNTER_KEY, String(nextId));
  return nextId;
}

function resetForm() {
  itemForm.reset();
  itemIdInput.value = "";
  formTitle.textContent = "Add New Item";
  cancelBtn.classList.add("hidden");
}

function renderTable() {
  if (items.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="5">No items found. Add your first item above.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${Number(item.price).toFixed(2)}</td>
        <td>
          <button class="edit-btn" onclick="editItem(${item.id})">Edit</button>
          <button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button>
        </td>
      </tr>
    `
    )
    .join("");
}

function editItem(id) {
  const item = items.find((currentItem) => currentItem.id === id);
  if (!item) {
    showMessage("Selected item not found.", "error");
    return;
  }

  itemIdInput.value = item.id;
  nameInput.value = item.name;
  quantityInput.value = item.quantity;
  priceInput.value = item.price;
  formTitle.textContent = `Edit Item #${item.id}`;
  cancelBtn.classList.remove("hidden");
}

function deleteItem(id) {
  const confirmed = window.confirm("Are you sure you want to delete this item?");
  if (!confirmed) return;

  items = items.filter((item) => item.id !== id);
  saveToStorage();
  renderTable();
  showMessage("Item deleted successfully.");
}

itemForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = itemIdInput.value;
  const name = nameInput.value.trim();
  const quantity = quantityInput.value;
  const price = priceInput.value;

  const validationError = validateForm(name, quantity, price);
  if (validationError) {
    showMessage(validationError, "error");
    return;
  }

  if (id) {
    items = items.map((item) =>
      item.id === Number(id)
        ? { ...item, name, quantity: Number(quantity), price: Number(price) }
        : item
    );
    showMessage("Item updated successfully.");
  } else {
    const newItem = {
      id: getNextId(),
      name,
      quantity: Number(quantity),
      price: Number(price)
    };
    items.unshift(newItem);
    showMessage("Item added successfully.");
  }

  saveToStorage();
  renderTable();
  resetForm();
});

cancelBtn.addEventListener("click", () => {
  resetForm();
});

// Initialize app on page load
loadFromStorage();
renderTable();
