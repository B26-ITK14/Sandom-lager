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