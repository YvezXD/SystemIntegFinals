// ============================================================================
// FILE: server.js
// PURPOSE: Built-in Local Web & REST API Server (No XAMPP installation needed!)
//
// HOW TO USE:
// - Option A (XAMPP): Copy this project folder to C:\xampp\htdocs\ and use
//   Apache + MySQL. Apache will run the PHP files in the /api/ folder.
// - Option B (Node.js): Run "node server.js" (or double-click start-server.bat)
//   and open http://localhost:3000 in your browser or Postman!
// ============================================================================

const http = require("http");
const fs   = require("fs");
const path = require("path");
const url  = require("url");

const INITIAL_DATA = require("./database/initial_data.js");
const DB_JSON_PATH = path.join(__dirname, "database", "records.json");
const PORT = 3000;

// Ensure database/records.json exists with the 20 initial records
if (!fs.existsSync(DB_JSON_PATH)) {
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(INITIAL_DATA, null, 2), "utf8");
}

function readRecords() {
  try {
    const raw = fs.readFileSync(DB_JSON_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [...INITIAL_DATA];
  }
}

function writeRecords(records) {
  fs.writeFileSync(DB_JSON_PATH, JSON.stringify(records, null, 2), "utf8");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function parseRequestBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

const MIME_TYPES = {
  ".html": "text/html; charset=UTF-8",
  ".css":  "text/css; charset=UTF-8",
  ".js":   "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".svg":  "image/svg+xml",
  ".ico":  "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname  = parsedUrl.pathname;
  const query     = parsedUrl.query;
  const method    = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // ==========================================================================
  // REST API ENDPOINT 1: GET /api/records.php
  // ==========================================================================
  if (pathname === "/api/records.php") {
    if (method !== "GET") {
      return sendJson(res, 405, {
        status: "error",
        message: "Method Not Allowed. Please use GET for /api/records.php."
      });
    }

    let records  = readRecords();
    const search   = (query.search || "").trim().toLowerCase();
    const category = (query.category || "").trim();

    if (search) {
      records = records.filter((r) =>
        (r.name && r.name.toLowerCase().includes(search)) ||
        (r.local_name && r.local_name.toLowerCase().includes(search)) ||
        (r.materials && r.materials.toLowerCase().includes(search)) ||
        (r.municipality && r.municipality.toLowerCase().includes(search)) ||
        (r.description && r.description.toLowerCase().includes(search))
      );
    }

    if (category && category !== "All") {
      records = records.filter((r) => r.category === category);
    }

    return sendJson(res, 200, {
      status: "success",
      method: "GET",
      count: records.length,
      data: records
    });
  }

  // ==========================================================================
  // REST API ENDPOINT 2: GET /api/record.php?id=1
  // ==========================================================================
  if (pathname === "/api/record.php") {
    if (method !== "GET") {
      return sendJson(res, 405, {
        status: "error",
        message: "Method Not Allowed. Please use GET for /api/record.php?id=1."
      });
    }

    const id = parseInt(query.id, 10);
    if (!query.id || isNaN(id) || id <= 0) {
      return sendJson(res, 400, {
        status: "error",
        message: "Invalid or missing ID parameter. Example: /api/record.php?id=1"
      });
    }

    const records = readRecords();
    const record  = records.find((r) => Number(r.id) === id);

    if (!record) {
      return sendJson(res, 404, {
        status: "error",
        message: `Handicraft record with ID ${id} was not found.`
      });
    }

    return sendJson(res, 200, {
      status: "success",
      method: "GET",
      data: record
    });
  }

  // ==========================================================================
  // REST API ENDPOINT 3: POST /api/create.php
  // ==========================================================================
  if (pathname === "/api/create.php") {
    if (method !== "POST") {
      return sendJson(res, 405, {
        status: "error",
        message: "Method Not Allowed. Please use POST for /api/create.php."
      });
    }

    const input = await parseRequestBody(req);
    const requiredFields = ["name", "category", "materials", "municipality", "description"];
    const missingFields  = requiredFields.filter((f) => !input[f] || String(input[f]).trim() === "");

    if (missingFields.length > 0) {
      return sendJson(res, 400, {
        status: "error",
        message: "Validation failed. Missing required fields: " + missingFields.join(", "),
        missing_fields: missingFields
      });
    }

    const records = readRecords();
    const maxId   = records.reduce((max, r) => (Number(r.id) > max ? Number(r.id) : max), 0);
    const newId   = maxId + 1;

    const categoryMap = {
      "Woven Headwear & Fans": 1,
      "Baskets & Storage": 2,
      "Home & Table Decor": 3,
      "Woodcraft & Traditional Games": 4,
      "Traditional Earthenware": 5
    };

    const newRecord = {
      id: newId,
      name: String(input.name).trim(),
      local_name: input.local_name && String(input.local_name).trim() !== "" ? String(input.local_name).trim() : String(input.name).trim(),
      category_id: categoryMap[input.category] || 2,
      source_id: 1,
      category: String(input.category).trim(),
      materials: String(input.materials).trim(),
      municipality: String(input.municipality).trim(),
      price_range: input.price_range && String(input.price_range).trim() !== "" ? String(input.price_range).trim() : "PHP 150 - PHP 350",
      dimensions: input.dimensions && String(input.dimensions).trim() !== "" ? String(input.dimensions).trim() : "Standard Artisan Size",
      description: String(input.description).trim(),
      cultural_significance: input.cultural_significance && String(input.cultural_significance).trim() !== ""
        ? String(input.cultural_significance).trim()
        : "Locally handcrafted product supporting Siargao Island artisans.",
      source_reference: input.source_reference && String(input.source_reference).trim() !== ""
        ? String(input.source_reference).trim()
        : "Field Data Gathering - Siargao Island",
      verified_by: input.verified_by || "Local Siargao Artisan Collective",
      image_url: input.image_url && String(input.image_url).trim() !== "" ? String(input.image_url).trim() : "images/01-buri-hat.jpg",
      is_from_docx: 0,
      date_gathered: input.date_gathered || new Date().toISOString().split("T")[0]
    };

    records.push(newRecord);
    writeRecords(records);

    return sendJson(res, 201, {
      status: "success",
      method: "POST",
      message: "New handicraft record created successfully.",
      data: newRecord
    });
  }

  // ==========================================================================
  // REST API ENDPOINT 4: PUT /api/update.php?id=1
  // ==========================================================================
  if (pathname === "/api/update.php") {
    if (method !== "PUT" && method !== "POST") {
      return sendJson(res, 405, {
        status: "error",
        message: "Method Not Allowed. Please use PUT for /api/update.php?id=1."
      });
    }

    const input = await parseRequestBody(req);
    const id    = parseInt(query.id || input.id, 10);

    if (!id || isNaN(id) || id <= 0) {
      return sendJson(res, 400, {
        status: "error",
        message: "Invalid or missing record ID. Example: PUT /api/update.php?id=1"
      });
    }

    const requiredFields = ["name", "category", "materials", "municipality", "description"];
    const missingFields  = requiredFields.filter((f) => !input[f] || String(input[f]).trim() === "");

    if (missingFields.length > 0) {
      return sendJson(res, 400, {
        status: "error",
        message: "Validation failed. Missing required fields: " + missingFields.join(", "),
        missing_fields: missingFields
      });
    }

    const records = readRecords();
    const index   = records.findIndex((r) => Number(r.id) === id);

    if (index === -1) {
      return sendJson(res, 404, {
        status: "error",
        message: `Cannot update: Handicraft record with ID ${id} does not exist.`
      });
    }

    const existing = records[index];
    const updatedRecord = {
      ...existing,
      name: String(input.name).trim(),
      local_name: input.local_name ? String(input.local_name).trim() : existing.local_name,
      category: String(input.category).trim(),
      materials: String(input.materials).trim(),
      municipality: String(input.municipality).trim(),
      price_range: input.price_range ? String(input.price_range).trim() : existing.price_range,
      dimensions: input.dimensions ? String(input.dimensions).trim() : existing.dimensions,
      description: String(input.description).trim(),
      cultural_significance: input.cultural_significance ? String(input.cultural_significance).trim() : existing.cultural_significance,
      source_reference: input.source_reference ? String(input.source_reference).trim() : existing.source_reference,
      image_url: input.image_url ? String(input.image_url).trim() : existing.image_url
    };

    records[index] = updatedRecord;
    writeRecords(records);

    return sendJson(res, 200, {
      status: "success",
      method: "PUT",
      message: `Handicraft record #${id} updated successfully.`,
      data: updatedRecord
    });
  }

  // ==========================================================================
  // REST API ENDPOINT 5: DELETE /api/delete.php?id=1
  // ==========================================================================
  if (pathname === "/api/delete.php") {
    if (method !== "DELETE") {
      return sendJson(res, 405, {
        status: "error",
        message: "Method Not Allowed. Please use DELETE for /api/delete.php?id=1."
      });
    }

    const id = parseInt(query.id, 10);
    if (!query.id || isNaN(id) || id <= 0) {
      return sendJson(res, 400, {
        status: "error",
        message: "Invalid or missing ID parameter. Example: DELETE /api/delete.php?id=1"
      });
    }

    const records = readRecords();
    const index   = records.findIndex((r) => Number(r.id) === id);

    if (index === -1) {
      return sendJson(res, 404, {
        status: "error",
        message: `Cannot delete: Handicraft record with ID ${id} was not found.`
      });
    }

    const deletedName = records[index].name;
    records.splice(index, 1);
    writeRecords(records);

    return sendJson(res, 200, {
      status: "success",
      method: "DELETE",
      message: `Handicraft record #${id} ('${deletedName}') deleted successfully.`,
      deleted_id: id
    });
  }

  // ==========================================================================
  // SERVE STATIC WEBSITE FILES (index.html, style.css, script.js, images, etc.)
  // ==========================================================================
  let safePath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = path.join(__dirname, safePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=UTF-8" });
      return res.end("404 Not Found: " + pathname);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log("==============================================================");
  console.log(" Siargao Island Handicrafts - Local Knowledge Repository");
  console.log(" Server running at: http://localhost:" + PORT);
  console.log(" External App Demo: http://localhost:" + PORT + "/client-demo.html");
  console.log(" REST API Base URL: http://localhost:" + PORT + "/api/records.php");
  console.log("==============================================================");
});
