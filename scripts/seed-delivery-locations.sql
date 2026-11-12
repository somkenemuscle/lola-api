-- Seeds Nigeria's 36 states and the FCT as delivery locations.
-- Run with: npm run db:seed:delivery-locations
--
-- Every location starts switched on with a ₦2,500 fee (250000 kobo); adjust or switch off any in the admin.
-- Safe to re-run: names that already exist (in any case) are skipped, so fees set in the admin are never overwritten.

INSERT INTO delivery_locations (id, name, fee, is_active, created_at, updated_at)
SELECT gen_random_uuid(), seed.name, 250000, true, now(), now()
FROM (
  VALUES
    ('Abia'), ('Abuja (FCT)'), ('Adamawa'), ('Akwa Ibom'), ('Anambra'), ('Bauchi'), ('Bayelsa'),
    ('Benue'), ('Borno'), ('Cross River'), ('Delta'), ('Ebonyi'), ('Edo'), ('Ekiti'), ('Enugu'),
    ('Gombe'), ('Imo'), ('Jigawa'), ('Kaduna'), ('Kano'), ('Katsina'), ('Kebbi'), ('Kogi'),
    ('Kwara'), ('Lagos'), ('Nasarawa'), ('Niger'), ('Ogun'), ('Ondo'), ('Osun'), ('Oyo'),
    ('Plateau'), ('Rivers'), ('Sokoto'), ('Taraba'), ('Yobe'), ('Zamfara')
) AS seed (name)
WHERE NOT EXISTS (
  SELECT 1 FROM delivery_locations existing WHERE lower(existing.name) = lower(seed.name)
);
