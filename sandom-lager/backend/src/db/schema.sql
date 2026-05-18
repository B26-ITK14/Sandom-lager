-- Sandom Lager Database Schema

-- This file defines the database schema for the Sandom Lager application.
-- It includes the necessary tables and their relationships.

-- LOCATIONS --
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- Inserting default locations
INSERT INTO locations (name)
VALUES ('Sandom Retreatsenter'),
       ('Tomasgården')
ON CONFLICT DO NOTHING;

-- USERS --
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    auth0_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    username TEXT,
    profile_picture TEXT,
    role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin', 'manager')),
    notify_inventory BOOLEAN DEFAULT TRUE,
    notify_recipes BOOLEAN DEFAULT TRUE,
    notify_system BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique_idx
ON users (LOWER(username))
WHERE username IS NOT NULL;

-- USER SESSIONS --
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,                          -- JWT jti claim
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- REVOKED SESSIONS --
-- Sessions listed here are denied on subsequent requests (force logout).
CREATE TABLE IF NOT EXISTS revoked_sessions (
    id TEXT PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- USER LOCATION ACCESS --
CREATE TABLE IF NOT EXISTS user_locations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    access_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, location_id)
);

-- INGREDIENTS --
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL -- 'kg', 'liter'
);

-- RECIPES --
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    instructions TEXT,
    image_url TEXT,
    image_public_id TEXT,
    servings INT NOT NULL DEFAULT 8,
    created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE recipes
ADD COLUMN IF NOT EXISTS image_public_id TEXT;

-- RECIPE INGREDIENTS --
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL
);

 -- ALLERGENS --
CREATE TABLE IF NOT EXISTS allergens (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO allergens (name)
VALUES ('Gluten'),
       ('Skalldyr'),
       ('Egg'),
       ('Fisk'),
       ('Peanøtter'),
       ('Soya'),
       ('Melk'),
       ('Nøtter'),
       ('Selleri'),
       ('Sennep'),
       ('Sesamfrø'),
       ('Sulfitter'),
       ('Lupin'),
       ('Bløtdyr')
ON CONFLICT DO NOTHING;

-- CATEGORIES --
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

INSERT INTO categories (name)
VALUES ('Frokost'),
       ('Lunsj'),
       ('Middag'),
       ('Mellommåltid'),
       ('Kveldsmat')
ON CONFLICT DO NOTHING;

-- RECIPE ALLERGENS --
CREATE TABLE IF NOT EXISTS recipe_allergens (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    allergen_id INT REFERENCES allergens(id) ON DELETE CASCADE,
    UNIQUE(recipe_id, allergen_id)
);

-- INVENTORY --
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(location_id, ingredient_id)
);

-- SHOPPING LIST --
CREATE TABLE IF NOT EXISTS shopping_list (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    needed_quantity NUMERIC NOT NULL,
    unit_override TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE shopping_list
ADD COLUMN IF NOT EXISTS unit_override TEXT;

ALTER TABLE shopping_list
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- SHOPPING LIST HISTORY --
CREATE TABLE IF NOT EXISTS shopping_list_history_batches (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    deleted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
    deleted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shopping_list_history_items (
    id SERIAL PRIMARY KEY,
    batch_id INT REFERENCES shopping_list_history_batches(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE SET NULL,
    ingredient_name_snapshot TEXT NOT NULL,
    unit_snapshot TEXT NOT NULL,
    needed_quantity_snapshot NUMERIC NOT NULL,
    stock_quantity_snapshot NUMERIC NOT NULL DEFAULT 0
);

-- LOGS --
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS revoked_sessions (
    id TEXT PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    revoked_at TIMESTAMP NOT NULL DEFAULT NOW()
);


-- NOTIFICATIONS --
CREATE TABLE IF NOT EXISTS notifications(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('warning', 'info', 'alert')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    location_nickname TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_created_idx
ON notifications (user_id, created_at DESC);