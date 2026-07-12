<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';
require_once '../helpers/Analyzer.php';



$data = json_decode(file_get_contents("php://input"));

if (!empty($data->text)) {
    $analyzer = new Analyzer($pdo);
    // Optionally we can log user_id in analysis_logs if needed, but keeping it standard
    $result = $analyzer->analyze($data->text, $data->url ?? '');
    
    http_response_code(200);
    echo json_encode($result);
} else {
    http_response_code(400);
    echo json_encode(["message" => "Text is required"]);
}
