<?php
// ============================================================================
// FILE: api/records.php
// ENDPOINT: GET /api/records.php
// PURPOSE: Retrieve all handicraft records (or filter by keyword/category).
// ============================================================================

require_once "config.php";

// 1. Only allow GET requests on this endpoint
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendJson(405, [
        "status"  => "error",
        "message" => "Method Not Allowed. Please use GET for /api/records.php."
    ]);
}

// 2. Optional query parameters: ?search=keyword&category=Baskets
$search   = isset($_GET['search']) ? trim($_GET['search']) : "";
$category = isset($_GET['category']) ? trim($_GET['category']) : "";

// 3. Build SQL query joining categories and sources tables
$sql = "SELECT h.*, s.verified_by 
        FROM handicrafts h
        LEFT JOIN sources s ON h.source_id = s.source_id
        WHERE 1=1";

$params = [];
$types  = "";

if ($search !== "") {
    $sql .= " AND (h.name LIKE ? OR h.local_name LIKE ? OR h.materials LIKE ? OR h.municipality LIKE ? OR h.description LIKE ?)";
    $likeSearch = "%" . $search . "%";
    $params[] = $likeSearch;
    $params[] = $likeSearch;
    $params[] = $likeSearch;
    $params[] = $likeSearch;
    $params[] = $likeSearch;
    $types   .= "sssss";
}

if ($category !== "" && $category !== "All") {
    $sql .= " AND h.category = ?";
    $params[] = $category;
    $types   .= "s";
}

$sql .= " ORDER BY h.id ASC";

// 4. Execute using a Prepared Statement
$stmt = $conn->prepare($sql);

if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

// 5. Fetch all rows into an array
$records = [];
while ($row = $result->fetch_assoc()) {
    $row['id']           = (int)$row['id'];
    $row['category_id']  = (int)$row['category_id'];
    $row['source_id']    = (int)$row['source_id'];
    $row['is_from_docx'] = (int)$row['is_from_docx'];
    $records[] = $row;
}

$stmt->close();
$conn->close();

// 6. Return 200 OK with the records in JSON format
sendJson(200, [
    "status"  => "success",
    "method"  => "GET",
    "count"   => count($records),
    "data"    => $records
]);
?>
