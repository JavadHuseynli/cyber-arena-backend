-- Migration: Add field support to chapters and users tables
-- Run this on existing databases to add reverse engineering support

USE cyber_arena;

-- 1. Add field column to users (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS field ENUM('pentest','reverse') DEFAULT 'pentest' AFTER student_group;

-- 2. Add avatar_url column to users (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) AFTER avatar_seed;

-- 3. Add field column to chapters
ALTER TABLE chapters ADD COLUMN IF NOT EXISTS field ENUM('pentest','reverse') NOT NULL DEFAULT 'pentest' AFTER title_az;

-- 4. Mark existing chapters as pentest
UPDATE chapters SET field = 'pentest' WHERE field IS NULL OR field = '';

-- 5. Insert reverse engineering chapters
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

-- 6. For existing 'reverse' field users, initialize their chapter progress for new reverse chapters
-- Run this manually after migration if needed:
-- INSERT INTO user_chapter_progress (user_id, chapter_id, status)
-- SELECT u.id, c.id, CASE WHEN c.number = 1 THEN 'available' ELSE 'locked' END
-- FROM users u CROSS JOIN chapters c
-- WHERE u.field = 'reverse' AND c.field = 'reverse'
-- AND NOT EXISTS (SELECT 1 FROM user_chapter_progress ucp WHERE ucp.user_id = u.id AND ucp.chapter_id = c.id);
