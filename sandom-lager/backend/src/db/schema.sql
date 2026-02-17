-- Sandom Lager Database Schema

-- This file defines the database schema for the Sandom Lager application.
-- It includes the necessary tables and their relationships.

-- LOCATIONS --
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT(255) NOT NULL UNIQUE,
);

-- Inserting default locations
INSERT INTO locations (name)
VALUES ('Sandom Retreatsenter'),
       ('Tomasgården');

-- USERS --
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    auth0_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'manager'
    created_at TIMESTAMPTZ DEFAULT NOW(),
);

-- USER LOCATION ACCESS --
CREATE TABLE IF NOT EXISTS user_locations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    access_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    UNIQUE(user_id, location_id)
);

-- INGREDIENTS --
CREATE TABLE IF NOT EXISTS ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL, -- 'kg', 'liter'
);

-- RECIPES --
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    location_id INT REFERENCES locations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    instructions TEXT, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
);

-- RECIPE INGREDIENTS --
CREATE TABLE recipe_ingredients (
    id SERIAL PRIMARY KEY,
    recipe_id INT REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id INT REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
);

 -- ALLERGENS --
CREATE TABLE IF NOT EXISTS allergens (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
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
       ('Bløtdyr');
