-- Tambahkan foreign key untuk mengaitkan task dengan learning module (SKS Mode)
ALTER TABLE tasks
ADD COLUMN learning_history_id uuid REFERENCES learning_history(id) ON DELETE SET NULL;
