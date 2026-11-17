<?php
// ============================================================================
// FILE: api/create.php
// ENDPOINT: POST /api/create.php
// PURPOSE: Insert a new handicraft record into the MySQL database.
// ============================================================================

require_once "config.php";

// 1. Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(405, [
        "status"  => "error",
        "message" => "Method Not Allowed. Please use POST for /api/create.php."
    ]);
}

// 2. Read the incoming JSON body sent by Fetch API or Postman
$rawBody = file_get_contents("php://input");
$input   = json_decode($rawBody, true);

// Fallback to $_POST if sent as standard form data
if (!is_array($input)) {
    $input = $_POST;
}

// 3. Validate required fields before inserting
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

// 4. Clean and assign values (with sensible defaults for optional fields)
$name                  = trim($input['name']);
$local_name            = isset($input['local_name']) && trim($input['local_name']) !== "" ? trim($input['local_name']) : $name;
$category              = trim($input['category']);
$materials             = trim($input['materials']);
$municipality          = trim($input['municipality']);
$price_range           = isset($input['price_range']) && trim($input['price_range']) !== "" ? trim($input['price_range']) : "PHP 150 - PHP 350";
$dimensions            = isset($input['dimensions']) && trim($input['dimensions']) !== "" ? trim($input['dimensions']) : "Standard Artisan Size";
$description           = trim($input['description']);
$cultural_significance = isset($input['cultural_significance']) && trim($input['cultural_significance']) !== "" ? trim($input['cultural_significance']) : "Locally handcrafted product supporting Siargao Island artisans.";
$source_reference      = isset($input['source_reference']) && trim($input['source_reference']) !== "" ? trim($input['source_reference']) : "Field Data Gathering - Siargao Island";
$image_url             = isset($input['image_url']) && trim($input['image_url']) !== "" ? trim($input['image_url']) : "images/01-buri-hat.jpg";
$date_gathered         = isset($input['date_gathered']) && trim($input['date_gathered']) !== "" ? trim($input['date_gathered']) : date("Y-m-d");

// Map category name to category_id (1 to 5)
$categoryMap = [
    "Woven Headwear & Fans"         => 1,
    "Baskets & Storage"             => 2,
    "Home & Table Decor"            => 3,
    "Woodcraft & Traditional Games" => 4,
    "Traditional Earthenware"       => 5
];
$category_id = isset($categoryMap[$category]) ? $categoryMap[$category] : 2;
$source_id   = 1;
$is_from_docx = 0;

// 5. Insert record using a Prepared Statement
$sql = "INSERT INTO handicrafts (
            name, local_name, category_id, source_id, category, materials,
            municipality, price_range, dimensions, description,
            cultural_significance, source_reference, image_url, is_from_docx, date_gathered
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssiisssssssssis",
    $name, $local_name, $category_id, $source_id, $category, $materials,
    $municipality, $price_range, $dimensions, $description,
    $cultural_significance, $source_reference, $image_url, $is_from_docx, $date_gathered
);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    $stmt->close();
    $conn->close();

    // Return 201 Created with the newly created record
    sendJson(201, [
        "status"  => "success",
        "method"  => "POST",
        "message" => "New handicraft record created successfully.",
        "data"    => [
            "id"                    => $newId,
            "name"                  => $name,
            "local_name"            => $local_name,
            "category_id"           => $category_id,
            "source_id"             => $source_id,
            "category"              => $category,
            "materials"             => $materials,
            "municipality"          => $municipality,
            "price_range"           => $price_range,
            "dimensions"            => $dimensions,
            "description"           => $description,
            "cultural_significance" => $cultural_significance,
            "source_reference"      => $source_reference,
            "image_url"             => $image_url,
            "is_from_docx"          => $is_from_docx,
            "date_gathered"         => $date_gathered
        ]
    ]);
} else {
    $error = $stmt->error;
    $stmt->close();
    $conn->close();
    sendJson(500, [
        "status"  => "error",
        "message" => "Failed to insert record: " . $error
    ]);
}
?>
