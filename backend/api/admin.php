<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db.php';
require_once '../helpers/AdminController.php';

$admin = new AdminController($pdo);

$action = isset($_GET['action']) ? $_GET['action'] : '';

// Authenticate Admin Token (except on login)
$authHeader = '';
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
}
if (empty($authHeader) && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}

$token = '';
if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    $token = $matches[1];
}

if ($action !== 'login') {
    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized: Token missing']);
        exit;
    }
    
    // Check if token belongs to an active admin
    $stmt = $pdo->prepare("SELECT id, role, status FROM users WHERE token = ?");
    $stmt->execute([$token]);
    $adminUser = $stmt->fetch();
    
    if (!$adminUser || $adminUser['role'] !== 'admin' || $adminUser['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(['error' => 'Forbidden: Admins only or account disabled']);
        exit;
    }
}

$data = json_decode(file_get_contents("php://input"), true);

try {
    switch ($action) {
        case 'login':
            $res = $admin->login($data['username'] ?? '', $data['password'] ?? '');
            echo json_encode($res);
            break;

        case 'get_stats':
            echo json_encode($admin->getStats());
            break;

        case 'get_logs':
            echo json_encode($admin->getLogs());
            break;

        case 'get_keywords':
            echo json_encode($admin->getKeywords());
            break;

        case 'add_keyword':
            $res = $admin->addKeyword($data['keyword'] ?? '', $data['weight'] ?? 0);
            echo json_encode(['success' => $res]);
            break;

        case 'delete_keyword':
            $res = $admin->deleteKeyword($_GET['id'] ?? 0);
            echo json_encode(['success' => $res]);
            break;

        case 'get_sources':
            echo json_encode($admin->getSources());
            break;

        case 'add_source':
            $res = $admin->addSource($data['name'] ?? '', $data['domain'] ?? '');
            echo json_encode(['success' => $res]);
            break;

        case 'delete_source':
            $res = $admin->deleteSource($_GET['id'] ?? 0);
            echo json_encode(['success' => $res]);
            break;

        // User Management actions
        case 'get_users':
            echo json_encode($admin->getUsers());
            break;

        case 'add_user':
            $res = $admin->addUser(
                $data['username'] ?? '',
                $data['email'] ?? '',
                $data['password'] ?? '',
                $data['role'] ?? 'user',
                $data['status'] ?? 'active'
            );
            echo json_encode(['success' => $res]);
            break;

        case 'update_user':
            $res = $admin->updateUser(
                $data['id'] ?? 0,
                $data['username'] ?? '',
                $data['email'] ?? '',
                $data['role'] ?? 'user',
                $data['status'] ?? 'active',
                !empty($data['password']) ? $data['password'] : null
            );
            echo json_encode(['success' => $res]);
            break;

        case 'delete_user':
            $res = $admin->deleteUser($_GET['id'] ?? 0);
            echo json_encode(['success' => $res]);
            break;

        default:
            http_response_code(404);
            echo json_encode(['error' => 'Invalid action']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
