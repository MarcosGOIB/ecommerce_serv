CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  short_description VARCHAR(255) NOT NULL,
  full_description TEXT NOT NULL,
  image_url VARCHAR(255),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  brand VARCHAR(100),
  game_type VARCHAR(100)
);

CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_cart_user ON cart_items(user_id);


INSERT INTO users (username, email, password, role, created_at, updated_at) VALUES 
('admin', 'admin@example.com', '$2b$10$XW4plBGI93xHgFWjyB7X7.3xHD/dCmbdCYYpj9rZUVLtbQ9mV3iyW', 'admin', NOW(), NOW()),
('usuario', 'usuario@example.com', '$2b$10$XW4plBGI93xHgFWjyB7X7.3xHD/dCmbdCYYpj9rZUVLtbQ9mV3iyW', 'user', NOW(), NOW());


INSERT INTO categories (name, slug, description) VALUES 
('Juegos de Cartas', 'juegos-de-cartas', 'Juegos de cartas coleccionables y tradicionales'),
('Accesorios', 'accesorios', 'Accesorios para juegos de cartas y de mesa'),
('Singles', 'singles', 'Cartas individuales para coleccionistas');


INSERT INTO products (name, price, quantity, short_description, full_description, image_url, category_id, brand, game_type) VALUES
('Magic: The Gathering - Core Set 2021', 89.99, 25, 'Booster Box del Set Base 2021 de Magic', 'Contiene 36 sobres de 15 cartas cada uno del Set Base 2021 de Magic: The Gathering. Colecciona poderosas cartas y construye tu mazo ideal.', '/uploads/default-magic.jpg', 1, 'Wizards of the Coast', 'Magic'),
('Yu-Gi-Oh! - Estructura de Dragón', 14.99, 40, 'Baraja de estructura de Yu-Gi-Oh!', 'Baraja pre-construida lista para jugar. Contiene 40 cartas con estrategia basada en dragones.', '/uploads/default-yugioh.jpg', 1, 'Konami', 'Yu-Gi-Oh'),
('Fundas Ultra Pro', 9.99, 100, 'Fundas protectoras para cartas', 'Pack de 100 fundas transparentes Ultra Pro. Protege tus cartas valiosas del desgaste y los daños.', '/uploads/default-sleeves.jpg', 2, 'Ultra Pro', NULL),
('Playmat de Tela', 24.99, 15, 'Tapete para juegos de cartas', 'Tapete de tela de alta calidad con superficie antideslizante. Dimensiones: 60cm x 35cm.', '/uploads/default-playmat.jpg', 2, 'Dragon Shield', NULL),
('Jace, el Escultor Mental', 49.99, 5, 'Carta mítica rara de Magic', 'Planeswalker legendario, una de las cartas más buscadas de Magic: The Gathering.', '/uploads/default-jace.jpg', 3, 'Wizards of the Coast', 'Magic'),
('Blue-Eyes White Dragon', 29.99, 8, 'Carta ultra rara de Yu-Gi-Oh!', 'Dragón Blanco de Ojos Azules, una de las cartas icónicas de Yu-Gi-Oh!', '/uploads/default-blueeyes.jpg', 3, 'Konami', 'Yu-Gi-Oh');

