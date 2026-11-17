<?php
// ============================================================================
// FILE: api/delete.php
// ENDPOINT: DELETE /api/delete.php?id=1
// PURPOSE: Delete a handicraft record from the MySQL database using its ID.
// ============================================================================

require_once "config.php";

// 1. Only allow DELETE requests
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    sendJson(405, [
        "status"  => "error",
        "message" => "Method Not Allowed. Please use DELETE for /api/delete.php?id=1."
    ]);
}

// 2. Validate ID from query string (?id=1)
if (!isset($_GET['id']) || !is_numeric($_GET['id']) || (int)$_GET['id'] <= 0) {
    sendJson(400, [
        "status"  => "error",
        "message" => "Invalid or missing ID parameter. Example: DELETE /api/delete.php?id=1"
    ]);
}

$id = (int)$_GET['id'];

// 3. Check if record exists before deleting
$checkStmt = $conn->prepare("SELECT id, name FROM handicrafts WHERE id = ?");
$checkStmt->bind_param("i", $id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows === 0) {
    $checkStmt->close();
    $conn->close();
    sendJson(404, [
        "status"  => "error",
        "message" => "Cannot delete: Handicraft record with ID $id was not found."
    ]);
}

$deletedRow = $checkResult->fetch_assoc();
$checkStmt->close();

// 4. Execute Prepared Statement to delete the record
$stmt = $conn->prepare("DELETE FROM handicrafts WHERE id = ?");
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    $stmt->close();
    $conn->close();

    sendJson(200, [
        "status"     => "success",
        "method"     => "DELETE",
        "message"    => "Handicraft record #$id ('" . $deletedRow['name'] . "') deleted successfully.",
        "deleted_id" => $id
    ]);
} else {
    $error = $stmt->error;
    $stmt->close();
    $conn->close();
    sendJson(500, [
        "status"  => "error",
        "message" => "Failed to delete record: " . $error
    ]);
}
?>
