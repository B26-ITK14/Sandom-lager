-- Sandom Lager Database Schema

-- This file defines the database schema for the Sandom Lager application.
-- It includes the necessary tables and their relationships.

-- Locations
CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    name TEXT(255) NOT NULL UNIQUE,
);

-- Inserting default locations
INSERT INTO locations (name)
VALUES ('Sandom Retreatsenter'),
       ('Tomasgården');