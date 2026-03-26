-- ============================================================
-- 003_seed_data.sql
-- Seed categories, products, and product variants
-- ============================================================

-- Insert categories
INSERT INTO categories (id, slug, name, description, sort_order) VALUES
  (gen_random_uuid(), 'growth-hormone', 'Growth Hormone Peptides', 'Peptides that stimulate growth hormone release and related pathways.', 1),
  (gen_random_uuid(), 'recovery-repair', 'Recovery & Repair', 'Peptides researched for tissue healing, recovery, and repair mechanisms.', 2),
  (gen_random_uuid(), 'cognitive-neuro', 'Cognitive & Neuropeptides', 'Peptides studied for cognitive enhancement and neuroprotective properties.', 3),
  (gen_random_uuid(), 'longevity-cellular', 'Longevity & Cellular Health', 'Peptides researched for cellular health, longevity, and mitochondrial function.', 4);

-- Insert products using CTEs to reference category IDs
WITH cat AS (
  SELECT id, slug FROM categories
),
inserted_products AS (
  INSERT INTO products (id, slug, name, compound_code, category_id, description, long_description, purity, molecular_weight, form_factor, sequence, coa_batch_number, featured) VALUES
  -- BPC-157
  (gen_random_uuid(), 'bpc-157', 'BPC-157', 'BPC-157-5',
    (SELECT id FROM cat WHERE slug = 'recovery-repair'),
    'Body Protection Compound-157, a pentadecapeptide derived from human gastric juice, studied for tissue healing and cytoprotective properties.',
    'BPC-157 is a synthetic pentadecapeptide consisting of 15 amino acids. It is a partial sequence of body protection compound (BPC) isolated from human gastric juice. Research has demonstrated its potential role in accelerating wound healing, promoting angiogenesis, and protecting organs against various damaging agents. Studies indicate interaction with the nitric oxide system, dopamine system, and growth factor expression pathways.',
    99.2, '1419.53 Da', 'Lyophilized Powder',
    'Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val',
    'COA-BPC157-2024-0891', true),
  -- TB-500
  (gen_random_uuid(), 'tb-500', 'TB-500', 'TB4-FRAG',
    (SELECT id FROM cat WHERE slug = 'recovery-repair'),
    'Thymosin Beta-4 fragment, a 43-amino acid peptide researched for tissue repair, cell migration, and anti-inflammatory activity.',
    'TB-500 is the synthetic version of the naturally occurring peptide Thymosin Beta-4 (T' || chr(946) || '4). It plays a critical role in cell migration, tissue repair, and the regulation of actin' || chr(8212) || 'a cell-building protein essential for healing and repair. Research suggests TB-500 promotes wound healing, reduces inflammation, and supports cardiac tissue regeneration.',
    98.7, '4963.44 Da', 'Lyophilized Powder',
    'Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES',
    'COA-TB500-2024-0742', true),
  -- Ipamorelin
  (gen_random_uuid(), 'ipamorelin', 'Ipamorelin', 'IPA-5',
    (SELECT id FROM cat WHERE slug = 'growth-hormone'),
    'A selective growth hormone secretagogue and ghrelin receptor agonist with minimal effect on cortisol and prolactin.',
    'Ipamorelin is a pentapeptide (Aib-His-D-2Nal-D-Phe-Lys-NH2) that selectively stimulates growth hormone release from the pituitary gland. Unlike other GH secretagogues, it does not significantly elevate ACTH, cortisol, or prolactin levels, making it highly selective. Studies focus on its potential for lean body mass preservation, bone density, and age-related GH decline research.',
    99.5, '711.85 Da', 'Lyophilized Powder',
    'Aib-His-D-2Nal-D-Phe-Lys-NH2',
    'COA-IPA-2024-1203', true),
  -- CJC-1295 (No DAC)
  (gen_random_uuid(), 'cjc-1295', 'CJC-1295 (No DAC)', 'CJC-MOD',
    (SELECT id FROM cat WHERE slug = 'growth-hormone'),
    'Modified growth hormone releasing hormone (GHRH) analogue with improved stability and receptor binding affinity.',
    'CJC-1295 without DAC (Drug Affinity Complex) is a synthetic analogue of GHRH (1-29), also known as Mod GRF (1-29). Four amino acid substitutions enhance its resistance to enzymatic degradation and increase its half-life compared to native GHRH. Research focuses on its synergistic effects when combined with GH secretagogues for growth hormone pulse amplification.',
    98.9, '3367.97 Da', 'Lyophilized Powder',
    'Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2',
    'COA-CJC1295-2024-0567', false),
  -- Sermorelin
  (gen_random_uuid(), 'sermorelin', 'Sermorelin', 'SER-29',
    (SELECT id FROM cat WHERE slug = 'growth-hormone'),
    'A 29-amino acid analogue of human GHRH that stimulates the synthesis and release of growth hormone.',
    'Sermorelin acetate is a synthetic peptide corresponding to the first 29 amino acids of human GHRH. It retains full biological activity and stimulates GH release via the GHRH receptor on pituitary somatotrophs. Research applications include studies on GH axis regulation, age-related GH decline, and pulsatile secretion patterns.',
    99.1, '3357.93 Da', 'Lyophilized Powder',
    'Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-NH2',
    'COA-SER-2024-0334', false),
  -- GHK-Cu
  (gen_random_uuid(), 'ghk-cu', 'GHK-Cu', 'GHK-CU-50',
    (SELECT id FROM cat WHERE slug = 'recovery-repair'),
    'Copper peptide complex researched for wound healing, collagen synthesis, and gene expression modulation.',
    'GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) is a naturally occurring copper complex of the tripeptide GHK. It is present in human plasma, saliva, and urine. Research demonstrates its ability to stimulate collagen synthesis, promote decorin production, increase angiogenesis, and modulate the expression of a large number of human genes' || chr(8212) || 'many involved in tissue remodeling and anti-inflammatory responses.',
    98.5, '403.93 Da', 'Lyophilized Powder',
    'Gly-His-Lys:Cu(II)',
    'COA-GHKCU-2024-0218', true),
  -- PT-141 (Bremelanotide)
  (gen_random_uuid(), 'pt-141', 'PT-141 (Bremelanotide)', 'PT141-BR',
    (SELECT id FROM cat WHERE slug = 'recovery-repair'),
    'A melanocortin receptor agonist originally developed from Melanotan II, researched for MC3R and MC4R activity.',
    'PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide analogue of alpha-MSH. It acts as a non-selective agonist at melanocortin receptors MC1R, MC3R, MC4R, and MC5R. Research focuses on its mechanism of action through the central nervous system rather than the vascular system, distinguishing it from other compounds in related research areas.',
    99.0, '1025.18 Da', 'Lyophilized Powder',
    'Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH',
    'COA-PT141-2024-0489', false),
  -- Selank
  (gen_random_uuid(), 'selank', 'Selank', 'SEL-ANX',
    (SELECT id FROM cat WHERE slug = 'cognitive-neuro'),
    'A synthetic analogue of the immunomodulatory peptide tuftsin, studied for anxiolytic and nootropic properties.',
    'Selank is a heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro) that is a synthetic analogue of tuftsin with a Pro-Gly-Pro sequence attached. Developed at the Institute of Molecular Genetics of the Russian Academy of Sciences, research suggests it may modulate the expression of brain-derived neurotrophic factor (BDNF), influence IL-6 expression, and interact with GABA-ergic systems.',
    98.8, '751.90 Da', 'Lyophilized Powder',
    'Thr-Lys-Pro-Arg-Pro-Gly-Pro',
    'COA-SEL-2024-0923', false),
  -- Semax
  (gen_random_uuid(), 'semax', 'Semax', 'SEM-ACTH',
    (SELECT id FROM cat WHERE slug = 'cognitive-neuro'),
    'A synthetic peptide derived from ACTH (4-10) fragment, studied for neuroprotective and cognitive-enhancing properties.',
    'Semax is a heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro), a synthetic analogue of the ACTH/MSH(4-10) fragment. Research indicates it may increase BDNF and TrkB expression in the hippocampus and basal forebrain. Studies focus on its potential neuroprotective effects, influence on cerebral circulation, and modulation of neurotransmitter systems including dopaminergic and serotonergic pathways.',
    99.3, '813.93 Da', 'Lyophilized Powder',
    'Met-Glu-His-Phe-Pro-Gly-Pro',
    'COA-SEM-2024-0671', false),
  -- Epithalon
  (gen_random_uuid(), 'epithalon', 'Epithalon (Epitalon)', 'EPITH-4',
    (SELECT id FROM cat WHERE slug = 'longevity-cellular'),
    'A tetrapeptide studied for its effects on telomerase activation and pineal gland regulation.',
    'Epithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide derived from Epithalamin, a polypeptide extract from the pineal gland. Research by Professor Vladimir Khavinson suggests it may activate telomerase, the enzyme responsible for replicating and protecting telomere DNA. Studies investigate its potential role in circadian rhythm regulation, melatonin production, and cellular aging mechanisms.',
    99.4, '390.35 Da', 'Lyophilized Powder',
    'Ala-Glu-Asp-Gly',
    'COA-EPITH-2024-0112', true),
  -- DSIP
  (gen_random_uuid(), 'dsip', 'DSIP', 'DSIP-DLT',
    (SELECT id FROM cat WHERE slug = 'cognitive-neuro'),
    'Delta sleep-inducing peptide, a neuropeptide researched for sleep architecture modulation and stress adaptation.',
    'DSIP (Delta Sleep-Inducing Peptide) is a nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) first isolated from rabbit brain tissue during induced sleep states. Research focuses on its effects on sleep architecture (promoting delta wave sleep), stress hormone modulation, and potential thermoregulatory properties. It may also influence LH and GH release patterns.',
    98.6, '848.82 Da', 'Lyophilized Powder',
    'Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu',
    'COA-DSIP-2024-0856', false),
  -- AOD-9604
  (gen_random_uuid(), 'aod-9604', 'AOD-9604', 'AOD-HGH',
    (SELECT id FROM cat WHERE slug = 'growth-hormone'),
    'A modified fragment of human growth hormone (hGH 176-191) studied for metabolic pathway research.',
    'AOD-9604 is a synthetic peptide analogue of the C-terminal fragment (amino acids 176-191) of human growth hormone, with an additional tyrosine residue at the N-terminus. Research focuses on its lipolytic activity without the diabetogenic, anti-natriuretic, growth-promoting, or other effects associated with unmodified hGH. Studies investigate its potential effects on fat metabolism and cartilage repair.',
    99.0, '1815.08 Da', 'Lyophilized Powder',
    'Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe',
    'COA-AOD-2024-0445', false),
  -- MOTS-c
  (gen_random_uuid(), 'mots-c', 'MOTS-c', 'MOTS-MT',
    (SELECT id FROM cat WHERE slug = 'longevity-cellular'),
    'A mitochondrial-derived peptide studied for metabolic homeostasis and exercise mimetic properties.',
    'MOTS-c (Mitochondrial Open Reading Frame of the Twelve S rRNA Type-c) is a 16-amino acid peptide encoded within the mitochondrial 12S rRNA gene. It is the first mitochondrial-derived peptide shown to have systemic hormonal effects. Research focuses on its role in regulating metabolic homeostasis through the AMPK pathway, skeletal muscle metabolism, and its potential as an exercise mimetic compound.',
    98.4, '2174.67 Da', 'Lyophilized Powder',
    'Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg',
    'COA-MOTS-2024-0178', false),
  -- SS-31 (Elamipretide)
  (gen_random_uuid(), 'ss-31', 'SS-31 (Elamipretide)', 'SS31-EL',
    (SELECT id FROM cat WHERE slug = 'longevity-cellular'),
    'A mitochondria-targeted tetrapeptide researched for cardiolipin binding and mitochondrial function restoration.',
    'SS-31 (D-Arg-Dmt-Lys-Phe-NH2), also known as Elamipretide or Bendavia, is a cell-permeable tetrapeptide that selectively concentrates in mitochondria. It binds to cardiolipin on the inner mitochondrial membrane, stabilizing cytochrome c and optimizing electron transport. Research investigates its potential for restoring mitochondrial function in age-related and disease-related mitochondrial dysfunction.',
    99.1, '640.77 Da', 'Lyophilized Powder',
    'D-Arg-Dmt-Lys-Phe-NH2',
    'COA-SS31-2024-0623', true)
  RETURNING id, slug
)
-- Insert product variants
INSERT INTO product_variants (id, product_id, label, dosage, price, sku, stock_quantity) VALUES
  -- BPC-157 variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'bpc-157'), '5mg', '5mg', 195.00, 'BPC-5MG', 20),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'bpc-157'), '10mg', '10mg', 345.00, 'BPC-10MG', 15),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'bpc-157'), '30mg', '30mg', 890.00, 'BPC-30MG', 0),
  -- TB-500 variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'tb-500'), '2mg', '2mg', 175.00, 'TB5-2MG', 25),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'tb-500'), '5mg', '5mg', 350.00, 'TB5-5MG', 18),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'tb-500'), '10mg', '10mg', 620.00, 'TB5-10MG', 12),
  -- Ipamorelin variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ipamorelin'), '2mg', '2mg', 150.00, 'IPA-2MG', 30),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ipamorelin'), '5mg', '5mg', 295.00, 'IPA-5MG', 22),
  -- CJC-1295 variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'cjc-1295'), '2mg', '2mg', 165.00, 'CJC-2MG', 20),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'cjc-1295'), '5mg', '5mg', 320.00, 'CJC-5MG', 14),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'cjc-1295'), '10mg', '10mg', 575.00, 'CJC-10MG', 0),
  -- Sermorelin variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'sermorelin'), '2mg', '2mg', 180.00, 'SER-2MG', 18),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'sermorelin'), '5mg', '5mg', 340.00, 'SER-5MG', 10),
  -- GHK-Cu variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ghk-cu'), '50mg', '50mg', 220.00, 'GHK-50MG', 25),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ghk-cu'), '100mg', '100mg', 385.00, 'GHK-100MG', 16),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ghk-cu'), '200mg', '200mg', 680.00, 'GHK-200MG', 8),
  -- PT-141 variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'pt-141'), '2mg', '2mg', 195.00, 'PT1-2MG', 20),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'pt-141'), '10mg', '10mg', 550.00, 'PT1-10MG', 10),
  -- Selank variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'selank'), '5mg', '5mg', 265.00, 'SEL-5MG', 15),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'selank'), '10mg', '10mg', 460.00, 'SEL-10MG', 8),
  -- Semax variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'semax'), '5mg', '5mg', 280.00, 'SEM-5MG', 12),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'semax'), '10mg', '10mg', 495.00, 'SEM-10MG', 0),
  -- Epithalon variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'epithalon'), '10mg', '10mg', 210.00, 'EPI-10MG', 22),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'epithalon'), '20mg', '20mg', 370.00, 'EPI-20MG', 15),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'epithalon'), '50mg', '50mg', 790.00, 'EPI-50MG', 6),
  -- DSIP variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'dsip'), '2mg', '2mg', 185.00, 'DSP-2MG', 18),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'dsip'), '5mg', '5mg', 340.00, 'DSP-5MG', 10),
  -- AOD-9604 variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'aod-9604'), '2mg', '2mg', 195.00, 'AOD-2MG', 20),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'aod-9604'), '5mg', '5mg', 365.00, 'AOD-5MG', 12),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'aod-9604'), '10mg', '10mg', 650.00, 'AOD-10MG', 8),
  -- MOTS-c variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'mots-c'), '5mg', '5mg', 395.00, 'MOT-5MG', 10),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'mots-c'), '10mg', '10mg', 695.00, 'MOT-10MG', 0),
  -- SS-31 variants
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ss-31'), '5mg', '5mg', 450.00, 'SS3-5MG', 8),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ss-31'), '10mg', '10mg', 815.00, 'SS3-10MG', 5),
  (gen_random_uuid(), (SELECT id FROM inserted_products WHERE slug = 'ss-31'), '20mg', '20mg', 950.00, 'SS3-20MG', 0);
