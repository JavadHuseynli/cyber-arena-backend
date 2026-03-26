CREATE DATABASE IF NOT EXISTS cyber_arena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE cyber_arena;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student','admin') DEFAULT 'student',
  xp INT DEFAULT 0,
  level INT DEFAULT 1,
  streak_days INT DEFAULT 0,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  student_group VARCHAR(50),
  field ENUM('pentest','reverse') DEFAULT 'pentest',
  avatar_seed VARCHAR(50),
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  number INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  title_az VARCHAR(200) NOT NULL,
  field ENUM('pentest','reverse') NOT NULL DEFAULT 'pentest',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_chapter_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  status ENUM('locked','available','completed','approved') DEFAULT 'locked',
  score INT DEFAULT 0,
  max_score INT DEFAULT 175,
  accuracy DECIMAL(5,2) DEFAULT 0,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  approved_at TIMESTAMP NULL,
  approved_by INT NULL,
  time_taken INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_chapter (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chapter_id INT NOT NULL,
  difficulty ENUM('easy','medium','hard') NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(500) NOT NULL,
  option_b VARCHAR(500) NOT NULL,
  option_c VARCHAR(500) NOT NULL,
  option_d VARCHAR(500) NOT NULL,
  correct_option TINYINT NOT NULL,
  explanation TEXT,
  points INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  score INT DEFAULT 0,
  answers JSON,
  time_taken INT DEFAULT 0,
  combo_max INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  chapter_id INT NOT NULL,
  card_name VARCHAR(100) NOT NULL,
  rarity ENUM('Common','Uncommon','Rare','Epic','Legendary') NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_card (user_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  page VARCHAR(200),
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed pentest chapters
INSERT INTO chapters (number, title, title_az, field) VALUES
(1, 'Network Architecture & Concepts', 'Şəbəkə Arxitekturası və Əsas Anlayışlar', 'pentest'),
(2, 'IP Addressing & Data Transfer', 'IP Ünvanlama və Məlumatların Ötürülməsi', 'pentest'),
(3, 'Transport Protocols: UDP & TCP', 'Nəqliyyat Protokolları: UDP və TCP', 'pentest'),
(4, 'Network Equipment & ARP', 'Şəbəkə Avadanlıqları və ARP Protokolu', 'pentest'),
(5, 'Network Routing', 'Şəbəkə Marşrutlaşdırması', 'pentest'),
(6, 'DHCP Protocol', 'DHCP Protokolu və Avtomatik IP Ünvanlama', 'pentest'),
(7, 'DHCP Security: Spoofing & Starvation', 'DHCP Təhlükəsizliyi: Spoofing və Starvation Hücumları', 'pentest'),
(8, 'ARP Protocol — Address Resolution', 'ARP Protokolu — Ünvan Həlli və ARP Keşi', 'pentest'),
(9, 'ARP: IP Addressing & Configuration', 'ARP: IP Ünvanlama, Əməliyyat Mexanizmi', 'pentest');

-- Seed reverse engineering chapters
INSERT INTO chapters (number, title, title_az, field) VALUES
(1, 'Binary Systems & Data Representation', 'İkilik Sistemlər və Məlumat Təsviri', 'reverse'),
(2, 'x86 Assembly Fundamentals', 'x86 Assembly Əsasları', 'reverse'),
(3, 'Registers & Memory Architecture', 'Registrlər və Yaddaş Arxitekturası', 'reverse'),
(4, 'Stack & Calling Conventions', 'Stek və Çağırış Konvensiyaları', 'reverse'),
(5, 'Executable Formats: PE & ELF', 'İcra Formatları: PE və ELF', 'reverse'),
(6, 'Static Analysis & Disassembly', 'Statik Analiz və Disassembly', 'reverse'),
(7, 'Dynamic Analysis & Debugging', 'Dinamik Analiz və Debugging', 'reverse'),
(8, 'Anti-Reverse Engineering Techniques', 'Əks-Mühəndislik Texnikaları', 'reverse'),
(9, 'Malware Analysis Fundamentals', 'Zərərli Proqram Analizi Əsasları', 'reverse');

-- Default admin (password: Admin@123 - hash generated at first run via seed script)
INSERT INTO users (full_name, username, email, password_hash, role) VALUES
('Admin', 'admin', 'admin@cyberarena.az', '$2b$12$LJ3m4ys3Lp0VBx.gPiSreeWXgSEBaZqQDaxgKMFCdMfDJmBaGKzHe', 'admin');
