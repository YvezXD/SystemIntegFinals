<?php
// ============================================================================
// FILE: api/record.php
// ENDPOINT: GET /api/record.php?id=1
// PURPOSE: Retrieve one specific handicraft record using its ID.
// ============================================================================

require_once "config.php";

// 1. Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(405, [
        "status"  => "error",
        "message" => "Method Not Allowed. Please use GET for /api/record.php?id=1."
    ]);
}

// 2. Validate that the 'id' parameter exists and is a valid positive number
if (!isset($_GET['id']) || !is_numeric($_GET['id']) || (int)$_GET['id'] <= 0) {
    sendJson(400, [
        "status"  => "error",
        "message" => "Invalid or missing ID parameter. Example: /api/record.php?id=1"
    ]);
}

$id = (int)$_GET['id'];

// 3. Prepare SQL statement to prevent SQL injection
$sql = "SELECT h.*, s.verified_by 
        FROM handicrafts h
        LEFT JOIN sources s ON h.source_id = s.source_id
        WHERE h.id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

// 4. Check if record exists
if ($result->num_rows === 0) {
    $stmt->close();
    $conn->close();
    sendJson(404, [
        "status"  => "error",
        "message" => "Handicraft record with ID $id was not found."
    ]);
}

$record = $result->fetch_assoc();
$record['id']           = (int)$record['id'];
$record['category_id']  = (int)$record['category_id'];
$record['source_id']    = (int)$record['source_id'];
$record['is_from_docx'] = (int)$record['is_from_docx'];

$stmt->close();
$conn->close();

// 5. Return 200 OK with the single record
sendJson(200, [
    "status" => "success",
    "method" => "GET",
    "data"   => $record
]);
?>
