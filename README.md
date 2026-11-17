# Siargao Island Local Handicrafts & Products – Knowledge Repository (Group 5)

**Course:** System Integration and Architecture – Final Project  
**Project Title:** Local Knowledge Repository – API Development and Web Integration  
**Topic:** Local Handicrafts and Products of Siargao Island, Surigao del Norte

---

## 1. List of System Features

### A. Website & User Interface Features (`index.html`, `style.css`, `script.js`)
1. **Display All Collected Handicrafts (`GET /api/records.php`):**
   - Automatically fetches and displays all 20 documented Siargao handicraft records in a responsive card grid with original field photographs, local Surigaonon/Visayan names, categories, origin municipalities, materials, and price ranges.
2. **View Complete Record Details (`GET /api/record.php?id=1`):**
   - Clicking **"View Details"** on any card fetches that specific record from the API and opens a detailed modal showing full cultural significance, dimensions, data gathering source/reference, verifying artisan name, and date gathered.
3. **Real-Time Keyword Search & Category Filtering:**
   - Instant keyword search bar that filters records by name, local name (e.g., *Salakot*, *Nigo*, *Sungkaan*, *Paypay*), raw material (*Buri*, *Rattan*, *Pandan*, *Bamboo*, *Clay*), municipality (*Dapa*, *General Luna*, *Del Carmen*, *San Isidro*, *Pilar*), or description.
   - Category filter tabs (*All Categories*, *Woven Headwear & Fans*, *Baskets & Storage*, *Home & Table Decor*, *Woodcraft & Games*, *Traditional Earthenware*).
   - **"View Set" Selector:** Switch between viewing **All 20 Collected Records (Full DB)** or the **12 Featured Items from `handicrafts.docx`**.
4. **Add New Handicraft Record (`POST /api/create.php`):**
   - Clean modal form with required-field validation and a convenient preset photograph selector (or custom image URL input) that sends a `POST` request in JSON format.
5. **Update Existing Handicraft Record (`PUT /api/update.php?id=1`):**
   - Clicking **"Edit"** pre-fills the form with the current record's data and sends a `PUT` request to update the record.
6. **Delete Handicraft Record (`DELETE /api/delete.php?id=1`):**
   - Clicking **"Delete"** asks for confirmation before sending a `DELETE` request to remove the record.
7. **1-Click "Reset 20 Records" Button:**
   - Easily restores all 20 original handicraft records if items were edited or deleted during testing or live presentation demonstrations.

### B. System Integration & Presentation Features
8. **Live REST API & JSON Exchange Inspector:**
   - Built directly into the webpage (`#api-inspector-section`) so you can show your instructor the live HTTP method (`GET`, `POST`, `PUT`, `DELETE`), endpoint URL, HTTP status code (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`), and raw JSON response for every action.
   - Includes **Quick Endpoint Test Buttons** to demonstrate `404 Not Found` (missing ID) and `400 Bad Request` (validation error) with one click.
9. **On-Page System Architecture Diagram & ERD:**
   - Visual System Architecture diagram and Entity Relationship Diagram (ERD) showing how the 3 MySQL tables (`categories`, `handicrafts`, `sources`) connect via Primary and Foreign Keys.
10. **External Application Demo (`client-demo.html` — Section IV Additional Challenge):**
    - A separate mobile-styled web application (*"Discover Siargao Crafts – Tourist Souvenir Companion"*) that consumes the exact same `GET /api/records.php` endpoint to demonstrate API reusability by another application.

---

## 2. Important Things to Note

- **1. Separated Reference Files (`initial_files/`):**
  - As requested, the initial files (`handicrafts.docx`, `System-Integration-and-Technology-Final-Project (1).docx`, and `System-Presentation-Rubrics.pdf`) are stored cleanly inside the `initial_files/` folder away from the website and API code.
- **2. How the 20 Records Were Prepared from `handicrafts.docx`:**
  - The project instructions require **at least 20 unique records** with original photographs.
  - **Records #1 to #12** are the exact 12 labeled items in `handicrafts.docx` (*Buri Hat, Woven Baskets, Sungka, Woven Placemat, Native Woven Hats, Native Woven Hand Fan, Woven Rattan Decorative Ball, Native Rattan Flower Decor, Native Woven Storage Baskets, Native Woven Animal-Shaped Bags, Nigo Basket, Native Woven Deer Decoration*), marked with a gold `handicrafts.docx` badge on the website.
  - **Records #13 to #20** are 8 additional authentic handicrafts cropped directly from the *same original field photographs* inside `handicrafts.docx` (such as the carved wooden bowls/plates, white pandan bayong tote, bamboo planter basket, capiz shell globe lantern, clay palayok pots, clay kalan stove, and tall rattan hamper visible on the shelves).
- **3. Works With OR Without XAMPP Installed (Triple Fallback Design):**
  - **In XAMPP / Laragon:** Apache runs the PHP files inside `api/` and queries the MySQL database (`siargao_handicrafts_db`).
  - **In Node.js (`start-server.bat` / `node server.js`):** If a computer does not have XAMPP installed, `server.js` serves the website and emulates the exact same `/api/*.php` endpoints using `database/records.json` (and even works with Postman!).
  - **Direct File Open (`index.html`):** If someone double-clicks `index.html` directly without starting any server, `script.js` automatically falls back to `database/initial_data.js` and `localStorage` so the website never breaks or shows a blank page.
- **4. Beginner-Friendly, Easy-to-Maintain Code:**
  - No complicated frameworks (no React, Vue, Webpack, or TypeScript) are used.
  - All HTML, CSS, JavaScript, PHP, and SQL files use basic loops, plain-English function names, and step-by-step comments so any student or junior developer can read and explain the code during Q&A.
- **5. Security & Validation (For Rubric Q&A):**
  - **SQL Injection Prevention:** All PHP database queries use `mysqli` **Prepared Statements** (`$conn->prepare()` and `$stmt->bind_param()`).
  - **Input Validation:** Both the frontend form and the backend API check that required fields (`name`, `category`, `materials`, `municipality`, `description`) are not empty before inserting or updating.
  - **XSS Prevention:** All dynamic text rendered in JavaScript passes through `escapeHtml()`.

---

## 3. How to Run the System

You can run the system using **any of the 3 methods** below depending on what is installed on your computer:

### Method 1: Using XAMPP or Laragon (Standard PHP + MySQL Setup)
Use this method when demonstrating the full PHP + MySQL integration required by the syllabus:

1. **Copy the Project Folder:**
   - Copy the entire `SystemIntegFinals` folder into `C:\xampp\htdocs\SystemIntegFinals` (for XAMPP) or `C:\laragon\www\SystemIntegFinals` (for Laragon).
2. **Start Apache and MySQL:**
   - Open the **XAMPP Control Panel** and click **Start** next to both **Apache** and **MySQL**.
3. **Import the MySQL Database:**
   - Open your browser and go to `http://localhost/phpmyadmin`.
   - Click the **Import** tab at the top.
   - Click **Choose File** and select `database/siargao_handicrafts.sql` from this project folder.
   - Scroll down and click **Import** (or **Go**). This automatically creates the database `siargao_handicrafts_db` along with the 3 relational tables (`categories`, `sources`, `handicrafts`) and all 20 records.
4. **Open the Website:**
   - Visit **`http://localhost/SystemIntegFinals/`** in your web browser.
   - Visit **`http://localhost/SystemIntegFinals/client-demo.html`** to view the external app demo.

---

### Method 2: 1-Click Local Server (No XAMPP Required!)
Use this method if XAMPP is not installed on your laptop—it runs a local web and REST API server using Node.js:

1. Double-click **`start-server.bat`** in the project folder (or open a terminal in the folder and run `node server.js`).
2. Your browser will automatically open **`http://localhost:3000`**.
3. All REST API endpoints (`GET`, `POST`, `PUT`, `DELETE`) will be live at **`http://localhost:3000/api/records.php`** and save changes to `database/records.json`.

---

### Method 3: Direct Browser Open (Zero Setup)
1. Simply double-click **`index.html`** in Windows File Explorer.
2. The website will automatically detect that no server is running and switch to **Local Mode**, allowing you to browse, search, filter, view, add, edit, and delete records right in your browser.

---

### How to Test the API in Postman
1. Open **Postman**.
2. Click **Import** (top left) and select **`docs/Siargao_Handicrafts_Postman_Collection.json`**.
3. If using **Method 2 (`node server.js`)**, the collection variable `{{base_url}}` is already set to `http://localhost:3000`.
4. If using **Method 1 (XAMPP)**, change the `{{base_url}}` variable in the collection to `http://localhost/SystemIntegFinals`.
5. Click through the 7 pre-configured requests (`GET All`, `GET Single`, `POST Create`, `PUT Update`, `DELETE`, `404 Demo`, `400 Demo`) and click **Send** to take your Postman screenshots!

---

## 4. Folder Structure Reference

```text
SystemIntegFinals/
├── initial_files/                  <-- Separated initial instructions & reference files
│   ├── handicrafts.docx
│   ├── System-Integration-and-Technology-Final-Project (1).docx
│   └── System-Presentation-Rubrics.pdf
│
├── index.html                      <-- Main Website (Catalog, Search, Add/Edit/Delete, Live API Inspector, ERD)
├── client-demo.html                <-- Bonus External Mobile Web App consuming the REST API
├── style.css                       <-- Beginner-friendly CSS stylesheet with color variables
├── script.js                       <-- Beginner-friendly JavaScript using Fetch API (GET, POST, PUT, DELETE)
│
├── api/                            <-- PHP + MySQL RESTful API Endpoints
│   ├── config.php                  <-- Database connection & JSON response helper
│   ├── records.php                 <-- GET all handicraft records
│   ├── record.php                  <-- GET a single handicraft record (?id=1)
│   ├── create.php                  <-- POST to insert a new handicraft record
│   ├── update.php                  <-- PUT to update an existing handicraft record (?id=1)
│   └── delete.php                  <-- DELETE a handicraft record (?id=1)
│
├── database/                       <-- Database SQL & Fallback Data
│   ├── siargao_handicrafts.sql     <-- Full MySQL database schema (3 tables) + 20 records
│   ├── initial_data.js             <-- Starter data array for offline/browser fallback
│   └── records.json                <-- JSON storage used when running via node server.js
│
├── images/                         <-- 20 photographs extracted & cropped from handicrafts.docx
│   ├── 01-buri-hat.jpg ... 20-woven-laundry-hamper.jpg
│
├── docs/                           <-- Postman Collection & Documentation
│   └── Siargao_Handicrafts_Postman_Collection.json
│
├── server.js                       <-- Zero-dependency Node.js server (runs API without XAMPP!)
├── start-server.bat                <-- 1-click launcher for Windows
└── README.md                       <-- Project features, notes, and setup instructions
```

---

## 5. Quick Guide for Modifying the Code

- **To change website colors:** Open `style.css` and edit the color hex codes inside `:root` at the very top of the file (lines 10–22).
- **To change MySQL database credentials:** Open `api/config.php` and edit `$host`, `$username`, `$password`, and `$dbname` (lines 22–25).
- **To modify how cards or modals work:** Open `script.js`, which is divided into 6 clearly labeled parts:
  1. `loadAllRecords()` — Calls `fetch('api/records.php')` (`GET`)
  2. `displayRecords()` — Loops through the records and creates the HTML cards
  3. `filterRecords()` — Filters cards by keyword and category
  4. `openViewModal(id)` — Calls `fetch('api/record.php?id=' + id)` (`GET`)
  5. `saveRecord(event)` — Calls `fetch('api/create.php')` (`POST`) or `fetch('api/update.php?id=' + id)` (`PUT`)
  6. `deleteRecord(id)` — Calls `fetch('api/delete.php?id=' + id)` (`DELETE`)
