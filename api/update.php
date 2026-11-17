<?php
// ============================================================================
// FILE: api/update.php
// ENDPOINT: PUT /api/update.php?id=1
// PURPOSE: Update an existing handicraft record in the MySQL database.
// ============================================================================

require_once "config.php";

// 1. Allow PUT (or POST for clients that tunnel PUT)
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(405, [
        "status"  => "error",
        "message" => "Method Not Allowed. Please use PUT for /api/update.php?id=1."
    ]);
}

// 2. Read JSON body
$rawBody = file_get_contents("php://input");
$input   = json_decode($rawBody, true);
if (!is_array($input)) {
    $input = $_POST;
}

// 3. Get and validate ID from URL query (?id=1) or JSON body
$id = isset($_GET['id']) ? (int)$_GET['id'] : (isset($input['id']) ? (int)$input['id'] : 0);

if ($id <= 0) {
    sendJson(400, [
        "status"  => "error",
        "message" => "Invalid or missing record ID. Example: PUT /api/update.php?id=1"
    ]);
}

// 4. Validate required fields
$requiredFields = ['name', 'category', 'materials', 'municipality', 'description'];
$missingFields  = [];

foreach ($requiredFields as $field) {
    if (!isset($input[$field]) || trim($input[$field]) === "") {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    sendJson(400, [
        "status"         => "error",
        "message"        => "Validation failed. Missing required fields: " . implode(", ", $missingFields),
        "missing_fields" => $missingFields
    ]);
}

// 5. Check if the record exists first
$checkStmt = $conn->prepare("SELECT id FROM handicrafts WHERE id = ?");
$checkStmt->bind_param("i", $id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    $checkStmt->close();
    $conn->close();
    sendJson(404, [
        "status"  => "error",
        "message" => "Cannot update: Handicraft record with ID $id does not exist."
    ]);
}
$checkStmt->close();

// 6. Clean input values
$name                  = trim($input['name']);
$local_name            = isset($input['local_name']) && trim($input['local_name']) !== "" ? trim($input['local_name']) : $name;
$category              = trim($input['category']);
$materials             = trim($input['materials']);
$municipality          = trim($input['municipality']);
$price_range           = isset($input['price_range']) ? trim($input['price_range']) : "PHP 150 - PHP 350";
$dimensions            = isset($input['dimensions']) ? trim($input['dimensions']) : "Standard Artisan Size";
$description           = trim($input['description']);
$cultural_significance = isset($input['cultural_significance']) ? trim($input['cultural_significance']) : "";
$source_reference      = isset($input['source_reference']) ? trim($input['source_reference']) : "";
$image_url             = isset($input['image_url']) && trim($input['image_url']) !== "" ? trim($input['image_url']) : "images/01-buri-hat.jpg";

$categoryMap = [
    "Woven Headwear & Fans"         => 1,
    "Baskets & Storage"             => 2,
    "Home & Table Decor"            => 3,
    "Woodcraft & Traditional Games" => 4,
    "Traditional Earthenware"       => 5
];
$category_id = isset($categoryMap[$category]) ? $categoryMap[$category] : 2;

// 7. Execute Prepared Statement to update the record
$sql = "UPDATE handicrafts
        SET name = ?, local_name = ?, category_id = ?, category = ?,
            materials = ?, municipality = ?, price_range = ?, dimensions = ?,
            description = ?, cultural_significance = ?, source_reference = ?, image_url = ?
        WHERE id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssisssssssssi",
    $name, $local_name, $category_id, $category,
    $materials, $municipality, $price_range, $dimensions,
    $description, $cultural_significance, $source_reference, $image_url,
    $id
);

if ($stmt->execute()) {
    $stmt->close();
    $conn->close();

    sendJson(200, [
        "status"  => "success",
        "method"  => "PUT",
        "message" => "Handicraft record #$id updated successfully.",
        "data"    => [
            "id"                    => $id,
            "name"                  => $name,
            "local_name"            => $local_name,
            "category_id"           => $category_id,
            "category"              => $category,
            "materials"             => $materials,
            "municipality"          => $municipality,
            "price_range"           => $price_range,
            "dimensions"            => $dimensions,
            "description"           => $description,
            "cultural_significance" => $cultural_significance,
            "source_reference"      => $source_reference,
            "image_url"             => $image_url
        ]
    ]);
} else {
    $error = $stmt->error;
    $stmt->close();
    $conn->close();
    sendJson(500, [
        "status"  => "error",
        "message" => "Failed to update record: " . $error
    ]);
}
?>
