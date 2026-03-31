-- Добавить колонку status в таблицы модерации
-- Запустить в Supabase: Dashboard → SQL Editor

ALTER TABLE reviews       ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE fanfics       ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE illustrations ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE places        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Индексы для быстрого поиска pending-записей
CREATE INDEX IF NOT EXISTS idx_reviews_status       ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_fanfics_status       ON fanfics(status);
CREATE INDEX IF NOT EXISTS idx_illustrations_status ON illustrations(status);
CREATE INDEX IF NOT EXISTS idx_places_status        ON places(status);

-- Существующие записи отмечаем как approved
UPDATE reviews       SET status = 'approved' WHERE status = 'pending';
UPDATE fanfics       SET status = 'approved' WHERE status = 'pending';
UPDATE illustrations SET status = 'approved' WHERE status = 'pending';
UPDATE places        SET status = 'approved' WHERE status = 'pending';
