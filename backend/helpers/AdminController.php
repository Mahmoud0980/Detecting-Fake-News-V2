<?php

class AdminController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    // --- Authentication ---
    public function login($username, $password) {
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE username = ? AND role = 'admin'");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            if ($user['status'] === 'disabled') {
                return ['success' => false, 'message' => 'هذا الحساب معطل من قبل المسؤول'];
            }
            // Update token
            $token = bin2hex(random_bytes(16));
            $update = $this->pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
            $update->execute([$token, $user['id']]);
            
            return [
                'success' => true, 
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'username' => $user['username'],
                    'email' => $user['email'],
                    'role' => $user['role']
                ]
            ];
        }
        return ['success' => false, 'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة'];
    }

    // --- User Management ---
    public function getUsers() {
        $stmt = $this->pdo->query("SELECT id, username, email, role, status, created_at FROM users ORDER BY created_at DESC");
        return $stmt->fetchAll();
    }

    public function addUser($username, $email, $password, $role, $status) {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare("INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)");
        return $stmt->execute([$username, $email, $hashed, $role, $status]);
    }

    public function updateUser($id, $username, $email, $role, $status, $password = null) {
        if (!empty($password)) {
            $hashed = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $this->pdo->prepare("UPDATE users SET username = ?, email = ?, role = ?, status = ?, password = ? WHERE id = ?");
            return $stmt->execute([$username, $email, $role, $status, $hashed, $id]);
        } else {
            $stmt = $this->pdo->prepare("UPDATE users SET username = ?, email = ?, role = ?, status = ? WHERE id = ?");
            return $stmt->execute([$username, $email, $role, $status, $id]);
        }
    }

    public function deleteUser($id) {
        $stmt = $this->pdo->prepare("DELETE FROM users WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // --- Statistics ---
    public function getStats() {
        $stats = [];
        
        // Total Analyses
        $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM analysis_logs");
        $stats['total_analyses'] = $stmt->fetch()['total'];

        // Fake vs Trusted
        $stmt = $this->pdo->query("SELECT result_status, COUNT(*) as count FROM analysis_logs GROUP BY result_status");
        $stats['status_distribution'] = $stmt->fetchAll();

        // Total Keywords
        $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM suspicious_keywords");
        $stats['total_keywords'] = $stmt->fetch()['total'];

        // Total Sources
        $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM trusted_sources");
        $stats['total_sources'] = $stmt->fetch()['total'];

        // Total Users
        $stmt = $this->pdo->query("SELECT COUNT(*) as total FROM users");
        $stats['total_users'] = $stmt->fetch()['total'];

        return $stats;
    }

    // --- Logs ---
    public function getLogs($limit = 50, $offset = 0) {
        $stmt = $this->pdo->prepare("SELECT * FROM analysis_logs ORDER BY created_at DESC LIMIT ? OFFSET ?");
        $stmt->execute([(int)$limit, (int)$offset]);
        return $stmt->fetchAll();
    }

    // --- Keywords Management ---
    public function getKeywords() {
        $stmt = $this->pdo->query("SELECT * FROM suspicious_keywords ORDER BY keyword ASC");
        return $stmt->fetchAll();
    }

    public function addKeyword($keyword, $weight) {
        $stmt = $this->pdo->prepare("INSERT INTO suspicious_keywords (keyword, weight) VALUES (?, ?)");
        return $stmt->execute([$keyword, $weight]);
    }

    public function deleteKeyword($id) {
        $stmt = $this->pdo->prepare("DELETE FROM suspicious_keywords WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // --- Sources Management ---
    public function getSources() {
        $stmt = $this->pdo->query("SELECT * FROM trusted_sources ORDER BY source_name ASC");
        return $stmt->fetchAll();
    }

    public function addSource($name, $domain) {
        $stmt = $this->pdo->prepare("INSERT INTO trusted_sources (source_name, domain) VALUES (?, ?)");
        return $stmt->execute([$name, $domain]);
    }

    public function deleteSource($id) {
        $stmt = $this->pdo->prepare("DELETE FROM trusted_sources WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
