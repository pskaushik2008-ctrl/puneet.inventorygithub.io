// Cache commonly used DOM elements
const itemForm = document.getElementById("itemForm");
const itemIdInput = document.getElementById("itemId");
const nameInput = document.getElementById("name");
const quantityInput = document.getElementById("quantity");
const priceInput = document.getElementById("price");
const formTitle = document.getElementById("formTitle");
const cancelBtn = document.getElementById("cancelBtn");
const messageBox = document.getElementById("message");
const tableBody = document.getElementById("itemsTableBody");

// Store current items from backend
let items = [];

// Show success or error messages on screen
function showMessage(text, type = "success") {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;

  // Auto clear message after 3 seconds
  setTimeout(() => {
    messageBox.textContent = "";
    messageBox.className = "message";
  }, 3000);
}

// Reset form to "Add New Item" mode
function resetForm() {
  itemForm.reset();
  itemIdInput.value = "";
  formTitle.textContent = "Add New Item";
  cancelBtn.classList.add("hidden");
}

// Basic frontend validation before sending data to backend
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

// Fetch all items from backend and render table
async function loadItems() {
  try {
    const response = await fetch("/api/items");
    const data = await response.json();

    if (!response.ok) {
      const detailedMessage = data.error ? `${data.message} (${data.error})` : data.message;
      throw new Error(detailedMessage || "Failed to load items.");
    }

    items = data;
    renderTable();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Render items table rows
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

// Fill form with item values to edit
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

// Delete item from backend
async function deleteItem(id) {
  const confirmed = window.confirm("Are you sure you want to delete this item?");
  if (!confirmed) return;

  try {
    const response = await fetch(`/api/items/${id}`, {
      method: "DELETE"
    });
    const data = await response.json();

    if (!response.ok) {
      const detailedMessage = data.error ? `${data.message} (${data.error})` : data.message;
      throw new Error(detailedMessage || "Failed to delete item.");
    }

    showMessage(data.message || "Item deleted successfully.");
    await loadItems();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

// Handle add/update form submit
itemForm.addEventListener("submit", async (event) => {
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

  const payload = {
    name,
    quantity: Number(quantity),
    price: Number(price)
  };

  try {
    const isEditMode = Boolean(id);
    const endpoint = isEditMode ? `/api/items/${id}` : "/api/items";
    const method = isEditMode ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      const detailedMessage = data.error ? `${data.message} (${data.error})` : data.message;
      throw new Error(detailedMessage || "Request failed.");
    }

    showMessage(data.message || "Saved successfully.");
    resetForm();
    await loadItems();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

// Cancel edit mode
cancelBtn.addEventListener("click", () => {
  resetForm();
});

// Load items when page opens
loadItems();
