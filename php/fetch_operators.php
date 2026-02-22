<?php
// php/fetch_operators.php
require_once 'db_config.php';

// 1. Kunin ang 'status' parameter mula sa URL (e.g., fetch_operators.php?status=Active)
$status = isset($_GET['status']) ? $conn->real_escape_string($_GET['status']) : 'Pending';

// 2. I-filter ang SQL query base sa status
$sql = "SELECT operator_id, full_name, contact_number, status 
        FROM tbl_operators 
        WHERE status = '$status' 
        ORDER BY created_at DESC";

$result = $conn->query($sql);

$operators = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $operators[] = $row;
    }
}

// 3. I-send ang filtered data bilang JSON
header('Content-Type: application/json');
echo json_encode($operators);

$conn->close();
?>