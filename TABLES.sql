CREATE TABLE armor_classes (
    id SERIAL PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE,
    protection_level INTEGER NOT NULL CHECK (protection_level BETWEEN 1 AND 6),
    max_caliber VARCHAR(50)
);

CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    material_name VARCHAR(100) NOT NULL UNIQUE,
    density DECIMAL(5, 2) NOT NULL CHECK (density > 0),
    durability_rating INTEGER NOT NULL CHECK (durability_rating BETWEEN 1 AND 10),
    water_resistant BOOLEAN DEFAULT false
);

CREATE TABLE sizes (
    id SERIAL PRIMARY KEY,
    size_name VARCHAR(20) NOT NULL UNIQUE,
    chest_min_cm INTEGER NOT NULL CHECK (chest_min_cm > 0),
    chest_max_cm INTEGER NOT NULL CHECK (chest_max_cm > chest_min_cm),
    height_min_cm INTEGER NOT NULL CHECK (height_min_cm > 0),
    height_max_cm INTEGER NOT NULL CHECK (height_max_cm > height_min_cm)
);

CREATE TABLE manufacturers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100) NOT NULL,
    established_year INTEGER CHECK (established_year BETWEEN 1800 AND EXTRACT(YEAR FROM CURRENT_DATE))
);

CREATE TABLE armor_products (
	id SERIAL PRIMARY KEY,
	name VARCHAR(255) NOT NULL,
	price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
	stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >=0),

	armor_class_id INTEGER REFERENCES armor_classes ON DELETE SET NULL,
	materials_id INTEGER REFERENCES materials ON DELETE SET NULL,
	sizes_id INTEGER REFERENCES sizes ON DELETE SET NULL,
	manufacturers_id INTEGER REFERENCES manufacturers ON DELETE SET NULL
);

CREATE TABLE certificates (
    id SERIAL PRIMARY KEY,
    certificate_name VARCHAR(255) NOT NULL
);

CREATE TABLE product_certificates (
    armor_product_id INTEGER NOT NULL REFERENCES armor_products(id) ON DELETE CASCADE,
    certificate_id INTEGER NOT NULL REFERENCES certificates(id) ON DELETE CASCADE,
    certificate_name VARCHAR(100),
    PRIMARY KEY (armor_product_id, certificate_id)
);