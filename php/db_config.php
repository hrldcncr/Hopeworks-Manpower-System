<?php
// php/db_config.php
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // Idagdag ito para makita ang totoong error

$host = "localhost";
$user = "root";
$pass = "";
$dbname = "hopeworks_db"; 

try {
    $conn = new mysqli($host, $user, $pass, $dbname);
    $conn->set_charset("utf8mb4");
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "DB Connection Failed: " . $e->getMessage()]);
    exit;
}
?>