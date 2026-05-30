-- ============================================================
-- Mundial XXVI Tracker — Schema idempotente
-- Ejecutar N veces → mismo resultado (sin duplicados)
-- ============================================================

-- ============================================================
-- 1. TABLAS
-- ============================================================

CREATE TABLE IF NOT EXISTS paises (
  codigo           text PRIMARY KEY,
  nombre_largo     text NOT NULL,
  nombre_corto     text NOT NULL,
  url_flag         text,
  background_color text,
  text_color       text,
  grupo            text,
  tipo             text
);

CREATE TABLE IF NOT EXISTS partidos (
  num                 int PRIMARY KEY,
  fecha               timestamptz,
  pais_local          text,  -- puede ser placeholder en fases eliminatorias (ej: "W73", "1A")
  pais_visitante      text,
  fase                text,
  estadio             text,
  lugar               text,
  grupo               text,
  jugado              boolean DEFAULT false,
  penales_local       smallint,
  penales_visitante   smallint
);

CREATE TABLE IF NOT EXISTS goleadores (
  id               bigserial PRIMARY KEY,
  partido_num      int NOT NULL REFERENCES partidos(num),
  pais_jugador     text NOT NULL REFERENCES paises(codigo),
  numero_jugador   smallint,
  nombre_jugador   text,
  minuto           int NOT NULL,
  es_penal         boolean DEFAULT false,
  es_autogol       boolean DEFAULT false
);

-- ============================================================
-- 2. ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_goleadores_partido ON goleadores(partido_num);
CREATE INDEX IF NOT EXISTS idx_goleadores_pais    ON goleadores(pais_jugador);
CREATE INDEX IF NOT EXISTS idx_partidos_fase      ON partidos(fase);
CREATE INDEX IF NOT EXISTS idx_partidos_jugado    ON partidos(jugado);

-- ============================================================
-- 3. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE paises    ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE goleadores ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. POLÍTICAS DE SOLO LECTURA
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='paises' AND policyname='paises_select_public') THEN
    CREATE POLICY paises_select_public ON paises FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='partidos' AND policyname='partidos_select_public') THEN
    CREATE POLICY partidos_select_public ON partidos FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='goleadores' AND policyname='goleadores_select_public') THEN
    CREATE POLICY goleadores_select_public ON goleadores FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

-- ============================================================
-- 5. SEED — PAISES (48 equipos)
-- ============================================================

INSERT INTO paises (codigo, nombre_largo, nombre_corto, url_flag, background_color, text_color, grupo, tipo) VALUES
  ('CAN', 'Canadá',                'CAN', 'https://api.fifa.com/api/v3/picture/flags-sq-4/CAN', '#D52B1E', '#FFFFFF', 'B', 'A'),
  ('USA', 'EE. UU.',               'USA', 'https://api.fifa.com/api/v3/picture/flags-sq-4/USA', '#0326DE', '#FFFFFF', 'D', 'A'),
  ('MEX', 'México',                'MEX', 'https://api.fifa.com/api/v3/picture/flags-sq-4/MEX', '#27A550', '#000000', 'A', 'A'),
  ('GER', 'Alemania',              'GER', 'https://api.fifa.com/api/v3/picture/flags-sq-4/GER', '#1F1F1F', '#FFFFFF', 'E', 'C'),
  ('KSA', 'Arabia Saudí',          'KSA', 'https://api.fifa.com/api/v3/picture/flags-sq-4/KSA', '#27A550', '#000000', 'H', 'C'),
  ('ALG', 'Argelia',               'ALG', 'https://api.fifa.com/api/v3/picture/flags-sq-4/ALG', '#00A067', '#000000', 'J', 'C'),
  ('ARG', 'Argentina',             'ARG', 'https://api.fifa.com/api/v3/picture/flags-sq-4/ARG', '#9CC9F2', '#000000', 'J', 'C'),
  ('AUS', 'Australia',             'AUS', 'https://api.fifa.com/api/v3/picture/flags-sq-4/AUS', '#FFC100', '#000000', 'D', 'C'),
  ('AUT', 'Austria',               'AUT', 'https://api.fifa.com/api/v3/picture/flags-sq-4/AUT', '#ED3D32', '#000000', 'J', 'C'),
  ('BEL', 'Bélgica',               'BEL', 'https://api.fifa.com/api/v3/picture/flags-sq-4/BEL', '#880029', '#FFFFFF', 'G', 'C'),
  ('BIH', 'Bosnia y Herzegovina',  'BIH', 'https://api.fifa.com/api/v3/picture/flags-sq-4/BIH', '#2739D7', '#FFFFFF', 'B', 'C'),
  ('BRA', 'Brasil',                'BRA', 'https://api.fifa.com/api/v3/picture/flags-sq-4/BRA', '#FFCF25', '#000000', 'C', 'C'),
  ('QAT', 'Catar',                 'QAT', 'https://api.fifa.com/api/v3/picture/flags-sq-4/QAT', '#8D1B3D', '#FFFFFF', 'B', 'C'),
  ('CZE', 'Chequia',               'CZE', 'https://api.fifa.com/api/v3/picture/flags-sq-4/CZE', '#FF2727', '#000000', 'A', 'C'),
  ('COL', 'Colombia',              'COL', 'https://api.fifa.com/api/v3/picture/flags-sq-4/COL', '#FFD600', '#000000', 'K', 'C'),
  ('CIV', 'Costa de Marfil',       'CIV', 'https://api.fifa.com/api/v3/picture/flags-sq-4/CIV', '#FF8A00', '#000000', 'E', 'C'),
  ('CRO', 'Croacia',               'CRO', 'https://api.fifa.com/api/v3/picture/flags-sq-4/CRO', '#F30A0A', '#000000', 'L', 'C'),
  ('CUW', 'Curazao',               'CUW', 'https://api.fifa.com/api/v3/picture/flags-sq-4/CUW', '#236CDA', '#FFFFFF', 'E', 'C'),
  ('ECU', 'Ecuador',               'ECU', 'https://api.fifa.com/api/v3/picture/flags-sq-4/ECU', '#FFD600', '#000000', 'E', 'C'),
  ('EGY', 'Egipto',                'EGY', 'https://api.fifa.com/api/v3/picture/flags-sq-4/EGY', '#F1051F', '#000000', 'G', 'C'),
  ('SCO', 'Escocia',               'SCO', 'https://api.fifa.com/api/v3/picture/flags-sq-4/SCO', '#1E1C71', '#FFFFFF', 'C', 'C'),
  ('ESP', 'España',                'ESP', 'https://api.fifa.com/api/v3/picture/flags-sq-4/ESP', '#FF0000', '#000000', 'H', 'C'),
  ('FRA', 'Francia',               'FRA', 'https://api.fifa.com/api/v3/picture/flags-sq-4/FRA', '#00418F', '#FFFFFF', 'I', 'C'),
  ('GHA', 'Ghana',                 'GHA', 'https://api.fifa.com/api/v3/picture/flags-sq-4/GHA', '#FFC100', '#000000', 'L', 'C'),
  ('HAI', 'Haití',                 'HAI', 'https://api.fifa.com/api/v3/picture/flags-sq-4/HAI', '#0013BA', '#FFFFFF', 'C', 'C'),
  ('ENG', 'Inglaterra',            'ENG', 'https://api.fifa.com/api/v3/picture/flags-sq-4/ENG', '#FFFFFF', '#000000', 'L', 'C'),
  ('IRQ', 'Irak',                  'IRQ', 'https://api.fifa.com/api/v3/picture/flags-sq-4/IRQ', '#0D7053', '#FFFFFF', 'I', 'C'),
  ('CPV', 'Islas de Cabo Verde',   'CPV', 'https://api.fifa.com/api/v3/picture/flags-sq-4/CPV', '#222E77', '#FFFFFF', 'H', 'C'),
  ('JPN', 'Japón',                 'JPN', 'https://api.fifa.com/api/v3/picture/flags-sq-4/JPN', '#2830E7', '#FFFFFF', 'F', 'C'),
  ('JOR', 'Jordania',              'JOR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/JOR', '#FF1A1A', '#000000', 'J', 'C'),
  ('MAR', 'Marruecos',             'MAR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/MAR', '#E40000', '#000000', 'C', 'C'),
  ('NOR', 'Noruega',               'NOR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/NOR', '#C70000', '#FFFFFF', 'I', 'C'),
  ('NZL', 'Nueva Zelanda',         'NZL', 'https://api.fifa.com/api/v3/picture/flags-sq-4/NZL', '#000000', '#FFFFFF', 'G', 'C'),
  ('NED', 'Países Bajos',          'NED', 'https://api.fifa.com/api/v3/picture/flags-sq-4/NED', '#FF7A00', '#000000', 'F', 'C'),
  ('PAN', 'Panamá',                'PAN', 'https://api.fifa.com/api/v3/picture/flags-sq-4/PAN', '#E41027', '#FFFFFF', 'L', 'C'),
  ('PAR', 'Paraguay',              'PAR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/PAR', '#DE0000', '#FFFFFF', 'D', 'C'),
  ('POR', 'Portugal',              'POR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/POR', '#FF0000', '#000000', 'K', 'C'),
  ('COD', 'RD Congo',              'COD', 'https://api.fifa.com/api/v3/picture/flags-sq-4/COD', '#007FFF', '#000000', 'K', 'C'),
  ('KOR', 'República de Corea',    'KOR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/KOR', '#FF253A', '#000000', 'A', 'C'),
  ('IRN', 'RI de Irán',            'IRN', 'https://api.fifa.com/api/v3/picture/flags-sq-4/IRN', '#DF1818', '#FFFFFF', 'G', 'C'),
  ('SEN', 'Senegal',               'SEN', 'https://api.fifa.com/api/v3/picture/flags-sq-4/SEN', '#FFDA17', '#000000', 'I', 'C'),
  ('RSA', 'Sudáfrica',             'RSA', 'https://api.fifa.com/api/v3/picture/flags-sq-4/RSA', '#FFD600', '#000000', 'A', 'C'),
  ('SWE', 'Suecia',                'SWE', 'https://api.fifa.com/api/v3/picture/flags-sq-4/SWE', '#377E3F', '#FFFFFF', 'F', 'C'),
  ('SUI', 'Suiza',                 'SUI', 'https://api.fifa.com/api/v3/picture/flags-sq-4/SUI', '#E20000', '#FFFFFF', 'B', 'C'),
  ('TUN', 'Túnez',                 'TUN', 'https://api.fifa.com/api/v3/picture/flags-sq-4/TUN', '#E91426', '#FFFFFF', 'F', 'C'),
  ('TUR', 'Turquía',               'TUR', 'https://api.fifa.com/api/v3/picture/flags-sq-4/TUR', '#FFFFFF', '#000000', 'D', 'C'),
  ('URU', 'Uruguay',               'URU', 'https://api.fifa.com/api/v3/picture/flags-sq-4/URU', '#7EC1FF', '#000000', 'H', 'C'),
  ('UZB', 'Uzbekistán',            'UZB', 'https://api.fifa.com/api/v3/picture/flags-sq-4/UZB', '#112BB3', '#FFFFFF', 'K', 'C')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- 6. SEED — PARTIDOS (104 partidos)
-- ============================================================

INSERT INTO partidos (num, fecha, pais_local, pais_visitante, fase, estadio, lugar, grupo, jugado, penales_local, penales_visitante) VALUES
  (1,  '2026-06-11 14:00:00+00', 'MEX', 'RSA',      'Primera fase',              'Estadio Ciudad de México',          'Ciudad de México',                   'A',  false, NULL, NULL),
  (2,  '2026-06-11 21:00:00+00', 'KOR', 'CZE',      'Primera fase',              'Estadio Guadalajara',               'Guadalajara',                         'A',  false, NULL, NULL),
  (3,  '2026-06-12 14:00:00+00', 'CAN', 'BIH',      'Primera fase',              'Estadio de Toronto',                'Toronto',                             'B',  false, NULL, NULL),
  (4,  '2026-06-12 20:00:00+00', 'USA', 'PAR',      'Primera fase',              'Estadio Los Angeles',               'Los Ángeles',                         'D',  false, NULL, NULL),
  (5,  '2026-06-13 14:00:00+00', 'QAT', 'SUI',      'Primera fase',              'Estadio de la Bahía de San Francisco', 'Área de la Bahía de San Francisco', 'B',  false, NULL, NULL),
  (6,  '2026-06-13 17:00:00+00', 'BRA', 'MAR',      'Primera fase',              'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          'C',  false, NULL, NULL),
  (7,  '2026-06-13 20:00:00+00', 'HAI', 'SCO',      'Primera fase',              'Estadio Boston',                    'Boston',                              'C',  false, NULL, NULL),
  (8,  '2026-06-13 23:00:00+00', 'AUS', 'TUR',      'Primera fase',              'Estadio BC Place Vancouver',        'Vancouver',                           'D',  false, NULL, NULL),
  (9,  '2026-06-14 12:00:00+00', 'GER', 'CUW',      'Primera fase',              'Estadio Houston',                   'Houston',                             'E',  false, NULL, NULL),
  (10, '2026-06-14 15:00:00+00', 'NED', 'JPN',      'Primera fase',              'Estadio Dallas',                    'Dallas',                              'F',  false, NULL, NULL),
  (11, '2026-06-14 18:00:00+00', 'CIV', 'ECU',      'Primera fase',              'Estadio Filadelfia',                 'Filadelfia',                          'E',  false, NULL, NULL),
  (12, '2026-06-14 21:00:00+00', 'SWE', 'TUN',      'Primera fase',              'Estadio Monterrey',                 'Monterrey',                           'F',  false, NULL, NULL),
  (13, '2026-06-15 11:00:00+00', 'ESP', 'CPV',      'Primera fase',              'Estadio Atlanta',                   'Atlanta',                             'H',  false, NULL, NULL),
  (14, '2026-06-15 14:00:00+00', 'BEL', 'EGY',      'Primera fase',              'Estadio de Seattle',                'Seattle',                             'G',  false, NULL, NULL),
  (15, '2026-06-15 17:00:00+00', 'KSA', 'URU',      'Primera fase',              'Estadio Miami',                     'Miami',                               'H',  false, NULL, NULL),
  (16, '2026-06-15 20:00:00+00', 'IRN', 'NZL',      'Primera fase',              'Estadio Los Angeles',               'Los Ángeles',                         'G',  false, NULL, NULL),
  (17, '2026-06-16 14:00:00+00', 'FRA', 'SEN',      'Primera fase',              'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          'I',  false, NULL, NULL),
  (18, '2026-06-16 17:00:00+00', 'IRQ', 'NOR',      'Primera fase',              'Estadio Boston',                    'Boston',                              'I',  false, NULL, NULL),
  (19, '2026-06-16 20:00:00+00', 'ARG', 'ALG',      'Primera fase',              'Estadio Kansas City',               'Kansas City',                         'J',  false, NULL, NULL),
  (20, '2026-06-16 23:00:00+00', 'AUT', 'JOR',      'Primera fase',              'Estadio de la Bahía de San Francisco', 'Área de la Bahía de San Francisco', 'J',  false, NULL, NULL),
  (21, '2026-06-17 12:00:00+00', 'POR', 'COD',      'Primera fase',              'Estadio Houston',                   'Houston',                             'K',  false, NULL, NULL),
  (22, '2026-06-17 15:00:00+00', 'ENG', 'CRO',      'Primera fase',              'Estadio Dallas',                    'Dallas',                              'L',  false, NULL, NULL),
  (23, '2026-06-17 18:00:00+00', 'GHA', 'PAN',      'Primera fase',              'Estadio de Toronto',                'Toronto',                             'L',  false, NULL, NULL),
  (24, '2026-06-17 21:00:00+00', 'UZB', 'COL',      'Primera fase',              'Estadio Ciudad de México',          'Ciudad de México',                   'K',  false, NULL, NULL),
  (25, '2026-06-18 11:00:00+00', 'CZE', 'RSA',      'Primera fase',              'Estadio Atlanta',                   'Atlanta',                             'A',  false, NULL, NULL),
  (26, '2026-06-18 14:00:00+00', 'SUI', 'BIH',      'Primera fase',              'Estadio Los Angeles',               'Los Ángeles',                         'B',  false, NULL, NULL),
  (27, '2026-06-18 17:00:00+00', 'CAN', 'QAT',      'Primera fase',              'Estadio BC Place Vancouver',        'Vancouver',                           'B',  false, NULL, NULL),
  (28, '2026-06-18 20:00:00+00', 'MEX', 'KOR',      'Primera fase',              'Estadio Guadalajara',               'Guadalajara',                         'A',  false, NULL, NULL),
  (29, '2026-06-19 14:00:00+00', 'USA', 'AUS',      'Primera fase',              'Estadio de Seattle',                'Seattle',                             'D',  false, NULL, NULL),
  (30, '2026-06-19 17:00:00+00', 'SCO', 'MAR',      'Primera fase',              'Estadio Boston',                    'Boston',                              'C',  false, NULL, NULL),
  (31, '2026-06-19 19:30:00+00', 'BRA', 'HAI',      'Primera fase',              'Estadio Filadelfia',                 'Filadelfia',                          'C',  false, NULL, NULL),
  (32, '2026-06-19 22:00:00+00', 'TUR', 'PAR',      'Primera fase',              'Estadio de la Bahía de San Francisco', 'Área de la Bahía de San Francisco', 'D',  false, NULL, NULL),
  (33, '2026-06-20 12:00:00+00', 'NED', 'SWE',      'Primera fase',              'Estadio Houston',                   'Houston',                             'F',  false, NULL, NULL),
  (34, '2026-06-20 15:00:00+00', 'GER', 'CIV',      'Primera fase',              'Estadio de Toronto',                'Toronto',                             'E',  false, NULL, NULL),
  (35, '2026-06-20 19:00:00+00', 'ECU', 'CUW',      'Primera fase',              'Estadio Kansas City',               'Kansas City',                         'E',  false, NULL, NULL),
  (36, '2026-06-20 23:00:00+00', 'TUN', 'JPN',      'Primera fase',              'Estadio Monterrey',                 'Monterrey',                           'F',  false, NULL, NULL),
  (37, '2026-06-21 11:00:00+00', 'ESP', 'KSA',      'Primera fase',              'Estadio Atlanta',                   'Atlanta',                             'H',  false, NULL, NULL),
  (38, '2026-06-21 14:00:00+00', 'BEL', 'IRN',      'Primera fase',              'Estadio Los Angeles',               'Los Ángeles',                         'G',  false, NULL, NULL),
  (39, '2026-06-21 17:00:00+00', 'URU', 'CPV',      'Primera fase',              'Estadio Miami',                     'Miami',                               'H',  false, NULL, NULL),
  (40, '2026-06-21 20:00:00+00', 'NZL', 'EGY',      'Primera fase',              'Estadio BC Place Vancouver',        'Vancouver',                           'G',  false, NULL, NULL),
  (41, '2026-06-22 12:00:00+00', 'ARG', 'AUT',      'Primera fase',              'Estadio Dallas',                    'Dallas',                              'J',  false, NULL, NULL),
  (42, '2026-06-22 16:00:00+00', 'FRA', 'IRQ',      'Primera fase',              'Estadio Filadelfia',                 'Filadelfia',                          'I',  false, NULL, NULL),
  (43, '2026-06-22 19:00:00+00', 'NOR', 'SEN',      'Primera fase',              'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          'I',  false, NULL, NULL),
  (44, '2026-06-22 22:00:00+00', 'JOR', 'ALG',      'Primera fase',              'Estadio de la Bahía de San Francisco', 'Área de la Bahía de San Francisco', 'J',  false, NULL, NULL),
  (45, '2026-06-23 12:00:00+00', 'POR', 'UZB',      'Primera fase',              'Estadio Houston',                   'Houston',                             'K',  false, NULL, NULL),
  (46, '2026-06-23 15:00:00+00', 'ENG', 'GHA',      'Primera fase',              'Estadio Boston',                    'Boston',                              'L',  false, NULL, NULL),
  (47, '2026-06-23 18:00:00+00', 'PAN', 'CRO',      'Primera fase',              'Estadio de Toronto',                'Toronto',                             'L',  false, NULL, NULL),
  (48, '2026-06-23 21:00:00+00', 'COL', 'COD',      'Primera fase',              'Estadio Guadalajara',               'Guadalajara',                         'K',  false, NULL, NULL),
  (49, '2026-06-24 14:00:00+00', 'SUI', 'CAN',      'Primera fase',              'Estadio BC Place Vancouver',        'Vancouver',                           'B',  false, NULL, NULL),
  (50, '2026-06-24 14:00:00+00', 'BIH', 'QAT',      'Primera fase',              'Estadio de Seattle',                'Seattle',                             'B',  false, NULL, NULL),
  (51, '2026-06-24 17:00:00+00', 'SCO', 'BRA',      'Primera fase',              'Estadio Miami',                     'Miami',                               'C',  false, NULL, NULL),
  (52, '2026-06-24 17:00:00+00', 'MAR', 'HAI',      'Primera fase',              'Estadio Atlanta',                   'Atlanta',                             'C',  false, NULL, NULL),
  (53, '2026-06-24 20:00:00+00', 'CZE', 'MEX',      'Primera fase',              'Estadio Ciudad de México',          'Ciudad de México',                   'A',  false, NULL, NULL),
  (54, '2026-06-24 20:00:00+00', 'RSA', 'KOR',      'Primera fase',              'Estadio Monterrey',                 'Monterrey',                           'A',  false, NULL, NULL),
  (55, '2026-06-25 15:00:00+00', 'CUW', 'CIV',      'Primera fase',              'Estadio Filadelfia',                 'Filadelfia',                          'E',  false, NULL, NULL),
  (56, '2026-06-25 15:00:00+00', 'ECU', 'GER',      'Primera fase',              'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          'E',  false, NULL, NULL),
  (57, '2026-06-25 18:00:00+00', 'JPN', 'SWE',      'Primera fase',              'Estadio Dallas',                    'Dallas',                              'F',  false, NULL, NULL),
  (58, '2026-06-25 18:00:00+00', 'TUN', 'NED',      'Primera fase',              'Estadio Kansas City',               'Kansas City',                         'F',  false, NULL, NULL),
  (59, '2026-06-25 21:00:00+00', 'TUR', 'USA',      'Primera fase',              'Estadio Los Angeles',               'Los Ángeles',                         'D',  false, NULL, NULL),
  (60, '2026-06-25 21:00:00+00', 'PAR', 'AUS',      'Primera fase',              'Estadio de la Bahía de San Francisco', 'Área de la Bahía de San Francisco', 'D',  false, NULL, NULL),
  (61, '2026-06-26 14:00:00+00', 'NOR', 'FRA',      'Primera fase',              'Estadio Boston',                    'Boston',                              'I',  false, NULL, NULL),
  (62, '2026-06-26 14:00:00+00', 'SEN', 'IRQ',      'Primera fase',              'Estadio de Toronto',                'Toronto',                             'I',  false, NULL, NULL),
  (63, '2026-06-26 19:00:00+00', 'CPV', 'KSA',      'Primera fase',              'Estadio Houston',                   'Houston',                             'H',  false, NULL, NULL),
  (64, '2026-06-26 19:00:00+00', 'URU', 'ESP',      'Primera fase',              'Estadio Guadalajara',               'Guadalajara',                         'H',  false, NULL, NULL),
  (65, '2026-06-26 22:00:00+00', 'EGY', 'IRN',      'Primera fase',              'Estadio de Seattle',                'Seattle',                             'G',  false, NULL, NULL),
  (66, '2026-06-26 22:00:00+00', 'NZL', 'BEL',      'Primera fase',              'Estadio BC Place Vancouver',        'Vancouver',                           'G',  false, NULL, NULL),
  (67, '2026-06-27 16:00:00+00', 'PAN', 'ENG',      'Primera fase',              'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          'L',  false, NULL, NULL),
  (68, '2026-06-27 16:00:00+00', 'CRO', 'GHA',      'Primera fase',              'Estadio Filadelfia',                 'Filadelfia',                          'L',  false, NULL, NULL),
  (69, '2026-06-27 18:30:00+00', 'COL', 'POR',      'Primera fase',              'Estadio Miami',                     'Miami',                               'K',  false, NULL, NULL),
  (70, '2026-06-27 18:30:00+00', 'COD', 'UZB',      'Primera fase',              'Estadio Atlanta',                   'Atlanta',                             'K',  false, NULL, NULL),
  (71, '2026-06-27 21:00:00+00', 'ALG', 'AUT',      'Primera fase',              'Estadio Kansas City',               'Kansas City',                         'J',  false, NULL, NULL),
  (72, '2026-06-27 21:00:00+00', 'JOR', 'ARG',      'Primera fase',              'Estadio Dallas',                    'Dallas',                              'J',  false, NULL, NULL),
  -- Dieciseisavos de final
  (73, '2026-06-28 14:00:00+00', '2A',    '2B',      'Dieciseisavos de final',    'Estadio Los Angeles',               'Los Ángeles',                         '',   false, NULL, NULL),
  (74, '2026-06-29 12:00:00+00', '1C',    '2F',      'Dieciseisavos de final',    'Estadio Houston',                   'Houston',                             '',   false, NULL, NULL),
  (75, '2026-06-29 15:30:00+00', '1E',    '3ABCDF',  'Dieciseisavos de final',    'Estadio Boston',                    'Boston',                              '',   false, NULL, NULL),
  (76, '2026-06-29 20:00:00+00', '1F',    '2C',      'Dieciseisavos de final',    'Estadio Monterrey',                 'Monterrey',                           '',   false, NULL, NULL),
  (77, '2026-06-30 12:00:00+00', '2E',    '2I',      'Dieciseisavos de final',    'Estadio Dallas',                    'Dallas',                              '',   false, NULL, NULL),
  (78, '2026-06-30 16:00:00+00', '1I',    '3CDFGH',  'Dieciseisavos de final',    'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          '',   false, NULL, NULL),
  (79, '2026-06-30 20:00:00+00', '1A',    '3CEFHI',  'Dieciseisavos de final',    'Estadio Ciudad de México',          'Ciudad de México',                   '',   false, NULL, NULL),
  (80, '2026-07-01 11:00:00+00', '1L',    '3EHIJK',  'Dieciseisavos de final',    'Estadio Atlanta',                   'Atlanta',                             '',   false, NULL, NULL),
  (81, '2026-07-01 15:00:00+00', '1G',    '3AEHIJ',  'Dieciseisavos de final',    'Estadio de Seattle',                'Seattle',                             '',   false, NULL, NULL),
  (82, '2026-07-01 19:00:00+00', '1D',    '3BEFIJ',  'Dieciseisavos de final',    'Estadio de la Bahía de San Francisco', 'Área de la Bahía de San Francisco', '', false, NULL, NULL),
  (83, '2026-07-02 14:00:00+00', '1H',    '2J',      'Dieciseisavos de final',    'Estadio Los Angeles',               'Los Ángeles',                         '',   false, NULL, NULL),
  (84, '2026-07-02 18:00:00+00', '2K',    '2L',      'Dieciseisavos de final',    'Estadio de Toronto',                'Toronto',                             '',   false, NULL, NULL),
  (85, '2026-07-02 22:00:00+00', '1B',    '3EFGIJ',  'Dieciseisavos de final',    'Estadio BC Place Vancouver',        'Vancouver',                           '',   false, NULL, NULL),
  (86, '2026-07-03 13:00:00+00', '2D',    '2G',      'Dieciseisavos de final',    'Estadio Dallas',                    'Dallas',                              '',   false, NULL, NULL),
  (87, '2026-07-03 17:00:00+00', '1J',    '2H',      'Dieciseisavos de final',    'Estadio Miami',                     'Miami',                               '',   false, NULL, NULL),
  (88, '2026-07-03 20:30:00+00', '1K',    '3DEIJL',  'Dieciseisavos de final',    'Estadio Kansas City',               'Kansas City',                         '',   false, NULL, NULL),
  -- Octavos de final
  (89, '2026-07-04 12:00:00+00', 'W73',   'W75',     'Octavos de final',          'Estadio Houston',                   'Houston',                             '',   false, NULL, NULL),
  (90, '2026-07-04 16:00:00+00', 'W74',   'W77',     'Octavos de final',          'Estadio Filadelfia',                 'Filadelfia',                          '',   false, NULL, NULL),
  (91, '2026-07-05 15:00:00+00', 'W76',   'W78',     'Octavos de final',          'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          '',   false, NULL, NULL),
  (92, '2026-07-05 19:00:00+00', 'W79',   'W80',     'Octavos de final',          'Estadio Ciudad de México',          'Ciudad de México',                   '',   false, NULL, NULL),
  (93, '2026-07-06 14:00:00+00', 'W83',   'W84',     'Octavos de final',          'Estadio Dallas',                    'Dallas',                              '',   false, NULL, NULL),
  (94, '2026-07-06 19:00:00+00', 'W81',   'W82',     'Octavos de final',          'Estadio de Seattle',                'Seattle',                             '',   false, NULL, NULL),
  (95, '2026-07-07 11:00:00+00', 'W86',   'W88',     'Octavos de final',          'Estadio Atlanta',                   'Atlanta',                             '',   false, NULL, NULL),
  (96, '2026-07-07 15:00:00+00', 'W85',   'W87',     'Octavos de final',          'Estadio BC Place Vancouver',        'Vancouver',                           '',   false, NULL, NULL),
  -- Cuartos de final
  (97,  '2026-07-09 15:00:00+00', 'W89',  'W90',     'Cuartos de final',          'Estadio Boston',                    'Boston',                              '',   false, NULL, NULL),
  (98,  '2026-07-10 14:00:00+00', 'W93',  'W94',     'Cuartos de final',          'Estadio Los Angeles',               'Los Ángeles',                         '',   false, NULL, NULL),
  (99,  '2026-07-11 16:00:00+00', 'W91',  'W92',     'Cuartos de final',          'Estadio Miami',                     'Miami',                               '',   false, NULL, NULL),
  (100, '2026-07-11 20:00:00+00', 'W95',  'W96',     'Cuartos de final',          'Estadio Kansas City',               'Kansas City',                         '',   false, NULL, NULL),
  -- Semifinal
  (101, '2026-07-14 14:00:00+00', 'W97',  'W98',     'Semifinal',                 'Estadio Dallas',                    'Dallas',                              '',   false, NULL, NULL),
  (102, '2026-07-15 14:00:00+00', 'W99',  'W100',    'Semifinal',                 'Estadio Atlanta',                   'Atlanta',                             '',   false, NULL, NULL),
  -- Tercer puesto y Final
  (103, '2026-07-18 16:00:00+00', 'RU101','RU102',   'Partido por el tercer puesto', 'Estadio Miami',                  'Miami',                               '',   false, NULL, NULL),
  (104, '2026-07-19 14:00:00+00', 'W101', 'W102',    'Final',                     'Estadio Nueva York/Nueva Jersey',   'Nueva York',                          '',   false, NULL, NULL)
ON CONFLICT (num) DO NOTHING;

-- ============================================================
-- 7. GOLEADORES — vacío (se carga desde Supabase Dashboard)
-- ============================================================
-- No hay datos iniciales. La tabla se rellena partido a partido.
