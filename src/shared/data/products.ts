import { Product } from "@/shared/types/product";

export const products: Product[] = [
  {
    id: "pep-001",
    slug: "bpc-157",
    name: "BPC-157",
    compoundCode: "BPC-157-5",
    category: "recovery-repair",
    description:
      "Body Protection Compound-157, a pentadecapeptide derived from human gastric juice, studied for tissue healing and cytoprotective properties.",
    description_ar:
      "مركّب حماية الجسم-157، ببتيد خماسي عشري مشتق من عصارة المعدة البشرية، يُدرس لخصائصه في شفاء الأنسجة والحماية الخلوية.",
    longDescription:
      "BPC-157 is a synthetic pentadecapeptide consisting of 15 amino acids. It is a partial sequence of body protection compound (BPC) isolated from human gastric juice. Research has demonstrated its potential role in accelerating wound healing, promoting angiogenesis, and protecting organs against various damaging agents. Studies indicate interaction with the nitric oxide system, dopamine system, and growth factor expression pathways.",
    longDescription_ar:
      "BPC-157 هو ببتيد خماسي عشري صناعي يتكون من 15 حمضاً أمينياً. وهو تسلسل جزئي لمركّب حماية الجسم (BPC) المعزول من عصارة المعدة البشرية. أظهرت الأبحاث دوره المحتمل في تسريع التئام الجروح وتعزيز تكوين الأوعية الدموية وحماية الأعضاء من العوامل الضارة المختلفة. تشير الدراسات إلى تفاعله مع نظام أكسيد النيتريك ونظام الدوبامين ومسارات التعبير عن عوامل النمو.",
    purity: 99.2,
    molecularWeight: "1419.53 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Gly-Glu-Pro-Pro-Pro-Gly-Lys-Pro-Ala-Asp-Asp-Ala-Gly-Leu-Val",
    variants: [
      { id: "v-001a", label: "5mg", dosage: "5mg", price: 195, sku: "BPC-5MG", inStock: true },
      { id: "v-001b", label: "10mg", dosage: "10mg", price: 345, sku: "BPC-10MG", inStock: true },
      { id: "v-001c", label: "30mg", dosage: "30mg", price: 890, sku: "BPC-30MG", inStock: false },
    ],
    coaBatchNumber: "COA-BPC157-2024-0891",
    featured: true,
    relatedSlugs: ["tb-500", "ghk-cu", "aod-9604"],
  },
  {
    id: "pep-002",
    slug: "tb-500",
    name: "TB-500",
    compoundCode: "TB4-FRAG",
    category: "recovery-repair",
    description:
      "Thymosin Beta-4 fragment, a 43-amino acid peptide researched for tissue repair, cell migration, and anti-inflammatory activity.",
    description_ar:
      "جزء ثيموسين بيتا-4، ببتيد من 43 حمضاً أمينياً يُبحث لإصلاح الأنسجة وهجرة الخلايا والنشاط المضاد للالتهابات.",
    longDescription:
      "TB-500 is the synthetic version of the naturally occurring peptide Thymosin Beta-4 (Tβ4). It plays a critical role in cell migration, tissue repair, and the regulation of actin—a cell-building protein essential for healing and repair. Research suggests TB-500 promotes wound healing, reduces inflammation, and supports cardiac tissue regeneration.",
    longDescription_ar:
      "TB-500 هو النسخة الصناعية من الببتيد الطبيعي ثيموسين بيتا-4 (Tβ4). يلعب دوراً حاسماً في هجرة الخلايا وإصلاح الأنسجة وتنظيم الأكتين — وهو بروتين بناء الخلايا الأساسي للشفاء والإصلاح. تشير الأبحاث إلى أن TB-500 يعزز التئام الجروح ويقلل الالتهاب ويدعم تجديد أنسجة القلب.",
    purity: 98.7,
    molecularWeight: "4963.44 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Ac-SDKPDMAEIEKFDKSKLKKTETQEKNPLPSKETIEQEKQAGES",
    variants: [
      { id: "v-002a", label: "2mg", dosage: "2mg", price: 175, sku: "TB5-2MG", inStock: true },
      { id: "v-002b", label: "5mg", dosage: "5mg", price: 350, sku: "TB5-5MG", inStock: true },
      { id: "v-002c", label: "10mg", dosage: "10mg", price: 620, sku: "TB5-10MG", inStock: true },
    ],
    coaBatchNumber: "COA-TB500-2024-0742",
    featured: true,
    relatedSlugs: ["bpc-157", "ghk-cu", "aod-9604"],
  },
  {
    id: "pep-003",
    slug: "ipamorelin",
    name: "Ipamorelin",
    compoundCode: "IPA-5",
    category: "growth-hormone",
    description:
      "A selective growth hormone secretagogue and ghrelin receptor agonist with minimal effect on cortisol and prolactin.",
    description_ar:
      "محفّز انتقائي لإفراز هرمون النمو ومُحفّز لمستقبلات الغريلين مع تأثير ضئيل على الكورتيزول والبرولاكتين.",
    longDescription:
      "Ipamorelin is a pentapeptide (Aib-His-D-2Nal-D-Phe-Lys-NH2) that selectively stimulates growth hormone release from the pituitary gland. Unlike other GH secretagogues, it does not significantly elevate ACTH, cortisol, or prolactin levels, making it highly selective. Studies focus on its potential for lean body mass preservation, bone density, and age-related GH decline research.",
    longDescription_ar:
      "إيباموريلين هو ببتيد خماسي يحفّز بشكل انتقائي إفراز هرمون النمو من الغدة النخامية. على عكس محفّزات هرمون النمو الأخرى، لا يرفع بشكل ملحوظ مستويات ACTH أو الكورتيزول أو البرولاكتين، مما يجعله انتقائياً للغاية. تركّز الدراسات على إمكانياته في الحفاظ على الكتلة العضلية وكثافة العظام وأبحاث انخفاض هرمون النمو المرتبط بالعمر.",
    purity: 99.5,
    molecularWeight: "711.85 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Aib-His-D-2Nal-D-Phe-Lys-NH2",
    variants: [
      { id: "v-003a", label: "2mg", dosage: "2mg", price: 150, sku: "IPA-2MG", inStock: true },
      { id: "v-003b", label: "5mg", dosage: "5mg", price: 295, sku: "IPA-5MG", inStock: true },
    ],
    coaBatchNumber: "COA-IPA-2024-1203",
    featured: true,
    relatedSlugs: ["cjc-1295", "sermorelin", "aod-9604"],
  },
  {
    id: "pep-004",
    slug: "cjc-1295",
    name: "CJC-1295 (No DAC)",
    compoundCode: "CJC-MOD",
    category: "growth-hormone",
    description:
      "Modified growth hormone releasing hormone (GHRH) analogue with improved stability and receptor binding affinity.",
    description_ar:
      "نظير معدّل للهرمون المُطلق لهرمون النمو (GHRH) مع ثبات محسّن وقدرة ارتباط أعلى بالمستقبلات.",
    longDescription:
      "CJC-1295 without DAC (Drug Affinity Complex) is a synthetic analogue of GHRH (1-29), also known as Mod GRF (1-29). Four amino acid substitutions enhance its resistance to enzymatic degradation and increase its half-life compared to native GHRH. Research focuses on its synergistic effects when combined with GH secretagogues for growth hormone pulse amplification.",
    longDescription_ar:
      "CJC-1295 بدون DAC هو نظير صناعي لـ GHRH (1-29)، المعروف أيضاً باسم Mod GRF (1-29). أربعة استبدالات في الأحماض الأمينية تعزز مقاومته للتحلل الإنزيمي وتزيد من عمره النصفي مقارنة بـ GHRH الطبيعي. تركّز الأبحاث على تأثيراته التآزرية عند دمجه مع محفّزات هرمون النمو لتضخيم نبضات هرمون النمو.",
    purity: 98.9,
    molecularWeight: "3367.97 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Tyr-D-Ala-Asp-Ala-Ile-Phe-Thr-Gln-Ser-Tyr-Arg-Lys-Val-Leu-Ala-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Leu-Ser-Arg-NH2",
    variants: [
      { id: "v-004a", label: "2mg", dosage: "2mg", price: 165, sku: "CJC-2MG", inStock: true },
      { id: "v-004b", label: "5mg", dosage: "5mg", price: 320, sku: "CJC-5MG", inStock: true },
      { id: "v-004c", label: "10mg", dosage: "10mg", price: 575, sku: "CJC-10MG", inStock: false },
    ],
    coaBatchNumber: "COA-CJC1295-2024-0567",
    featured: false,
    relatedSlugs: ["ipamorelin", "sermorelin", "aod-9604"],
  },
  {
    id: "pep-005",
    slug: "sermorelin",
    name: "Sermorelin",
    compoundCode: "SER-29",
    category: "growth-hormone",
    description:
      "A 29-amino acid analogue of human GHRH that stimulates the synthesis and release of growth hormone.",
    description_ar:
      "نظير من 29 حمضاً أمينياً للهرمون البشري المُطلق لهرمون النمو يحفّز تخليق وإفراز هرمون النمو.",
    longDescription:
      "Sermorelin acetate is a synthetic peptide corresponding to the first 29 amino acids of human GHRH. It retains full biological activity and stimulates GH release via the GHRH receptor on pituitary somatotrophs. Research applications include studies on GH axis regulation, age-related GH decline, and pulsatile secretion patterns.",
    longDescription_ar:
      "سيرموريلين أسيتات هو ببتيد صناعي يقابل أول 29 حمضاً أمينياً من GHRH البشري. يحتفظ بالنشاط البيولوجي الكامل ويحفّز إفراز هرمون النمو عبر مستقبل GHRH على الخلايا الجسدية النخامية. تشمل تطبيقات البحث دراسات تنظيم محور هرمون النمو وانخفاض هرمون النمو المرتبط بالعمر وأنماط الإفراز النبضي.",
    purity: 99.1,
    molecularWeight: "3357.93 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Tyr-Ala-Asp-Ala-Ile-Phe-Thr-Asn-Ser-Tyr-Arg-Lys-Val-Leu-Gly-Gln-Leu-Ser-Ala-Arg-Lys-Leu-Leu-Gln-Asp-Ile-Met-Ser-Arg-NH2",
    variants: [
      { id: "v-005a", label: "2mg", dosage: "2mg", price: 180, sku: "SER-2MG", inStock: true },
      { id: "v-005b", label: "5mg", dosage: "5mg", price: 340, sku: "SER-5MG", inStock: true },
    ],
    coaBatchNumber: "COA-SER-2024-0334",
    featured: false,
    relatedSlugs: ["cjc-1295", "ipamorelin", "aod-9604"],
  },
  {
    id: "pep-006",
    slug: "ghk-cu",
    name: "GHK-Cu",
    compoundCode: "GHK-CU-50",
    category: "recovery-repair",
    description:
      "Copper peptide complex researched for wound healing, collagen synthesis, and gene expression modulation.",
    description_ar:
      "مركّب ببتيد النحاس يُبحث لالتئام الجروح وتخليق الكولاجين وتعديل التعبير الجيني.",
    longDescription:
      "GHK-Cu (glycyl-L-histidyl-L-lysine copper(II)) is a naturally occurring copper complex of the tripeptide GHK. It is present in human plasma, saliva, and urine. Research demonstrates its ability to stimulate collagen synthesis, promote decorin production, increase angiogenesis, and modulate the expression of a large number of human genes—many involved in tissue remodeling and anti-inflammatory responses.",
    longDescription_ar:
      "GHK-Cu (غليسيل-L-هيستيديل-L-ليسين نحاس(II)) هو مركّب نحاسي طبيعي للببتيد الثلاثي GHK. يتواجد في بلازما الدم واللعاب والبول البشري. تُظهر الأبحاث قدرته على تحفيز تخليق الكولاجين وتعزيز إنتاج الديكورين وزيادة تكوين الأوعية الدموية وتعديل التعبير عن عدد كبير من الجينات البشرية — العديد منها مرتبط بإعادة تشكيل الأنسجة والاستجابات المضادة للالتهابات.",
    purity: 98.5,
    molecularWeight: "403.93 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Gly-His-Lys:Cu(II)",
    variants: [
      { id: "v-006a", label: "50mg", dosage: "50mg", price: 220, sku: "GHK-50MG", inStock: true },
      { id: "v-006b", label: "100mg", dosage: "100mg", price: 385, sku: "GHK-100MG", inStock: true },
      { id: "v-006c", label: "200mg", dosage: "200mg", price: 680, sku: "GHK-200MG", inStock: true },
    ],
    coaBatchNumber: "COA-GHKCU-2024-0218",
    featured: true,
    relatedSlugs: ["bpc-157", "tb-500", "epithalon"],
  },
  {
    id: "pep-007",
    slug: "pt-141",
    name: "PT-141 (Bremelanotide)",
    compoundCode: "PT141-BR",
    category: "recovery-repair",
    description:
      "A melanocortin receptor agonist originally developed from Melanotan II, researched for MC3R and MC4R activity.",
    description_ar:
      "مُحفّز لمستقبلات الميلانوكورتين مشتق أصلاً من ميلانوتان II، يُبحث لنشاط MC3R و MC4R.",
    longDescription:
      "PT-141 (Bremelanotide) is a synthetic cyclic heptapeptide analogue of alpha-MSH. It acts as a non-selective agonist at melanocortin receptors MC1R, MC3R, MC4R, and MC5R. Research focuses on its mechanism of action through the central nervous system rather than the vascular system, distinguishing it from other compounds in related research areas.",
    longDescription_ar:
      "PT-141 (بريميلانوتيد) هو ببتيد حلقي سباعي صناعي نظير لألفا-MSH. يعمل كمُحفّز غير انتقائي لمستقبلات الميلانوكورتين MC1R و MC3R و MC4R و MC5R. تركّز الأبحاث على آلية عمله من خلال الجهاز العصبي المركزي بدلاً من الجهاز الوعائي، مما يميّزه عن المركّبات الأخرى في مجالات البحث ذات الصلة.",
    purity: 99.0,
    molecularWeight: "1025.18 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Ac-Nle-cyclo[Asp-His-D-Phe-Arg-Trp-Lys]-OH",
    variants: [
      { id: "v-007a", label: "2mg", dosage: "2mg", price: 195, sku: "PT1-2MG", inStock: true },
      { id: "v-007b", label: "10mg", dosage: "10mg", price: 550, sku: "PT1-10MG", inStock: true },
    ],
    coaBatchNumber: "COA-PT141-2024-0489",
    featured: false,
    relatedSlugs: ["bpc-157", "tb-500", "selank"],
  },
  {
    id: "pep-008",
    slug: "selank",
    name: "Selank",
    compoundCode: "SEL-ANX",
    category: "cognitive-neuro",
    description:
      "A synthetic analogue of the immunomodulatory peptide tuftsin, studied for anxiolytic and nootropic properties.",
    description_ar:
      "نظير صناعي للببتيد المعدّل للمناعة تافتسين، يُدرس لخصائصه المضادة للقلق والمعزّزة للإدراك.",
    longDescription:
      "Selank is a heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro) that is a synthetic analogue of tuftsin with a Pro-Gly-Pro sequence attached. Developed at the Institute of Molecular Genetics of the Russian Academy of Sciences, research suggests it may modulate the expression of brain-derived neurotrophic factor (BDNF), influence IL-6 expression, and interact with GABA-ergic systems.",
    longDescription_ar:
      "سيلانك هو ببتيد سباعي صناعي نظير لتافتسين مع تسلسل Pro-Gly-Pro مُضاف. طُوّر في معهد الوراثة الجزيئية التابع للأكاديمية الروسية للعلوم. تشير الأبحاث إلى أنه قد يُعدّل التعبير عن عامل التغذية العصبية المشتق من الدماغ (BDNF) ويؤثر على التعبير عن IL-6 ويتفاعل مع أنظمة GABA.",
    purity: 98.8,
    molecularWeight: "751.90 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Thr-Lys-Pro-Arg-Pro-Gly-Pro",
    variants: [
      { id: "v-008a", label: "5mg", dosage: "5mg", price: 265, sku: "SEL-5MG", inStock: true },
      { id: "v-008b", label: "10mg", dosage: "10mg", price: 460, sku: "SEL-10MG", inStock: true },
    ],
    coaBatchNumber: "COA-SEL-2024-0923",
    featured: false,
    relatedSlugs: ["semax", "dsip", "epithalon"],
  },
  {
    id: "pep-009",
    slug: "semax",
    name: "Semax",
    compoundCode: "SEM-ACTH",
    category: "cognitive-neuro",
    description:
      "A synthetic peptide derived from ACTH (4-10) fragment, studied for neuroprotective and cognitive-enhancing properties.",
    description_ar:
      "ببتيد صناعي مشتق من جزء ACTH (4-10)، يُدرس لخصائصه الوقائية العصبية والمعزّزة للإدراك.",
    longDescription:
      "Semax is a heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro), a synthetic analogue of the ACTH/MSH(4-10) fragment. Research indicates it may increase BDNF and TrkB expression in the hippocampus and basal forebrain. Studies focus on its potential neuroprotective effects, influence on cerebral circulation, and modulation of neurotransmitter systems including dopaminergic and serotonergic pathways.",
    longDescription_ar:
      "سيماكس هو ببتيد سباعي، نظير صناعي لجزء ACTH/MSH(4-10). تشير الأبحاث إلى أنه قد يزيد التعبير عن BDNF و TrkB في الحُصين والدماغ الأمامي القاعدي. تركّز الدراسات على تأثيراته الوقائية العصبية المحتملة وتأثيره على الدورة الدموية الدماغية وتعديل أنظمة الناقلات العصبية بما في ذلك المسارات الدوبامينية والسيروتونينية.",
    purity: 99.3,
    molecularWeight: "813.93 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Met-Glu-His-Phe-Pro-Gly-Pro",
    variants: [
      { id: "v-009a", label: "5mg", dosage: "5mg", price: 280, sku: "SEM-5MG", inStock: true },
      { id: "v-009b", label: "10mg", dosage: "10mg", price: 495, sku: "SEM-10MG", inStock: false },
    ],
    coaBatchNumber: "COA-SEM-2024-0671",
    featured: false,
    relatedSlugs: ["selank", "dsip", "epithalon"],
  },
  {
    id: "pep-010",
    slug: "epithalon",
    name: "Epithalon (Epitalon)",
    compoundCode: "EPITH-4",
    category: "longevity-cellular",
    description:
      "A tetrapeptide studied for its effects on telomerase activation and pineal gland regulation.",
    description_ar:
      "ببتيد رباعي يُدرس لتأثيراته على تنشيط التيلوميراز وتنظيم الغدة الصنوبرية.",
    longDescription:
      "Epithalon (Ala-Glu-Asp-Gly) is a synthetic tetrapeptide derived from Epithalamin, a polypeptide extract from the pineal gland. Research by Professor Vladimir Khavinson suggests it may activate telomerase, the enzyme responsible for replicating and protecting telomere DNA. Studies investigate its potential role in circadian rhythm regulation, melatonin production, and cellular aging mechanisms.",
    longDescription_ar:
      "إبيثالون (Ala-Glu-Asp-Gly) هو ببتيد رباعي صناعي مشتق من إبيثالامين، مستخلص متعدد الببتيدات من الغدة الصنوبرية. تشير أبحاث البروفيسور فلاديمير خافينسون إلى أنه قد ينشّط التيلوميراز، الإنزيم المسؤول عن تكرار وحماية حمض نووي التيلومير. تبحث الدراسات في دوره المحتمل في تنظيم الإيقاع اليومي وإنتاج الميلاتونين وآليات الشيخوخة الخلوية.",
    purity: 99.4,
    molecularWeight: "390.35 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Ala-Glu-Asp-Gly",
    variants: [
      { id: "v-010a", label: "10mg", dosage: "10mg", price: 210, sku: "EPI-10MG", inStock: true },
      { id: "v-010b", label: "20mg", dosage: "20mg", price: 370, sku: "EPI-20MG", inStock: true },
      { id: "v-010c", label: "50mg", dosage: "50mg", price: 790, sku: "EPI-50MG", inStock: true },
    ],
    coaBatchNumber: "COA-EPITH-2024-0112",
    featured: true,
    relatedSlugs: ["ghk-cu", "dsip", "aod-9604"],
  },
  {
    id: "pep-011",
    slug: "dsip",
    name: "DSIP",
    compoundCode: "DSIP-DLT",
    category: "cognitive-neuro",
    description:
      "Delta sleep-inducing peptide, a neuropeptide researched for sleep architecture modulation and stress adaptation.",
    description_ar:
      "ببتيد محفّز لنوم الدلتا، ببتيد عصبي يُبحث لتعديل بنية النوم والتكيّف مع الإجهاد.",
    longDescription:
      "DSIP (Delta Sleep-Inducing Peptide) is a nonapeptide (Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu) first isolated from rabbit brain tissue during induced sleep states. Research focuses on its effects on sleep architecture (promoting delta wave sleep), stress hormone modulation, and potential thermoregulatory properties. It may also influence LH and GH release patterns.",
    longDescription_ar:
      "DSIP (ببتيد محفّز لنوم الدلتا) هو ببتيد تساعي عُزل أولاً من أنسجة دماغ الأرانب أثناء حالات النوم المُحفّز. تركّز الأبحاث على تأثيراته على بنية النوم (تعزيز نوم موجات الدلتا) وتعديل هرمونات الإجهاد وخصائصه المحتملة في تنظيم الحرارة. قد يؤثر أيضاً على أنماط إفراز LH و GH.",
    purity: 98.6,
    molecularWeight: "848.82 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Trp-Ala-Gly-Gly-Asp-Ala-Ser-Gly-Glu",
    variants: [
      { id: "v-011a", label: "2mg", dosage: "2mg", price: 185, sku: "DSP-2MG", inStock: true },
      { id: "v-011b", label: "5mg", dosage: "5mg", price: 340, sku: "DSP-5MG", inStock: true },
    ],
    coaBatchNumber: "COA-DSIP-2024-0856",
    featured: false,
    relatedSlugs: ["selank", "semax", "epithalon"],
  },
  {
    id: "pep-012",
    slug: "aod-9604",
    name: "AOD-9604",
    compoundCode: "AOD-HGH",
    category: "growth-hormone",
    description:
      "A modified fragment of human growth hormone (hGH 176-191) studied for metabolic pathway research.",
    description_ar:
      "جزء معدّل من هرمون النمو البشري (hGH 176-191) يُدرس لأبحاث المسارات الأيضية.",
    longDescription:
      "AOD-9604 is a synthetic peptide analogue of the C-terminal fragment (amino acids 176-191) of human growth hormone, with an additional tyrosine residue at the N-terminus. Research focuses on its lipolytic activity without the diabetogenic, anti-natriuretic, growth-promoting, or other effects associated with unmodified hGH. Studies investigate its potential effects on fat metabolism and cartilage repair.",
    longDescription_ar:
      "AOD-9604 هو ببتيد صناعي نظير للجزء الطرفي C (الأحماض الأمينية 176-191) من هرمون النمو البشري، مع حمض تيروسين إضافي في الطرف N. تركّز الأبحاث على نشاطه في تحلل الدهون دون التأثيرات السكرية أو المضادة لإدرار الصوديوم أو المعزّزة للنمو المرتبطة بهرمون النمو غير المعدّل. تبحث الدراسات في تأثيراته المحتملة على أيض الدهون وإصلاح الغضاريف.",
    purity: 99.0,
    molecularWeight: "1815.08 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Tyr-Leu-Arg-Ile-Val-Gln-Cys-Arg-Ser-Val-Glu-Gly-Ser-Cys-Gly-Phe",
    variants: [
      { id: "v-012a", label: "2mg", dosage: "2mg", price: 195, sku: "AOD-2MG", inStock: true },
      { id: "v-012b", label: "5mg", dosage: "5mg", price: 365, sku: "AOD-5MG", inStock: true },
      { id: "v-012c", label: "10mg", dosage: "10mg", price: 650, sku: "AOD-10MG", inStock: true },
    ],
    coaBatchNumber: "COA-AOD-2024-0445",
    featured: false,
    relatedSlugs: ["ipamorelin", "cjc-1295", "sermorelin"],
  },
  {
    id: "pep-013",
    slug: "mots-c",
    name: "MOTS-c",
    compoundCode: "MOTS-MT",
    category: "longevity-cellular",
    description:
      "A mitochondrial-derived peptide studied for metabolic homeostasis and exercise mimetic properties.",
    description_ar:
      "ببتيد مشتق من الميتوكوندريا يُدرس للتوازن الأيضي وخصائص محاكاة التمارين.",
    longDescription:
      "MOTS-c (Mitochondrial Open Reading Frame of the Twelve S rRNA Type-c) is a 16-amino acid peptide encoded within the mitochondrial 12S rRNA gene. It is the first mitochondrial-derived peptide shown to have systemic hormonal effects. Research focuses on its role in regulating metabolic homeostasis through the AMPK pathway, skeletal muscle metabolism, and its potential as an exercise mimetic compound.",
    longDescription_ar:
      "MOTS-c هو ببتيد من 16 حمضاً أمينياً مُشفّر ضمن جين 12S rRNA الميتوكوندري. وهو أول ببتيد مشتق من الميتوكوندريا يُظهر تأثيرات هرمونية جهازية. تركّز الأبحاث على دوره في تنظيم التوازن الأيضي عبر مسار AMPK وأيض العضلات الهيكلية وإمكانيته كمركّب محاكٍ للتمارين.",
    purity: 98.4,
    molecularWeight: "2174.67 Da",
    formFactor: "Lyophilized Powder",
    sequence: "Met-Arg-Trp-Gln-Glu-Met-Gly-Tyr-Ile-Phe-Tyr-Pro-Arg-Lys-Leu-Arg",
    variants: [
      { id: "v-013a", label: "5mg", dosage: "5mg", price: 395, sku: "MOT-5MG", inStock: true },
      { id: "v-013b", label: "10mg", dosage: "10mg", price: 695, sku: "MOT-10MG", inStock: false },
    ],
    coaBatchNumber: "COA-MOTS-2024-0178",
    featured: false,
    relatedSlugs: ["epithalon", "ss-31", "aod-9604"],
  },
  {
    id: "pep-014",
    slug: "ss-31",
    name: "SS-31 (Elamipretide)",
    compoundCode: "SS31-EL",
    category: "longevity-cellular",
    description:
      "A mitochondria-targeted tetrapeptide researched for cardiolipin binding and mitochondrial function restoration.",
    description_ar:
      "ببتيد رباعي مستهدف للميتوكوندريا يُبحث لارتباطه بالكارديوليبين واستعادة وظائف الميتوكوندريا.",
    longDescription:
      "SS-31 (D-Arg-Dmt-Lys-Phe-NH2), also known as Elamipretide or Bendavia, is a cell-permeable tetrapeptide that selectively concentrates in mitochondria. It binds to cardiolipin on the inner mitochondrial membrane, stabilizing cytochrome c and optimizing electron transport. Research investigates its potential for restoring mitochondrial function in age-related and disease-related mitochondrial dysfunction.",
    longDescription_ar:
      "SS-31 (D-Arg-Dmt-Lys-Phe-NH2)، المعروف أيضاً باسم إيلاميبريتيد أو بينادافيا، هو ببتيد رباعي قابل للنفاذ عبر الخلايا يتركّز بشكل انتقائي في الميتوكوندريا. يرتبط بالكارديوليبين على الغشاء الداخلي للميتوكوندريا، مما يُثبّت السيتوكروم c ويُحسّن نقل الإلكترونات. تبحث الدراسات في إمكانيته لاستعادة وظائف الميتوكوندريا في الخلل الميتوكوندري المرتبط بالعمر والأمراض.",
    purity: 99.1,
    molecularWeight: "640.77 Da",
    formFactor: "Lyophilized Powder",
    sequence: "D-Arg-Dmt-Lys-Phe-NH2",
    variants: [
      { id: "v-014a", label: "5mg", dosage: "5mg", price: 450, sku: "SS3-5MG", inStock: true },
      { id: "v-014b", label: "10mg", dosage: "10mg", price: 815, sku: "SS3-10MG", inStock: true },
      { id: "v-014c", label: "20mg", dosage: "20mg", price: 950, sku: "SS3-20MG", inStock: false },
    ],
    coaBatchNumber: "COA-SS31-2024-0623",
    featured: true,
    relatedSlugs: ["epithalon", "mots-c", "ghk-cu"],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function getRelatedProducts(product: Product): Product[] {
  return product.relatedSlugs
    .map((slug) => products.find((p) => p.slug === slug))
    .filter((p): p is Product => p !== undefined);
}
