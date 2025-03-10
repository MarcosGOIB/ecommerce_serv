
ALTER TABLE products 
ADD COLUMN brand VARCHAR(100),
ADD COLUMN game_type VARCHAR(100);


UPDATE products 
SET brand = CASE 
    WHEN name LIKE '%Ultra Pro%' THEN 'Ultra Pro' 
    ELSE 'Dragon Shield' 
END
WHERE category_id = 2;

UPDATE products 
SET game_type = CASE 
    WHEN name LIKE '%Magic%' THEN 'Magic' 
    WHEN name LIKE '%Yu-Gi-Oh%' THEN 'Yu-Gi-Oh' 
    ELSE 'Pokemon' 
END
WHERE category_id = 1;


UPDATE products 
SET game_type = CASE 
    WHEN name LIKE '%Magic%' OR name LIKE '%Jace%' THEN 'Magic' 
    WHEN name LIKE '%Yu-Gi-Oh%' OR name LIKE '%Blue-Eyes%' THEN 'Yu-Gi-Oh' 
    ELSE 'Pokemon' 
END
WHERE category_id = 3;