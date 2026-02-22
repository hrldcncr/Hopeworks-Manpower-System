<?php
// php/save_operator.php
require_once 'db_config.php';

// Basahin ang JSON data mula sa JavaScript
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['opID']) && isset($data['descriptor'])) {
    $opID = $conn->real_escape_string($data['opID']);
    $opName = $conn->real_escape_string($data['opName']);
    $opContact = $conn->real_escape_string($data['opContact']);
    
    // Convert descriptor array to JSON string for database storage
    $descriptor = json_encode($data['descriptor']);

    // Siguraduhing 'tbl_operators' ang pangalan ng table mo sa database
    $sql = "INSERT INTO tbl_operators (operator_id, full_name, contact_number, face_descriptor, status) 
        VALUES ('$opID', '$opName', '$opContact', '$descriptor', 'Pending')";

    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Operator saved successfully!"]);
    } else {
        // I-output ang error para malaman natin kung mali ang column names
        echo json_encode(["status" => "error", "message" => "DB Error: " . $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Missing data fields."]);
}

$conn->close();
?>