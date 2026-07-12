<?php
// Configuration for Database Connection

$host = 'MYSQL5045.site4now.net';
$db = 'db_ac78f8_fknews';
$user = 'ac78f8_fknews'; // Change if needed
$pass = 'Mmnnbb112233@';     // Change if needed
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
     PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
     PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
     PDO::ATTR_EMULATE_PREPARES => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
     
     // Automatically create users table if it does not exist
     $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
       `id` int(11) NOT NULL AUTO_INCREMENT,
       `username` varchar(100) NOT NULL UNIQUE,
       `email` varchar(100) NOT NULL UNIQUE,
       `password` varchar(255) NOT NULL,
       `role` varchar(20) DEFAULT 'user',
       `status` varchar(20) DEFAULT 'active',
       `token` varchar(255) DEFAULT NULL,
       `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
       PRIMARY KEY (`id`)
     ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;");

     // Seed a default admin if none exists
     $stmt = $pdo->prepare("SELECT COUNT(*) FROM users WHERE role = 'admin'");
     $stmt->execute();
     if ($stmt->fetchColumn() == 0) {
         $adminPassword = password_hash('admin123', PASSWORD_DEFAULT);
         $pdo->exec("INSERT INTO users (username, email, password, role, status) VALUES ('admin', 'admin@fakenews.com', '$adminPassword', 'admin', 'active')");
     } else {
         // Self-heal/reset the admin password if it still has the broken hash from the SQL import
         $brokenHash = '$2y$10$4O77wYlycE/yC.H3V1l/LOm1Y0C3.zC5T2KqjP3qL7C7DqF.DqSdq';
         $checkBroken = $pdo->prepare("SELECT id FROM users WHERE username = 'admin' AND password = ?");
         $checkBroken->execute([$brokenHash]);
         if ($checkBroken->fetch()) {
             $newAdminHash = password_hash('admin123', PASSWORD_DEFAULT);
             $updateAdmin = $pdo->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
             $updateAdmin->execute([$newAdminHash]);
         }
     }
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int) $e->getCode());
}
