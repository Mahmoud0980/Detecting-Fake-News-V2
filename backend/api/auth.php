<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db.php';

$data = json_decode(file_get_contents("php://input"), true);
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'register':
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($username) || empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["message" => "جميع الحقول مطلوبة"]);
            exit();
        }

        // Check if user already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(["message" => "اسم المستخدم أو البريد الإلكتروني مسجل بالفعل"]);
            exit();
        }

        // Hash password and save
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, 'user', 'active')");
        if ($stmt->execute([$username, $email, $hashed])) {
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "تم تسجيل الحساب بنجاح"]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "حدث خطأ أثناء التسجيل"]);
        }
        break;

    case 'login':
        $usernameOrEmail = trim($data['username'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($usernameOrEmail) || empty($password)) {
            http_response_code(400);
            echo json_encode(["message" => "يرجى إدخال اسم المستخدم وكلمة المرور"]);
            exit();
        }

        // Find user by username or email
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$usernameOrEmail, $usernameOrEmail]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            http_response_code(401);
            echo json_encode(["message" => "بيانات الدخول غير صحيحة"]);
            exit();
        }

        if ($user['status'] === 'disabled') {
            http_response_code(403);
            echo json_encode(["message" => "تم تعطيل حسابك من قبل الإدارة. يرجى التواصل مع الدعم"]);
            exit();
        }

        // Generate token and save it
        $token = bin2hex(random_bytes(16));
        $updateStmt = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
        $updateStmt->execute([$token, $user['id']]);

        http_response_code(200);
        echo json_encode([
            "success" => true,
            "token" => $token,
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email'],
                "role" => $user['role'],
                "status" => $user['status']
            ]
        ]);
        break;

    case 'me':
        // Get Authorization header
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

        if (empty($token)) {
            http_response_code(401);
            echo json_encode(["message" => "غير مصرح به"]);
            exit();
        }

        $stmt = $pdo->prepare("SELECT id, username, email, role, status FROM users WHERE token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(["message" => "جلسة غير صالحة"]);
            exit();
        }

        if ($user['status'] === 'disabled') {
            http_response_code(403);
            echo json_encode(["message" => "تم تعطيل حسابك"]);
            exit();
        }

        echo json_encode([
            "success" => true,
            "user" => [
                "id" => $user['id'],
                "username" => $user['username'],
                "email" => $user['email'],
                "role" => $user['role'],
                "status" => $user['status']
            ]
        ]);
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "الإجراء غير متوفر"]);
        break;
}
