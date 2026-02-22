<?php
// php/toggle_status.php
require_once 'db_config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['opID']) && isset($data['currentStatus'])) {
    $opID = $conn->real_escape_string($data['opID']);
    $currentStatus = $data['currentStatus'];
    
    // Logic: Kung Pending, gawing Active. Kung Active, ibalik sa Pending.
    $newStatus = ($currentStatus === 'Pending') ? 'Active' : 'Pending';

    $sql = "UPDATE tbl_operators SET status = '$newStatus' WHERE operator_id = '$opID'";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "newStatus" => $newStatus]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid Request"]);
}

$conn->close();
?>