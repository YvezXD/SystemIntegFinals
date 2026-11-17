<?php
// ============================================================================
// FILE: api/config.php
// PURPOSE: Connects PHP to the MySQL Database and sets up JSON headers.
//
// BEGINNER GUIDE:
// - If you are using XAMPP or Laragon with default settings, you do NOT need
//   to change $host, $username, or $password.
// - Make sure you imported "database/siargao_handicrafts.sql" in phpMyAdmin!
// ============================================================================

// 1. Tell the browser or client (like Postman or Fetch API) that we return JSON
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request from browsers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// 2. Database Connection Settings (Standard XAMPP / Laragon Defaults)
$host     = "localhost";
$username = "root";
$password = "";
$dbname   = "siargao_handicrafts_db";

// 3. Connect to MySQL using mysqli
$conn = new mysqli($host, $username, $password, $dbname);

// 4. Check if connection failed
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database connection failed: " . $conn->connect_error,
        "hint"    => "Make sure MySQL is running in XAMPP and you imported database/siargao_handicrafts.sql"
    ]);
    exit();
}

// Set UTF-8 encoding so local characters (like ñ or é) display properly
$conn->set_charset("utf8mb4");

// ============================================================================
// HELPER FUNCTION: sendJson($statusCode, $data)
// Sends an HTTP status code (like 200, 201, 400, 404) and outputs JSON data.
// ============================================================================
function sendJson($statusCode, $data) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit();
}
?>
