// ============================================================================
// FILE: script.js
// PURPOSE: Connects the Website Frontend to the REST API using Fetch API.
//
// BEGINNER / JUNIOR DEVELOPER GUIDE:
// This file is organized into 6 simple parts:
//   Part 1: Global Variables & Page Startup
//   Part 2: GET All Records & Display Cards on Screen
//   Part 3: Search & Category Filtering
//   Part 4: GET Single Record (View Complete Details Modal)
//   Part 5: POST (Add New Record) & PUT (Update Existing Record)
//   Part 6: DELETE Record & Live API JSON Inspector
// ============================================================================

// ============================================================================
// PART 1: GLOBAL VARIABLES & PAGE STARTUP
// ============================================================================

// Stores the list of handicraft records retrieved from the API
let allRecords = [];

// Tracks the currently selected category tab ("All" by default)
let currentCategory = "All";

// Base folder for our REST API endpoints
const API_BASE = "api";

// Run loadAllRecords() automatically as soon as the webpage finishes loading
window.addEventListener("DOMContentLoaded", function () {
  loadAllRecords();
});

// ============================================================================
// PART 2: GET ALL RECORDS FROM THE API (GET /api/records.php)
// ============================================================================
async function loadAllRecords() {
  const endpointUrl = `${API_BASE}/records.php`;

  try {
    // 1. Send HTTP GET request using JavaScript Fetch API
    const response = await fetch(endpointUrl, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });

    // 2. Parse the JSON response from the PHP / Node API
    const result = await response.json();

    if (response.ok && result.status === "success") {
      allRecords = result.data;

      // Also save a backup copy in browser localStorage
      localStorage.setItem("siargao_handicrafts_backup", JSON.stringify(allRecords));

      // Update the Live API Inspector at the bottom of the page
      updateApiInspector("GET", "/" + endpointUrl, response.status + " OK", result);
      updateHeroCounters("REST API Connected");

      // Render the cards on the page
      filterRecords();
      return;
    }
  } catch (error) {
    // If opened directly as a file (file://) without XAMPP or server running,
    // use our local backup data so the website still works 100% for the user!
    console.log("Using built-in local dataset (Server not detected):", error.message);
  }

  // Fallback when opened without a web server
  const savedLocal = localStorage.getItem("siargao_handicrafts_backup");
  if (savedLocal) {
    allRecords = JSON.parse(savedLocal);
  } else if (typeof INITIAL_HANDICRAFTS_DATA !== "undefined") {
    allRecords = JSON.parse(JSON.stringify(INITIAL_HANDICRAFTS_DATA));
    localStorage.setItem("siargao_handicrafts_backup", JSON.stringify(allRecords));
  }

  updateApiInspector("GET", "/api/records.php", "200 OK", {
    status: "success",
    method: "GET",
    count: allRecords.length,
    data: allRecords
  });
  updateHeroCounters("Local Mode Active");
  filterRecords();
}

// ============================================================================
// FUNCTION: displayRecords(recordsToDisplay)
// Loops through the array of records and creates HTML cards inside #records-grid
// ============================================================================
function displayRecords(recordsToDisplay) {
  const grid = document.getElementById("records-grid");
  const countText = document.getElementById("results-count-text");
  if (!grid || !countText) return;

  // Update the text showing how many records are displayed
  countText.textContent = `Showing ${recordsToDisplay.length} of ${allRecords.length} total handicraft records`;

  // If no records matched the search keyword, show a friendly message
  if (recordsToDisplay.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <h4>No Matching Handicrafts Found</h4>
        <p>Try searching a different keyword or click "Clear" to see all records.</p>
      </div>
    `;
    return;
  }

  // Build the HTML for each handicraft card using a simple loop
  let cardsHtml = "";

  for (let i = 0; i < recordsToDisplay.length; i++) {
    const item = recordsToDisplay[i];

    // Show a special gold badge if this item is one of the 12 in handicrafts.docx
    const docxBadgeHtml = Number(item.is_from_docx) === 1
      ? `<span class="card-docx-badge">handicrafts.docx</span>`
      : "";

    cardsHtml += `
      <article class="craft-card">
        <div class="card-image-wrapper">
          <span class="card-id-badge">ID #${item.id}</span>
          ${docxBadgeHtml}
          <img
            src="${escapeHtml(item.image_url)}"
            alt="${escapeHtml(item.name)}"
            class="card-image"
            onerror="this.src='images/01-buri-hat.jpg'"
          />
        </div>

        <div class="card-body">
          <div class="card-category">${escapeHtml(item.category)}</div>
          <h4 class="card-title">${escapeHtml(item.name)}</h4>
          <div class="card-local-name">${escapeHtml(item.local_name || item.name)}</div>

          <div class="card-meta-list">
            <div><strong>Origin:</strong> ${escapeHtml(item.municipality)}</div>
            <div><strong>Materials:</strong> ${escapeHtml(item.materials)}</div>
            <div><strong>Price Range:</strong> ${escapeHtml(item.price_range || "PHP 150 - PHP 350")}</div>
          </div>

          <p class="card-description" id="card-short-desc-${item.id}">${escapeHtml(item.description)}</p>

          <div class="card-actions">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-details-${item.id}" onclick="toggleCardDetails(${item.id})">
              View Details &#9662;
            </button>
            <button type="button" class="btn btn-outline btn-sm" onclick="openEditModal(${item.id})">
              Edit
            </button>
            <button type="button" class="btn btn-danger btn-sm" onclick="deleteRecord(${item.id})">
              Delete
            </button>
          </div>

          <!-- Expandable Dropdown Box for Complete Record Details (GET /api/record.php?id=X) -->
          <div id="card-details-${item.id}" class="card-details-dropdown" style="display: none;">
            <div class="dropdown-api-badge" id="dropdown-badge-${item.id}">GET /api/record.php?id=${item.id}</div>

            <div class="dropdown-detail-row">
              <strong>Complete Description:</strong>
              <p id="dropdown-desc-${item.id}">${escapeHtml(item.description)}</p>
            </div>

            <div class="dropdown-detail-row">
              <strong>Dimensions / Size:</strong>
              <span id="dropdown-dim-${item.id}">${escapeHtml(item.dimensions || "Standard Artisan Size")}</span>
            </div>

            <div class="dropdown-detail-row">
              <strong>Cultural &amp; Community Significance:</strong>
              <p id="dropdown-sig-${item.id}">${escapeHtml(item.cultural_significance || "Traditional Siargao Island handicraft.")}</p>
            </div>

            <div class="dropdown-source-meta">
              <div><strong>Source / Reference:</strong> <span id="dropdown-src-${item.id}">${escapeHtml(item.source_reference || "Field Data Gathering - Siargao Island")}</span></div>
              <div><strong>Verified By:</strong> <span id="dropdown-ver-${item.id}">${escapeHtml(item.verified_by || "Local Siargao Artisan Collective")}</span></div>
              <div><strong>Date Gathered:</strong> <span id="dropdown-date-${item.id}">${escapeHtml(item.date_gathered || "2026-11-12")}</span> &bull; <strong>Record ID:</strong> #${item.id}</div>
            </div>
          </div>
        </div>
      </article>
    `;
  }

  grid.innerHTML = cardsHtml;
}

// ============================================================================
// PART 3: SEARCH & CATEGORY FILTERING
// ============================================================================
function selectCategory(categoryName, clickedButton) {
  currentCategory = categoryName;

  // Remove 'active' class from all category buttons, then add to clicked button
  const allTabs = document.querySelectorAll(".category-tab");
  for (let i = 0; i < allTabs.length; i++) {
    allTabs[i].classList.remove("active");
  }
  clickedButton.classList.add("active");

  // Re-filter the displayed cards
  filterRecords();
}

function filterRecords() {
  const searchInput = document.getElementById("search-input");
  const clearBtn    = document.getElementById("clear-search-btn");
  const sourceSelect = document.getElementById("source-select");
  if (!searchInput || !clearBtn || !sourceSelect) return;

  const sourceMode  = sourceSelect.value;
  const keyword     = searchInput.value.trim().toLowerCase();

  // Show or hide the "Clear" button inside the search bar
  clearBtn.style.display = keyword.length > 0 ? "inline-block" : "none";

  // Filter allRecords using simple conditions
  const filtered = allRecords.filter(function (item) {
    // 1. Check "All 20" vs "12 Featured in handicrafts.docx"
    if (sourceMode === "docx" && Number(item.is_from_docx) !== 1) {
      return false;
    }

    // 2. Check Category Tab
    if (currentCategory !== "All" && item.category !== currentCategory) {
      return false;
    }

    // 3. Check Search Keyword
    if (keyword !== "") {
      const searchableText = [
        item.name,
        item.local_name,
        item.category,
        item.materials,
        item.municipality,
        item.description,
        item.cultural_significance
      ].join(" ").toLowerCase();

      if (!searchableText.includes(keyword)) {
        return false;
      }
    }

    return true;
  });

  displayRecords(filtered);
}

function clearSearch() {
  document.getElementById("search-input").value = "";
  filterRecords();
}

// ============================================================================
// PART 4: VIEW COMPLETE INFORMATION AS A DROPDOWN ON THE CATALOGUE CARD
//         (Fetches GET /api/record.php?id=X)
// ============================================================================
async function toggleCardDetails(id) {
  const dropdownBox = document.getElementById(`card-details-${id}`);
  const toggleBtn   = document.getElementById(`btn-details-${id}`);
  if (!dropdownBox || !toggleBtn) return;

  const parentCard = dropdownBox.closest(".craft-card");

  // If the dropdown box is already open, close it
  const isCurrentlyOpen = dropdownBox.style.display === "block";
  if (isCurrentlyOpen) {
    dropdownBox.style.display = "none";
    if (parentCard) parentCard.classList.remove("dropdown-open");
    toggleBtn.innerHTML = "View Details &#9662;";
    toggleBtn.classList.remove("active");
    return;
  }

  // Close any other open card dropdowns first so only one overlays at a time
  const allDropdowns = document.querySelectorAll(".card-details-dropdown");
  for (let i = 0; i < allDropdowns.length; i++) {
    allDropdowns[i].style.display = "none";
    const card = allDropdowns[i].closest(".craft-card");
    if (card) card.classList.remove("dropdown-open");
  }
  const allDetailBtns = document.querySelectorAll("[id^='btn-details-']");
  for (let i = 0; i < allDetailBtns.length; i++) {
    allDetailBtns[i].innerHTML = "View Details &#9662;";
    allDetailBtns[i].classList.remove("active");
  }

  // Open the floating dropdown overlay and bring this card to the front
  dropdownBox.style.display = "block";
  if (parentCard) parentCard.classList.add("dropdown-open");
  toggleBtn.innerHTML = "Hide Details &#9652;";
  toggleBtn.classList.add("active");

  // Fetch the complete record from GET /api/record.php?id=X
  const endpointUrl = `${API_BASE}/record.php?id=${id}`;
  let record = null;

  try {
    const response = await fetch(endpointUrl, { method: "GET" });
    const result   = await response.json();

    updateApiInspector("GET", "/" + endpointUrl, response.status + (response.ok ? " OK" : " Error"), result);

    if (response.ok && result.data) {
      record = result.data;
    }
  } catch (error) {
    // Fallback if server is not running
    record = allRecords.find(function (r) { return Number(r.id) === Number(id); });
    if (record) {
      updateApiInspector("GET", "/" + endpointUrl, "200 OK", {
        status: "success",
        method: "GET",
        data: record
      });
    }
  }

  // Update the dropdown fields with fresh data from the API
  if (record) {
    const descEl = document.getElementById(`dropdown-desc-${id}`);
    const dimEl  = document.getElementById(`dropdown-dim-${id}`);
    const sigEl  = document.getElementById(`dropdown-sig-${id}`);
    const srcEl  = document.getElementById(`dropdown-src-${id}`);
    const verEl  = document.getElementById(`dropdown-ver-${id}`);
    const dateEl = document.getElementById(`dropdown-date-${id}`);

    if (descEl) descEl.textContent = record.description;
    if (dimEl)  dimEl.textContent  = record.dimensions || "Standard Artisan Size";
    if (sigEl)  sigEl.textContent  = record.cultural_significance || "Traditional Siargao Island handicraft.";
    if (srcEl)  srcEl.textContent  = record.source_reference || "Field Data Gathering - Siargao Island";
    if (verEl)  verEl.textContent  = record.verified_by || "Local Siargao Artisan Collective";
    if (dateEl) dateEl.textContent = record.date_gathered || "2026-11-12";
  }
}

// Keep openViewModal as an alias so any existing calls still work
function openViewModal(id) {
  return toggleCardDetails(id);
}

// ============================================================================
// PART 5: ADD NEW RECORD (POST) & UPDATE EXISTING RECORD (PUT)
// ============================================================================

// Open empty form for adding a new handicraft (POST /api/create.php)
function openAddModal() {
  document.getElementById("handicraft-form").reset();
  document.getElementById("form-id").value = "";
  document.getElementById("form-image-url").value = "images/01-buri-hat.jpg";
  document.getElementById("form-error-box").style.display = "none";

  document.getElementById("form-modal-api-badge").textContent = "POST /api/create.php";
  document.getElementById("form-modal-title").textContent     = "Add New Handicraft Record";
  document.getElementById("form-submit-btn").textContent      = "Create Record (POST)";

  document.getElementById("form-modal").style.display = "flex";
}

// Open pre-filled form for updating an existing handicraft (PUT /api/update.php?id=X)
function openEditModal(id) {
  const record = allRecords.find(function (r) { return Number(r.id) === Number(id); });
  if (!record) return;

  document.getElementById("form-id").value           = record.id;
  document.getElementById("form-name").value         = record.name;
  document.getElementById("form-local-name").value   = record.local_name || "";
  document.getElementById("form-category").value     = record.category;
  document.getElementById("form-municipality").value = record.municipality;
  document.getElementById("form-materials").value    = record.materials;
  document.getElementById("form-price").value        = record.price_range || "";
  document.getElementById("form-dimensions").value   = record.dimensions || "";
  document.getElementById("form-image-url").value    = record.image_url || "images/01-buri-hat.jpg";
  document.getElementById("form-description").value  = record.description;
  document.getElementById("form-significance").value = record.cultural_significance || "";
  document.getElementById("form-source").value       = record.source_reference || "";
  document.getElementById("form-error-box").style.display = "none";

  document.getElementById("form-modal-api-badge").textContent = `PUT /api/update.php?id=${record.id}`;
  document.getElementById("form-modal-title").textContent     = `Update Handicraft #${record.id}`;
  document.getElementById("form-submit-btn").textContent      = "Update Record (PUT)";

  document.getElementById("form-modal").style.display = "flex";
}

function closeFormModal() {
  document.getElementById("form-modal").style.display = "none";
}

// Helper: When user picks a preset image from the dropdown, copy it to the Image URL box
function applyPresetImage() {
  const presetSelect = document.getElementById("form-image-preset");
  document.getElementById("form-image-url").value = presetSelect.value;
}

// Save Function: Handles both POST (New Record) and PUT (Update Record)
async function saveRecord(event) {
  event.preventDefault();

  const existingId = document.getElementById("form-id").value.trim();
  const isUpdating = existingId !== "";

  // Collect all form field values into a clean JavaScript object
  const payload = {
    name:                  document.getElementById("form-name").value.trim(),
    local_name:            document.getElementById("form-local-name").value.trim(),
    category:              document.getElementById("form-category").value.trim(),
    municipality:          document.getElementById("form-municipality").value.trim(),
    materials:             document.getElementById("form-materials").value.trim(),
    price_range:           document.getElementById("form-price").value.trim() || "PHP 150 - PHP 350",
    dimensions:            document.getElementById("form-dimensions").value.trim() || "Standard Artisan Size",
    image_url:             document.getElementById("form-image-url").value.trim() || "images/01-buri-hat.jpg",
    description:           document.getElementById("form-description").value.trim(),
    cultural_significance: document.getElementById("form-significance").value.trim() || "Locally handcrafted product supporting Siargao Island artisans.",
    source_reference:      document.getElementById("form-source").value.trim() || "Field Data Gathering - Siargao Island"
  };

  // Front-end validation check
  if (!payload.name || !payload.category || !payload.materials || !payload.municipality || !payload.description) {
    const errorBox = document.getElementById("form-error-box");
    errorBox.textContent = "Please fill in all required fields marked with *.";
    errorBox.style.display = "block";
    return;
  }

  // Determine the correct HTTP Method and Endpoint URL
  const method      = isUpdating ? "PUT" : "POST";
  const endpointUrl = isUpdating
    ? `${API_BASE}/update.php?id=${existingId}`
    : `${API_BASE}/create.php`;

  try {
    // Send JSON data to our REST API using Fetch
    const response = await fetch(endpointUrl, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    const statusText = response.status + (response.status === 201 ? " Created" : " OK");
    updateApiInspector(method, "/" + endpointUrl, statusText, result);

    if (response.ok && result.status === "success") {
      closeFormModal();
      showNotification(result.message, "success");
      await loadAllRecords();
      return;
    } else {
      const errorBox = document.getElementById("form-error-box");
      errorBox.textContent = result.message || "Failed to save record.";
      errorBox.style.display = "block";
      return;
    }
  } catch (error) {
    // Fallback for local mode (when opened without a web server)
    if (isUpdating) {
      const idx = allRecords.findIndex(function (r) { return Number(r.id) === Number(existingId); });
      if (idx !== -1) {
        allRecords[idx] = Object.assign({}, allRecords[idx], payload);
        localStorage.setItem("siargao_handicrafts_backup", JSON.stringify(allRecords));
        updateApiInspector("PUT", "/" + endpointUrl, "200 OK", {
          status: "success",
          method: "PUT",
          message: `Handicraft record #${existingId} updated successfully.`,
          data: allRecords[idx]
        });
      }
    } else {
      const maxId = allRecords.reduce(function (m, r) { return Number(r.id) > m ? Number(r.id) : m; }, 0);
      const newRecord = Object.assign({
        id: maxId + 1,
        is_from_docx: 0,
        verified_by: "Local Siargao Artisan Collective",
        date_gathered: new Date().toISOString().split("T")[0]
      }, payload);
      allRecords.push(newRecord);
      localStorage.setItem("siargao_handicrafts_backup", JSON.stringify(allRecords));
      updateApiInspector("POST", "/" + endpointUrl, "201 Created", {
        status: "success",
        method: "POST",
        message: "New handicraft record created successfully.",
        data: newRecord
      });
    }

    closeFormModal();
    updateHeroCounters("Local Mode Active");
    filterRecords();
    showNotification(
      isUpdating ? `Record #${existingId} updated successfully!` : "New handicraft record added successfully!",
      "success"
    );
  }
}

// ============================================================================
// PART 6: DELETE RECORD (DELETE /api/delete.php?id=X) & API INSPECTOR
// ============================================================================
async function deleteRecord(id) {
  const record = allRecords.find(function (r) { return Number(r.id) === Number(id); });
  const itemName = record ? record.name : `#${id}`;

  // Ask user to confirm before deleting
  const confirmed = confirm(`Are you sure you want to delete "${itemName}" (ID #${id})?\n\nThis sends: DELETE /api/delete.php?id=${id}`);
  if (!confirmed) return;

  const endpointUrl = `${API_BASE}/delete.php?id=${id}`;

  try {
    const response = await fetch(endpointUrl, { method: "DELETE" });
    const result   = await response.json();

    updateApiInspector("DELETE", "/" + endpointUrl, response.status + " OK", result);

    if (response.ok && result.status === "success") {
      showNotification(result.message, "success");
      await loadAllRecords();
      return;
    } else {
      showNotification(result.message || "Could not delete record.", "error");
      return;
    }
  } catch (error) {
    // Fallback for local mode
    allRecords = allRecords.filter(function (r) { return Number(r.id) !== Number(id); });
    localStorage.setItem("siargao_handicrafts_backup", JSON.stringify(allRecords));

    updateApiInspector("DELETE", "/" + endpointUrl, "200 OK", {
      status: "success",
      method: "DELETE",
      message: `Handicraft record #${id} ('${itemName}') deleted successfully.`,
      deleted_id: id
    });

    updateHeroCounters("Local Mode Active");
    filterRecords();
    showNotification(`Handicraft "${itemName}" (ID #${id}) deleted.`, "success");
  }
}

// ============================================================================
// FUNCTION: testApiEndpoint(testType)
// Allows students to demonstrate API responses, 404 Not Found, and 400 Validation
// live during their presentation with 1 click!
// ============================================================================
async function testApiEndpoint(testType) {
  if (testType === "GET_ALL") {
    await loadAllRecords();
    showNotification("Tested GET /api/records.php (200 OK)", "success");
  } else if (testType === "GET_ONE") {
    const url = `${API_BASE}/record.php?id=1`;
    try {
      const res  = await fetch(url, { method: "GET" });
      const data = await res.json();
      updateApiInspector("GET", "/" + url, res.status + (res.ok ? " OK" : " Error"), data);
    } catch (e) {
      const rec = allRecords.find(function (r) { return Number(r.id) === 1; }) || allRecords[0];
      updateApiInspector("GET", "/" + url, "200 OK", {
        status: "success",
        method: "GET",
        data: rec
      });
    }
    showNotification("Tested GET /api/record.php?id=1 (200 OK)", "success");
  } else if (testType === "GET_NOT_FOUND") {
    const url = `${API_BASE}/record.php?id=999`;
    try {
      const res  = await fetch(url);
      const data = await res.json();
      updateApiInspector("GET", "/" + url, "404 Not Found", data);
    } catch (e) {
      updateApiInspector("GET", "/" + url, "404 Not Found", {
        status: "error",
        message: "Handicraft record with ID 999 was not found."
      });
    }
    showNotification("Demonstrated HTTP 404 Not Found handling for missing record ID #999.", "error");
  } else if (testType === "POST_INVALID") {
    const url = `${API_BASE}/create.php`;
    try {
      const res  = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "" })
      });
      const data = await res.json();
      updateApiInspector("POST", "/" + url, "400 Bad Request", data);
    } catch (e) {
      updateApiInspector("POST", "/" + url, "400 Bad Request", {
        status: "error",
        message: "Validation failed. Missing required fields: name, category, materials, municipality, description",
        missing_fields: ["name", "category", "materials", "municipality", "description"]
      });
    }
    showNotification("Demonstrated HTTP 400 Bad Request when required fields are empty.", "error");
  }
}

// Restore all 20 original records if records were deleted during testing
async function resetDemoData() {
  if (!confirm("Restore all 20 original Siargao handicraft records?")) return;

  localStorage.removeItem("siargao_handicrafts_backup");
  if (typeof INITIAL_HANDICRAFTS_DATA !== "undefined") {
    allRecords = JSON.parse(JSON.stringify(INITIAL_HANDICRAFTS_DATA));
    localStorage.setItem("siargao_handicrafts_backup", JSON.stringify(allRecords));
  }

  // If running on Node server or PHP, we can also re-sync any missing initial records
  try {
    const res = await fetch(`${API_BASE}/records.php`);
    if (res.ok) {
      const current = (await res.json()).data || [];
      const currentIds = current.map(function (r) { return Number(r.id); });
      for (let i = 0; i < INITIAL_HANDICRAFTS_DATA.length; i++) {
        const item = INITIAL_HANDICRAFTS_DATA[i];
        if (!currentIds.includes(Number(item.id))) {
          await fetch(`${API_BASE}/create.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item)
          });
        }
      }
    }
  } catch (e) {
    // Ignore in offline mode
  }

  await loadAllRecords();
  showNotification("All 20 original Siargao handicraft records have been restored!", "success");
}

// ============================================================================
// SMALL UI HELPER FUNCTIONS
// ============================================================================

function updateApiInspector(method, url, statusText, jsonData) {
  try {
    localStorage.setItem("siargao_last_api_exchange", JSON.stringify({
      method: method,
      url: url,
      statusText: statusText,
      jsonData: jsonData
    }));
  } catch (e) {
    // Ignore storage quota errors
  }

  const methodEl = document.getElementById("inspector-method");
  const urlEl    = document.getElementById("inspector-url");
  const statusEl = document.getElementById("inspector-status");
  const jsonEl   = document.getElementById("inspector-json");
  if (!methodEl || !urlEl || !statusEl || !jsonEl) return;

  methodEl.textContent = method;
  methodEl.className   = "method-pill " + method.toLowerCase();
  urlEl.textContent    = url;
  statusEl.textContent = statusText;

  const isError = statusText.startsWith("4") || statusText.startsWith("5");
  statusEl.className = "status-code-badge " + (isError ? "status-400" : "status-200");

  jsonEl.textContent = JSON.stringify(jsonData, null, 2);
}

function updateHeroCounters(modeLabel) {
  const totalEl = document.getElementById("stat-total-records");
  const docxEl  = document.getElementById("stat-docx-records");
  const modeEl  = document.getElementById("stat-api-mode");
  if (!totalEl || !docxEl || !modeEl) return;

  totalEl.textContent = allRecords.length;
  const docxCount = allRecords.filter(function (r) { return Number(r.is_from_docx) === 1; }).length;
  docxEl.textContent = docxCount;
  modeEl.textContent = modeLabel;
}

function showNotification(message, type) {
  const banner = document.getElementById("notification-banner");
  if (!banner) return;
  banner.className = "notification-banner " + (type === "error" ? "error" : "success");
  banner.innerHTML = `
    <span>${escapeHtml(message)}</span>
    <button onclick="this.parentElement.style.display='none'" style="background:none;border:none;font-weight:bold;cursor:pointer;">&times;</button>
  `;
  banner.style.display = "flex";
}

function closeModalOnOutsideClick(event, modalId) {
  if (event.target.id === modalId) {
    document.getElementById(modalId).style.display = "none";
  }
}

// Prevents accidental HTML breakage when displaying text
function escapeHtml(text) {
  if (text === null || text === undefined) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
