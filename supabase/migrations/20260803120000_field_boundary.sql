-- Adiciona o perímetro geográfico do talhão (polígono desenhado no mapa),
-- armazenado como array de pares [latitude, longitude].
alter table crop_fields add column if not exists boundary jsonb;
