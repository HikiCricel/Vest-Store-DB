INSERT INTO armor_classes (class_name, protection_level, max_caliber) VALUES ('Бр1', 1, '9mm ПМ') RETURNING id;

INSERT INTO materials (material_name, density, durability_rating, water_resistant) VALUES ('Арамидное волокно', 1.44, 8, true) RETURNING id;

INSERT INTO sizes (size_name, chest_min_cm, chest_max_cm, height_min_cm, height_max_cm) VALUES ('L', 100, 110, 175, 185) RETURNING id;

INSERT INTO manufacturers (company_name, country, established_year) VALUES ('АрмТех', 'Россия', 2005) RETURNING id;

INSERT INTO armor_products (name, price, stock_quantity, armor_class_id, material_id, size_id, manufacturer_id) VALUES (
    'Тактический бронежилет "Щит-5"',
    25000.00,
    15,
    1,  -- armor_class_id
    1,  -- material_id  
    1,  -- size_id
    1   -- manufacturer_id
) RETURNING id;

INSERT INTO certificates (certificate_name) VALUES (
    'ГОСТ Р 50744-95'
) RETURNING id;  

INSERT INTO product_certificates (armor_product_id, certificate_id, certificate_number) VALUES (
    1,  -- id armor_products
    1,  -- id certificates  
    'ГОСТ-50744-12345'
);