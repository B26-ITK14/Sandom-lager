BEGIN;

TRUNCATE TABLE
    logs,
    shopping_list,
    inventory,
    recipe_allergens,
    recipe_ingredients,
    recipes,
    allergens,
    ingredients,
    user_locations,
    user_sessions,
    users,
    locations
RESTART IDENTITY CASCADE;

-- =====================================
-- LOCATIONS
-- =====================================
INSERT INTO locations (name)
VALUES
    ('Sandom Retreatsenter'),
    ('Tomasgården'),
    ('Fjellhytta');

-- =====================================
-- USERS
-- =====================================
INSERT INTO users (auth0_id, email, name, profile_picture, role)
VALUES
    ('auth0|admin001',   'admin@sandom.no',   'Siri Admin',     'https://example.com/siri.jpg',   'admin'),
    ('auth0|manager001', 'manager@sandom.no', 'Morten Manager', 'https://example.com/morten.jpg', 'manager'),
    ('auth0|user001',    'anna@sandom.no',    'Anna Hansen',    'https://example.com/anna.jpg',   'user'),
    ('auth0|user002',    'bjorn@sandom.no',   'Bjørn Olsen',    'https://example.com/bjorn.jpg',  'user'),
    ('auth0|user003',    'clara@sandom.no',   'Clara Nilsen',   'https://example.com/clara.jpg',  'user'),
    ('auth0|user004',    'david@sandom.no',   'David Berg',     'https://example.com/david.jpg',  'user');

-- =====================================
-- USER SESSIONS
-- =====================================
INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at, last_seen_at)
SELECT 'sess-admin-001', id, '192.168.1.10', 'Mozilla/5.0 (Macintosh)', NOW() - INTERVAL '3 days', NOW() - INTERVAL '10 minutes'
FROM users WHERE email = 'admin@sandom.no';

INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at, last_seen_at)
SELECT 'sess-manager-001', id, '192.168.1.11', 'Mozilla/5.0 (Windows)', NOW() - INTERVAL '2 days', NOW() - INTERVAL '25 minutes'
FROM users WHERE email = 'manager@sandom.no';

INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at, last_seen_at)
SELECT 'sess-anna-001', id, '192.168.1.20', 'Mozilla/5.0 (iPhone)', NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 minutes'
FROM users WHERE email = 'anna@sandom.no';

INSERT INTO user_sessions (id, user_id, ip_address, user_agent, created_at, last_seen_at)
SELECT 'sess-bjorn-001', id, '192.168.1.21', 'Mozilla/5.0 (Android)', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '2 hours'
FROM users WHERE email = 'bjorn@sandom.no';

-- =====================================
-- USER LOCATION ACCESS
-- =====================================
INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'approved'
FROM users u
CROSS JOIN locations l
WHERE u.email = 'admin@sandom.no';

INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'approved'
FROM users u
JOIN locations l ON l.name IN ('Sandom Retreatsenter', 'Tomasgården')
WHERE u.email = 'manager@sandom.no';

INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'approved'
FROM users u
JOIN locations l ON l.name = 'Sandom Retreatsenter'
WHERE u.email = 'anna@sandom.no';

INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'pending'
FROM users u
JOIN locations l ON l.name = 'Tomasgården'
WHERE u.email = 'anna@sandom.no';

INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'approved'
FROM users u
JOIN locations l ON l.name = 'Tomasgården'
WHERE u.email = 'bjorn@sandom.no';

INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'denied'
FROM users u
JOIN locations l ON l.name = 'Sandom Retreatsenter'
WHERE u.email = 'clara@sandom.no';

INSERT INTO user_locations (user_id, location_id, access_status)
SELECT u.id, l.id, 'pending'
FROM users u
JOIN locations l ON l.name = 'Fjellhytta'
WHERE u.email = 'david@sandom.no';

-- =====================================
-- INGREDIENTS
-- =====================================
INSERT INTO ingredients (name, unit)
VALUES
    ('Hvetemel', 'kg'),
    ('Sukker', 'kg'),
    ('Salt', 'kg'),
    ('Smør', 'kg'),
    ('Melk', 'liter'),
    ('Egg', 'stk'),
    ('Ris', 'kg'),
    ('Kyllingfilet', 'kg'),
    ('Tomater', 'kg'),
    ('Løk', 'kg'),
    ('Hvitløk', 'kg'),
    ('Olivenolje', 'liter'),
    ('Pasta', 'kg'),
    ('Ost', 'kg'),
    ('Brød', 'stk'),
    ('Yoghurt', 'liter'),
    ('Havregryn', 'kg'),
    ('Peanøtter', 'kg'),
    ('Laks', 'kg'),
    ('Poteter', 'kg'),
    ('Gulrøtter', 'kg'),
    ('Paprika', 'kg'),
    ('Sopp', 'kg'),
    ('Kikerter', 'kg'),
    ('Kokosmelk', 'liter'),
    ('Soya saus', 'liter'),
    ('Sesamfrø', 'kg');

-- =====================================
-- ALLERGENS
-- =====================================
INSERT INTO allergens (name)
VALUES
    ('Gluten'),
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

-- =====================================
-- RECIPES
-- =====================================
INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES (
    'Pannekaker',
    'Frokost',
    'Bland mel, melk og egg. Stek i panne med smør.',
    'https://res.cloudinary.com/sandom/image/upload/v1/recipe-images/recipe-1-1776118658004?_a=BAMAOGfk0',
    'recipe-images/recipe-1-1776118658004',
    NOW() - INTERVAL '20 days'
);

INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES (
    'Kyllinggryte',
    'Middag',
    'Stek kylling, løk og hvitløk. Tilsett tomater og paprika.',
    'https://res.cloudinary.com/sandom/image/upload/v1/recipe-images/recipe-2-1776118669298?_a=BAMAOGfk0',
    'recipe-images/recipe-2-1776118669298',
    NOW() - INTERVAL '15 days'
);

INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES ('Ovnsbakt laks', 'Middag', 'Bak laks i ovn. Server med poteter og gulrøtter.', NULL, NULL, NOW() - INTERVAL '10 days');

INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES ('Pasta med ostesaus', 'Middag', 'Kok pasta. Lag saus med smør, melk og ost.', NULL, NULL, NOW() - INTERVAL '8 days');

INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES ('Overnight oats', 'Frokost', 'Bland havregryn, yoghurt og melk. La stå over natten.', NULL, NULL, NOW() - INTERVAL '5 days');

INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES (
    'Kikertcurry',
    'Middag',
    'Stek løk og hvitløk, tilsett kikerter og kokosmelk.',
    'https://res.cloudinary.com/sandom/image/upload/v1/recipe-images/recipe-6-1776118740207?_a=BAMAOGfk0',
    'recipe-images/recipe-6-1776118740207',
    NOW() - INTERVAL '3 days'
);

INSERT INTO recipes (title, category, instructions, image_url, image_public_id, created_at)
VALUES (
    'Asiatisk nudelsalat',
    'Lunsj',
    'Bland nudler, grønnsaker, soyasaus, peanøtter og sesam.',
    'https://res.cloudinary.com/sandom/image/upload/v1/recipe-images/recipe-7-1776118704553?_a=BAMAOGfk0',
    'recipe-images/recipe-7-1776118704553',
    NOW() - INTERVAL '1 day'
);

-- =====================================
-- RECIPE INGREDIENTS
-- =====================================
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Pannekaker' AND i.name = 'Hvetemel';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.5 FROM recipes r, ingredients i
WHERE r.title = 'Pannekaker' AND i.name = 'Melk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 6 FROM recipes r, ingredients i
WHERE r.title = 'Pannekaker' AND i.name = 'Egg';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.2 FROM recipes r, ingredients i
WHERE r.title = 'Pannekaker' AND i.name = 'Smør';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.1 FROM recipes r, ingredients i
WHERE r.title = 'Pannekaker' AND i.name = 'Sukker';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 2.5 FROM recipes r, ingredients i
WHERE r.title = 'Kyllinggryte' AND i.name = 'Kyllingfilet';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Kyllinggryte' AND i.name = 'Tomater';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.5 FROM recipes r, ingredients i
WHERE r.title = 'Kyllinggryte' AND i.name = 'Løk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.1 FROM recipes r, ingredients i
WHERE r.title = 'Kyllinggryte' AND i.name = 'Hvitløk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.5 FROM recipes r, ingredients i
WHERE r.title = 'Kyllinggryte' AND i.name = 'Paprika';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 2.0 FROM recipes r, ingredients i
WHERE r.title = 'Ovnsbakt laks' AND i.name = 'Laks';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 3.0 FROM recipes r, ingredients i
WHERE r.title = 'Ovnsbakt laks' AND i.name = 'Poteter';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Ovnsbakt laks' AND i.name = 'Gulrøtter';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.05 FROM recipes r, ingredients i
WHERE r.title = 'Ovnsbakt laks' AND i.name = 'Salt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.5 FROM recipes r, ingredients i
WHERE r.title = 'Pasta med ostesaus' AND i.name = 'Pasta';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Pasta med ostesaus' AND i.name = 'Melk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.4 FROM recipes r, ingredients i
WHERE r.title = 'Pasta med ostesaus' AND i.name = 'Smør';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.8 FROM recipes r, ingredients i
WHERE r.title = 'Pasta med ostesaus' AND i.name = 'Ost';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Overnight oats' AND i.name = 'Havregryn';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Overnight oats' AND i.name = 'Yoghurt';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.5 FROM recipes r, ingredients i
WHERE r.title = 'Overnight oats' AND i.name = 'Melk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.5 FROM recipes r, ingredients i
WHERE r.title = 'Kikertcurry' AND i.name = 'Kikerter';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 1.0 FROM recipes r, ingredients i
WHERE r.title = 'Kikertcurry' AND i.name = 'Kokosmelk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.4 FROM recipes r, ingredients i
WHERE r.title = 'Kikertcurry' AND i.name = 'Løk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.08 FROM recipes r, ingredients i
WHERE r.title = 'Kikertcurry' AND i.name = 'Hvitløk';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.3 FROM recipes r, ingredients i
WHERE r.title = 'Asiatisk nudelsalat' AND i.name = 'Soya saus';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.2 FROM recipes r, ingredients i
WHERE r.title = 'Asiatisk nudelsalat' AND i.name = 'Peanøtter';

INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
SELECT r.id, i.id, 0.05 FROM recipes r, ingredients i
WHERE r.title = 'Asiatisk nudelsalat' AND i.name = 'Sesamfrø';

-- =====================================
-- RECIPE ALLERGENS
-- =====================================
INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Pannekaker' AND a.name = 'Gluten';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Pannekaker' AND a.name = 'Egg';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Pannekaker' AND a.name = 'Melk';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Ovnsbakt laks' AND a.name = 'Fisk';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Pasta med ostesaus' AND a.name = 'Gluten';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Pasta med ostesaus' AND a.name = 'Melk';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Overnight oats' AND a.name = 'Melk';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Asiatisk nudelsalat' AND a.name = 'Peanøtter';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Asiatisk nudelsalat' AND a.name = 'Soya';

INSERT INTO recipe_allergens (recipe_id, allergen_id)
SELECT r.id, a.id FROM recipes r, allergens a
WHERE r.title = 'Asiatisk nudelsalat' AND a.name = 'Sesamfrø';

-- =====================================
-- INVENTORY
-- =====================================
INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 12.0, NOW() - INTERVAL '2 hours'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Hvetemel';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 0.5, NOW() - INTERVAL '1 hour'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Melk';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 30, NOW() - INTERVAL '30 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Egg';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 0, NOW() - INTERVAL '45 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Smør';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 8.0, NOW() - INTERVAL '2 days'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Ris';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 4.5, NOW() - INTERVAL '4 hours'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Kyllingfilet';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 0.2, NOW() - INTERVAL '5 hours'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Peanøtter';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 10.0, NOW() - INTERVAL '1 day'
FROM locations l, ingredients i
WHERE l.name = 'Tomasgården' AND i.name = 'Pasta';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 0.1, NOW() - INTERVAL '20 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Tomasgården' AND i.name = 'Ost';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 3.0, NOW() - INTERVAL '3 hours'
FROM locations l, ingredients i
WHERE l.name = 'Tomasgården' AND i.name = 'Melk';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 1.5, NOW() - INTERVAL '6 hours'
FROM locations l, ingredients i
WHERE l.name = 'Tomasgården' AND i.name = 'Laks';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 15.0, NOW() - INTERVAL '6 hours'
FROM locations l, ingredients i
WHERE l.name = 'Tomasgården' AND i.name = 'Poteter';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 5.0, NOW() - INTERVAL '12 hours'
FROM locations l, ingredients i
WHERE l.name = 'Fjellhytta' AND i.name = 'Havregryn';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 2.0, NOW() - INTERVAL '12 hours'
FROM locations l, ingredients i
WHERE l.name = 'Fjellhytta' AND i.name = 'Yoghurt';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 0.0, NOW() - INTERVAL '1 hour'
FROM locations l, ingredients i
WHERE l.name = 'Fjellhytta' AND i.name = 'Kokosmelk';

INSERT INTO inventory (location_id, ingredient_id, quantity, updated_at)
SELECT l.id, i.id, 1.0, NOW() - INTERVAL '1 hour'
FROM locations l, ingredients i
WHERE l.name = 'Fjellhytta' AND i.name = 'Kikerter';

-- =====================================
-- SHOPPING LIST
-- =====================================
INSERT INTO shopping_list (location_id, ingredient_id, needed_quantity, created_at)
SELECT l.id, i.id, 3.0, NOW() - INTERVAL '50 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Smør';

INSERT INTO shopping_list (location_id, ingredient_id, needed_quantity, created_at)
SELECT l.id, i.id, 5.0, NOW() - INTERVAL '40 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Sandom Retreatsenter' AND i.name = 'Melk';

INSERT INTO shopping_list (location_id, ingredient_id, needed_quantity, created_at)
SELECT l.id, i.id, 2.0, NOW() - INTERVAL '35 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Tomasgården' AND i.name = 'Ost';

INSERT INTO shopping_list (location_id, ingredient_id, needed_quantity, created_at)
SELECT l.id, i.id, 1.5, NOW() - INTERVAL '25 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Fjellhytta' AND i.name = 'Kokosmelk';

INSERT INTO shopping_list (location_id, ingredient_id, needed_quantity, created_at)
SELECT l.id, i.id, 2.0, NOW() - INTERVAL '15 minutes'
FROM locations l, ingredients i
WHERE l.name = 'Fjellhytta' AND i.name = 'Kikerter';

-- =====================================
-- LOGS
-- =====================================
INSERT INTO logs (user_id, action, created_at)
SELECT id, 'Opprettet oppskrift: Pannekaker', NOW() - INTERVAL '20 days'
FROM users WHERE email = 'admin@sandom.no';

INSERT INTO logs (user_id, action, created_at)
SELECT id, 'Oppdaterte lagerbeholdning for Melk på Sandom Retreatsenter', NOW() - INTERVAL '3 hours'
FROM users WHERE email = 'manager@sandom.no';

INSERT INTO logs (user_id, action, created_at)
SELECT id, 'La til Smør i handlelisten', NOW() - INTERVAL '50 minutes'
FROM users WHERE email = 'anna@sandom.no';

INSERT INTO logs (user_id, action, created_at)
SELECT id, 'Så på oppskrift: Ovnsbakt laks', NOW() - INTERVAL '2 hours'
FROM users WHERE email = 'bjorn@sandom.no';

INSERT INTO logs (user_id, action, created_at)
SELECT id, 'Ba om tilgang til Fjellhytta', NOW() - INTERVAL '1 day'
FROM users WHERE email = 'david@sandom.no';

COMMIT;