-- ============================================================================
-- FINAL PROJECT: System Integration and Architecture
-- Project Title: Local Knowledge Repository – Siargao Island Handicrafts
-- Group: Group 5 (Local Handicrafts and Products)
-- Database Name: siargao_handicrafts_db
--
-- HOW TO IMPORT THIS FILE IN XAMPP / PHPMYADMIN:
-- 1. Open XAMPP Control Panel and start "Apache" and "MySQL".
-- 2. Go to http://localhost/phpmyadmin in your browser.
-- 3. Click the "Import" tab at the top.
-- 4. Choose this file (siargao_handicrafts.sql) and click "Import" / "Go".
-- ============================================================================

CREATE DATABASE IF NOT EXISTS siargao_handicrafts_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE siargao_handicrafts_db;

-- Drop tables if they already exist (for clean re-import)
DROP TABLE IF EXISTS handicrafts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS sources;

-- ============================================================================
-- TABLE 1: categories
-- Stores the classification of local handicrafts
-- ============================================================================
CREATE TABLE categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    category_description VARCHAR(255) NOT NULL
);

INSERT INTO categories (category_id, category_name, category_description) VALUES
(1, 'Woven Headwear & Fans', 'Traditional sun hats, farmer hats (salakot), and hand fans woven from buri, nipa, and bamboo.'),
(2, 'Baskets & Storage', 'Handwoven market totes, winnowing trays (nigo), storage boxes, and hampers.'),
(3, 'Home & Table Decor', 'Decorative rattan orbs, flower wall art, animal sculptures, placemats, and shell lanterns.'),
(4, 'Woodcraft & Traditional Games', 'Carved local hardwood items including traditional Sungka boards and wooden dining ware.'),
(5, 'Traditional Earthenware', 'Locally molded terracotta clay cooking pots (palayok) and clay wood-fired stoves (kalan).');

-- ============================================================================
-- TABLE 2: sources
-- Stores the verified local artisans, market stalls, and field sources in Siargao
-- ============================================================================
CREATE TABLE sources (
    source_id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(150) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    gathering_method VARCHAR(150) NOT NULL,
    verified_by VARCHAR(150) NOT NULL
);

INSERT INTO sources (source_id, source_name, municipality, barangay, gathering_method, verified_by) VALUES
(1, 'Dapa Public Market Native Craft Stall', 'Dapa', 'Poblacion 1', 'Actual Field Photography & Storekeeper Interview', 'Nanay Teresita Gorgonio (Senior Weaver & Stall Owner)'),
(2, 'General Luna Artisan & Souvenir Collective', 'General Luna', 'Poblacion 3', 'Direct Observation, Photography & Price Survey', 'Manong Rolando Escobia (Local Rattan Craftsman)'),
(3, 'Del Carmen Buri & Pandan Weavers Association', 'Del Carmen', 'Poblacion', 'Field Documentation & Weaver Interview', 'Aling Marites Comon (Buri Weaving Coordinator)'),
(4, 'San Isidro Bamboo & Nigo Craft Makers', 'San Isidro', 'Del Pilar', 'On-site Observation & Oral Interview', 'Tatay Ernesto Dulpina (Master Bamboo Weaver)'),
(5, 'Pilar Hardwood & Clay Artisan Workshop', 'Pilar', 'Poblacion', 'Field Visit, Photography & Artisan Verification', 'Mang Roberto Tesiorna (Woodcarver & Potter)');

-- ============================================================================
-- TABLE 3: handicrafts
-- Main table storing the 20 collected handicraft records from Siargao Island
-- Relationships:
--   category_id references categories(category_id)
--   source_id   references sources(source_id)
-- ============================================================================
CREATE TABLE handicrafts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    local_name VARCHAR(150) NOT NULL,
    category_id INT NOT NULL,
    source_id INT NOT NULL,
    category VARCHAR(100) NOT NULL,
    materials VARCHAR(200) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    price_range VARCHAR(50) NOT NULL,
    dimensions VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    cultural_significance TEXT NOT NULL,
    source_reference VARCHAR(255) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    is_from_docx TINYINT(1) DEFAULT 1,
    date_gathered DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_handicraft_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_handicraft_source FOREIGN KEY (source_id) REFERENCES sources(source_id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ============================================================================
-- INSERT 20 AUTHENTIC SIARGAO HANDICRAFT RECORDS
-- Records 1 to 12: Direct items from handicrafts.docx
-- Records 13 to 20: Additional items documented in the same field photographs
-- ============================================================================
INSERT INTO handicrafts (
    id, name, local_name, category_id, source_id, category, materials,
    municipality, price_range, dimensions, description, cultural_significance,
    source_reference, image_url, is_from_docx, date_gathered
) VALUES
(
    1,
    'Buri Hat',
    'Kalo nga Buri (Wide-Brim Sun Hat)',
    1, 3,
    'Woven Headwear & Fans',
    'Dried Buri Palm Strips (Corypha utan) & Abaca Bow',
    'Del Carmen, Siargao',
    'PHP 250 - PHP 380',
    '42 cm diameter x 15 cm crown height',
    'A finely braided wide-brim sun hat crafted from sun-dried buri palm leaves, accented with a large woven burlap-textured abaca ribbon bow. Lightweight, breathable, and durable against tropical coastal heat.',
    'Worn by Siargao locals and island visitors alike for sun protection. Buri weaving provides steady livelihood for women weavers in Del Carmen and Dapa.',
    'Interview & Photography at Dapa Public Market Native Craft Stall (handicrafts.docx Ref #1)',
    'images/01-buri-hat.jpg',
    1,
    '2026-11-10'
),
(
    2,
    'Woven Baskets',
    'Binasket nga Pandan (Checkered Market Tote)',
    2, 1,
    'Baskets & Storage',
    'Dyed & Natural Pandan Leaves with Twined Rattan Handles',
    'Dapa, Siargao',
    'PHP 300 - PHP 550 (per set/size)',
    '38 cm x 28 cm x 18 cm (Large)',
    'Nested rectangular shopping and utility baskets featuring a traditional red, forest green, and natural cream checkered plait pattern, reinforced with sturdy spiral-wrapped double handles.',
    'Used daily by Siargaonon households as eco-friendly market bags (bayong) when buying fresh catch and produce in Dapa Public Market, reducing single-use plastic waste.',
    'Field Observation & Photo Documentation at Dapa Public Market (handicrafts.docx Ref #2)',
    'images/02-woven-baskets.jpg',
    1,
    '2026-11-10'
),
(
    3,
    'Sungka',
    'Sungkaan nga Kahoy (Traditional Mancala Board)',
    4, 5,
    'Woodcraft & Traditional Games',
    'Carved Molave (Tugas) & Mahogany Hardwood with Cowrie Shells',
    'Pilar, Siargao',
    'PHP 850 - PHP 1,400',
    '72 cm length x 16 cm width x 5 cm thickness',
    'Hand-carved solid hardwood game board featuring 14 small scooping pits (bahay) arranged in two rows and 2 large storehouses (ulo) at each end, polished to highlight natural wood grain.',
    'Sungka is a cherished traditional Filipino turn-based strategy game played with sigay (cowrie shells) gathered along Siargao beaches, teaching mental math and patience across generations.',
    'Artisan Interview & Photo Documentation in Dapa / Pilar Craft Display (handicrafts.docx Ref #3)',
    'images/03-sungka.jpg',
    1,
    '2026-11-10'
),
(
    4,
    'Woven Placemat',
    'Sapin sa Pinggan may Sigay (Shell-Trimmed Placemat)',
    3, 2,
    'Home & Table Decor',
    'Braided Buri Midribs (Tingting), Tikog Grass & Natural Cowrie Shells (Sigay)',
    'General Luna, Siargao',
    'PHP 150 - PHP 220 each',
    '35 cm circular diameter',
    'Circular open-weave table placemat crafted in concentric spirals and bordered around the rim with polished white-and-gold cowrie shells harvested from Siargao coastal waters.',
    'Combines terrestrial palm weaving with marine shell craft—a signature aesthetic of Siargao island resorts, cafes, and dining tables.',
    'Direct Store Survey & Photography in General Luna / Dapa (handicrafts.docx Ref #4)',
    'images/04-woven-placemat.jpg',
    1,
    '2026-11-11'
),
(
    5,
    'Native Woven Hats',
    'Salakot nga Kawayan (Conical Farmer & Fisher Hat)',
    1, 4,
    'Woven Headwear & Fans',
    'Split Bamboo Strips (Kawayan), Nipa Leaf Lining & Rattan Brim Ring',
    'San Isidro, Siargao',
    'PHP 180 - PHP 280',
    '40 cm diameter x 22 cm cone height',
    'Traditional conical headgear woven in a tight herringbone twill pattern from split bamboo strips, reinforced with a double rattan rim bound with blue nylon cord and a protective metal tip.',
    'An iconic symbol of rural perseverance in Surigao del Norte, shielding rice farmers in San Isidro and coastal fishermen from both intense tropical sun and sudden rain squalls.',
    'Field Documentation & Weaver Interview, San Isidro / Dapa (handicrafts.docx Ref #5)',
    'images/05-native-woven-hats.jpg',
    1,
    '2026-11-11'
),
(
    6,
    'Native Woven Hand Fan',
    'Paypay / Abaniko nga Buri',
    1, 3,
    'Woven Headwear & Fans',
    'Natural & Dyed Buri Palm Fronds with Bamboo Handle',
    'Del Carmen, Siargao',
    'PHP 60 - PHP 120',
    '30 cm x 26 cm blade with 12 cm handle',
    'Handwoven Spade- and round-shaped fans available in both natural sun-bleached palm tones and vibrant magenta, yellow, and green dyed patterns.',
    'A staple household item in island homes and churches during warm afternoons, and a popular, affordable souvenir for tourists visiting Siargao.',
    'Field Photography & Stall Interview at Dapa Craft Market (handicrafts.docx Ref #6)',
    'images/06-native-woven-hand-fan.jpg',
    1,
    '2026-11-11'
),
(
    7,
    'Woven Rattan Decorative Ball',
    'Bola nga Uway (Rattan Orb Pendant / Accent)',
    3, 2,
    'Home & Table Decor',
    'Wild Rattan Vines (Uway), Bakhaw Twigs & Bamboo Frame',
    'General Luna, Siargao',
    'PHP 350 - PHP 600',
    '28 cm sphere diameter',
    'A spherical decorative orb constructed over a split-bamboo grid and intricately coiled with dark natural rattan vines, complete with a top hanging loop for pendant lighting or shelf styling.',
    'Widely used in Siargao eco-resorts and boutique villas as warm ambient pendant lampshades that cast organic woven shadows.',
    'Direct Observation & Photography at Siargao Native Handicraft Store (handicrafts.docx Ref #7)',
    'images/07-woven-rattan-ball.jpg',
    1,
    '2026-11-12'
),
(
    8,
    'Native Rattan Flower Decor',
    'Bulak nga Uway (Floral Rattan Wall & Charger Art)',
    3, 2,
    'Home & Table Decor',
    'Steamed & Bent Rattan Peel (Uway) and Wicker Core',
    'General Luna, Siargao',
    'PHP 280 - PHP 450',
    '42 cm outer petal diameter',
    'Hand-bent rattan wall hanging and decorative charger shaped like a blooming tropical flower with layered looped petals radiating from a tightly woven circular center.',
    'Showcases the high skill of local rattan benders who steam and curve tough forest vines into delicate floral geometry without nails or synthetic glue.',
    'Field Survey & Price Tag Verification (PHP 280 tag visible) (handicrafts.docx Ref #8)',
    'images/08-rattan-flower-decor.jpg',
    1,
    '2026-11-12'
),
(
    9,
    'Native Woven Storage Baskets',
    'Kahon nga Pandan (Square Woven Tissue & Utility Box)',
    2, 3,
    'Baskets & Storage',
    'Thick Dried Pandan & Buri Strips over Bamboo Framing',
    'Del Carmen, Siargao',
    'PHP 180 - PHP 260',
    '20 cm x 20 cm x 14 cm',
    'Square lidded organizer and tissue holder baskets woven with wide vertical pandan ribbons and braided trim around a central square top opening.',
    'Demonstrates how traditional mat-weaving techniques are adapted into modern functional organizers for local homestays, hotels, and residences.',
    'Field Photography & Documentation at Native Craft Center (handicrafts.docx Ref #9)',
    'images/09-woven-storage-baskets.jpg',
    1,
    '2026-11-12'
),
(
    10,
    'Native Woven Animal-Shaped Bags',
    'Basket nga Porma Pato/Langgam (Duck-Shaped Rattan Basket)',
    2, 2,
    'Baskets & Storage',
    'Two-Tone Natural & Dark-Stained Rattan Wicker',
    'General Luna, Siargao',
    'PHP 450 - PHP 750',
    '36 cm length x 22 cm width x 34 cm height',
    'Whimsical novelty basket and shoulder bag handwoven in the silhouette of a native duck or waterbird, complete with a long woven beak, button eyes, arched handle, and hollow storage body.',
    'Inspired by the rich wetland birdlife of Siargao and Del Carmen mangroves, blending playful folk sculpture with practical basketry.',
    'Actual Field Photography & Artisan Interview (handicrafts.docx Ref #10)',
    'images/10-animal-shaped-bags.jpg',
    1,
    '2026-11-12'
),
(
    11,
    'Nigo Basket',
    'Nigo / Bilao (Woven Bamboo Winnowing Tray)',
    2, 4,
    'Baskets & Storage',
    'Finely Split Bamboo Slats, Rattan Rim & Red/Yellow Binding Cord',
    'San Isidro, Siargao',
    'PHP 160 - PHP 320',
    '45 cm to 55 cm diameter (Assorted Sizes)',
    'Flat circular and oval trays woven in a tight sawali pattern from cured bamboo strips, bound along the raised edge with stiff rattan framing and colorful nylon lashing.',
    'Essential in Siargao agriculture for winnowing rice chaff (tahop), sun-drying fish or cacao beans, and serving boodle fight feasts and native kakanin.',
    'Field Observation & Artisan Verification in Dapa / San Isidro (handicrafts.docx Ref #11)',
    'images/11-nigo-basket.jpg',
    1,
    '2026-11-13'
),
(
    12,
    'Native Woven Deer Decoration',
    'Usa nga Uway (Standing Vine & Rattan Deer Sculpture)',
    3, 2,
    'Home & Table Decor',
    'Twisted Forest Vines (Balinghoy/Uway), Rattan Strips & Wire Armature',
    'General Luna, Siargao',
    'PHP 1,200 - PHP 2,500',
    '95 cm height x 55 cm length x 25 cm width',
    'Life-like standing deer figure sculpted from bundled and interwoven natural woody vines and rattan strips, featuring tall branching antlers and a sturdy four-legged stance.',
    'Popular seasonal and year-round rustic garden or lobby sculpture crafted from pruned forest vines and driftwood twigs.',
    'Original Field Photography & Store Interview (handicrafts.docx Ref #12)',
    'images/12-woven-deer-decor.jpg',
    1,
    '2026-11-13'
),
(
    13,
    'Hand-Carved Wooden Bowls & Plates',
    'Yahong ug Plato nga Kahoy (Hardwood Dinnerware)',
    4, 5,
    'Woodcraft & Traditional Games',
    'Seasoned Acacia & Molave Hardwood with Food-Safe Oil Finish',
    'Pilar, Siargao',
    'PHP 180 - PHP 450 per piece',
    '25 cm plate diameter / 16 cm bowl diameter',
    'Smoothly lathe-turned and hand-sanded wooden dinner plates, salad bowls, and square serving trays showcasing rich dark chocolate and golden heartwood grain.',
    'Sought after by Siargao island restaurants and smoothie bowl cafes for durable, eco-conscious tropical table presentation.',
    'Documented in Original Field Photograph #7 (Right Table Display)',
    'images/13-wooden-bowls-plates.jpg',
    0,
    '2026-11-13'
),
(
    14,
    'White Woven Pandan Bayong Tote',
    'Puti nga Bayong (Bleached Pandan Market Bag)',
    2, 3,
    'Baskets & Storage',
    'Sun-Bleached Pandan Strips with Rolled Braided Handles',
    'Del Carmen, Siargao',
    'PHP 220 - PHP 350',
    '36 cm x 30 cm x 14 cm',
    'Clean, minimalist white-cream woven tote bags featuring a supple diagonal check weave and comfortable tubular braided handles.',
    'Favored as both a beach tote and church/market bag; the natural pandan leaves are boiled, sun-bleached, and flattened with a wooden roller (ilohan) before weaving.',
    'Documented in Original Field Photograph #11 (Left Display Rack)',
    'images/14-white-pandan-bayong.jpg',
    0,
    '2026-11-13'
),
(
    15,
    'Striped Woven Bamboo Planter Basket',
    'Kaing / Paso nga Kawayan (Conical Rattan-Trimmed Basket)',
    2, 4,
    'Baskets & Storage',
    'Split Bamboo Weave with Dark Smoked Rattan Stripes',
    'San Isidro, Siargao',
    'PHP 280 - PHP 420',
    '34 cm top diameter x 30 cm height',
    'Deep round utility and indoor planter basket woven with horizontal dark-stained bamboo bands and a reinforced black-and-tan whip-stitched rim.',
    'Traditionally used as a harvest kaing for root crops and coconuts, now widely repurposed as decorative indoor plant covers.',
    'Documented in Original Field Photograph #10 (Bottom Shelf of Wooden Rack)',
    'images/15-bamboo-planter-basket.jpg',
    0,
    '2026-11-14'
),
(
    16,
    'Polka-Dot Ribbon Buri Sun Hat',
    'Kalo nga Buri may Laso (High-Crown Resort Hat)',
    1, 3,
    'Woven Headwear & Fans',
    'Coarse-Weave Buri Palm Straw & Brown Polka-Dot Fabric Band',
    'Del Carmen, Siargao',
    'PHP 220 - PHP 320',
    '38 cm diameter x 16 cm crown height',
    'A classic dome-crowned buri straw hat trimmed with a matching brown-and-white polka-dot ribbon bow and bound edge seam to prevent fraying.',
    'Blends traditional open-cane buri weaving with playful fabric trimmings for island travelers and local festival-goers.',
    'Documented in Original Field Photograph #1 (Upper Display Hat)',
    'images/16-polkadot-buri-hat.jpg',
    0,
    '2026-11-14'
),
(
    17,
    'Capiz Shell Decorative Globe Lantern',
    'Bola nga Capiz (Windowpane Oyster Shell Lamp)',
    3, 1,
    'Home & Table Decor',
    'Translucent Capiz Shells (Placuna placenta) & Brass/Wire Frame',
    'Dapa, Siargao',
    'PHP 480 - PHP 750',
    '30 cm globe diameter',
    'Spherical hanging lantern assembled from rectangular panes of natural pearlescent capiz shells soldered into a geometric globe.',
    'Celebrates Philippine coastal shellcraft; when lit from within, the translucent shells diffuse a warm mother-of-pearl glow.',
    'Documented in Original Field Photograph #2 (Lower Right Shelf)',
    'images/17-capiz-globe-lantern.jpg',
    0,
    '2026-11-14'
),
(
    18,
    'Traditional Clay Palayok Cooking Pots',
    'Kulon / Palayok (Terracotta Earthenware Pot)',
    5, 5,
    'Traditional Earthenware',
    'Fired Natural Red River Clay & Fine Sand Temper',
    'Pilar, Siargao',
    'PHP 120 - PHP 250',
    '20 cm diameter x 16 cm height with lid',
    'Hand-molded unglazed red terracotta cooking pots with matching clay lids, kiln- or open-pit fired for slow simmering.',
    'Used by Siargaonon families for cooking traditional fish sinigang, inun-unan, and herbal decoctions, imparting a distinct earthy flavor.',
    'Documented in Original Field Photograph #9 (Back Left Wooden Shelf)',
    'images/18-clay-palayok-pots.jpg',
    0,
    '2026-11-14'
),
(
    19,
    'Traditional Clay Kalan Stove',
    'Sugangan / Kalan nga Yuta (Wood & Charcoal Clay Stove)',
    5, 5,
    'Traditional Earthenware',
    'Thick Molded Fire-Clay & Ash-Sand Mixture',
    'Pilar, Siargao',
    'PHP 250 - PHP 400',
    '32 cm top diameter x 24 cm height',
    'Heavy-duty portable terracotta stove featuring a wide fuel chamber opening for firewood or coconut shells and three raised pot rests on the rim.',
    'An enduring, energy-resilient cooking tool in island households, utilizing abundant dried coconut husks (bunot) and shells (bagol) as fuel.',
    'Documented in Original Field Photograph #7 (Lower Right Floor Display)',
    'images/19-clay-kalan-stove.jpg',
    0,
    '2026-11-14'
),
(
    20,
    'Tall Woven Rattan Laundry Hamper',
    'Bukag / Dakong Basket nga Uway (Lidded Cylinder Hamper)',
    2, 4,
    'Baskets & Storage',
    'Split Rattan Cane, Bamboo Staves & Woven Flat Lid',
    'San Isidro, Siargao',
    'PHP 950 - PHP 1,600',
    '45 cm diameter x 65 cm height',
    'Large cylindrical storage hamper woven in a sturdy stake-and-strand pattern with decorative dark rattan waist bands and a fitted flat cover.',
    'Used in homes and island resorts for storing linens, blankets, or bulk dry goods while keeping contents ventilated in humid coastal air.',
    'Documented in Original Field Photograph #11 (Back Right Display)',
    'images/20-woven-laundry-hamper.jpg',
    0,
    '2026-11-14'
);
