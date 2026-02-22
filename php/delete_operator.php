<?php
// php/delete_operator.php
require_once 'db_config.php';

// Basahin ang JSON data mula sa request body
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['operator_id'])) {
    $opID = $conn->real_escape_string($data['operator_id']);
    
    /**
     * SOFT DELETE LOGIC: 
     * Imbes na burahin ang row, i-update lang ang status sa 'Deleted'.
     * Sa ganitong paraan, hindi mawawala ang Face Descriptor sa database.
     */
    $sql = "UPDATE tbl_operators SET status = 'Deleted' WHERE operator_id = '$opID'";
    
    if ($conn->query($sql) === TRUE) {
        // Binago natin ang message para alam mong nasa Recycle Bin na siya.
        echo json_encode(["status" => "success", "message" => "Operator moved to Recycle Bin!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request: No Operator ID provided."]);
}

$conn->close();
?>