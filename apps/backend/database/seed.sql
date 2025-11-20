-- Insert categories
INSERT INTO categories (name, slug) VALUES
('Action', 'action'),
('Comédie', 'comedie'),
('Drame', 'drame'),
('Science-Fiction', 'science-fiction'),
('Horreur', 'horreur'),
('Thriller', 'thriller'),
('Romance', 'romance'),
('Animation', 'animation'),
('Documentaire', 'documentaire'),
('Fantastique', 'fantastique')
ON CONFLICT (slug) DO NOTHING;