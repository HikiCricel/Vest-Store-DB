INSERT INTO armor_classes (class_name, protection_level, max_caliber) VALUES
('Бр2', 2, '9mm ПМ'),
('Бр3', 3, '7.62x39 мм'),
('Бр4', 4, '7.62x54 мм'),
('Бр5', 5, '7.62x51 мм'),
('Бр6', 6, '12.7x108 мм');

INSERT INTO materials (material_name, density, durability_rating, water_resistant) VALUES
('Ультрамолекулярный полиэтилен', 0.97, 9, true),
('Сталь', 7.85, 7, false),
('Титановый сплав', 4.51, 10, false),
('Керамика', 3.95, 6, false),
('Гибридный композит', 2.8, 9, true);

INSERT INTO sizes (size_name, chest_min_cm, chest_max_cm, height_min_cm, height_max_cm) VALUES
('S', 85, 95, 160, 170),
('M', 95, 105, 170, 180),
('L', 105, 115, 175, 185),
('XL', 115, 125, 180, 190),
('XXL', 125, 135, 185, 195);

INSERT INTO manufacturers (company_name, country, established_year) VALUES
('Сафар-Защита', 'Россия', 2010),
('Ratnik Industries', 'Россия', 2012),
('СпецТехноАльянс', 'Беларусь', 2008),
('UARMOR Global', 'США', 2003),
('Turtle Defense', 'Германия', 1998),
('Steel Shield Ltd', 'Украина', 2007),
('Nordic Armor Systems', 'Швеция', 2011);

INSERT INTO certificates (certificate_name) VALUES
('ГОСТ Р 50854-2002'),
('ТР ТС 018/2011'),
('NIJ Standard-0101.06'),
('VPAM APR 2018'),
('STANAG 2920'),
('MIL-STD-662F');