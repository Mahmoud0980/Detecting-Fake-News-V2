<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

require_once '../config/db.php';

$stmt = $pdo->query("SELECT * FROM trusted_sources");
$sources = $stmt->fetchAll();

http_response_code(200);
echo json_encode($sources);
