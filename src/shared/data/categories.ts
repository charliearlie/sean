import { Category } from "@/shared/types/product";

export const categories: Category[] = [
  {
    id: "cat-1",
    slug: "growth-hormone",
    name: "Growth Hormone Peptides",
    name_ar: "ببتيدات هرمون النمو",
    description:
      "Research-grade peptides targeting growth hormone secretagogue receptors and GHRH pathways.",
    description_ar:
      "ببتيدات بحثية تستهدف مستقبلات محفّزات هرمون النمو ومسارات GHRH.",
    productCount: 4,
  },
  {
    id: "cat-2",
    slug: "recovery-repair",
    name: "Recovery & Repair",
    name_ar: "التعافي والإصلاح",
    description:
      "Peptides studied for tissue regeneration, wound healing, and cellular repair mechanisms.",
    description_ar:
      "ببتيدات تُدرس لتجديد الأنسجة والتئام الجروح وآليات الإصلاح الخلوي.",
    productCount: 4,
  },
  {
    id: "cat-3",
    slug: "cognitive-neuro",
    name: "Cognitive & Neuropeptides",
    name_ar: "الببتيدات العصبية والإدراكية",
    description:
      "Compounds under investigation for nootropic and neuroprotective applications.",
    description_ar:
      "مركّبات قيد البحث للتطبيقات المعزّزة للإدراك والوقائية العصبية.",
    productCount: 3,
  },
  {
    id: "cat-4",
    slug: "longevity-cellular",
    name: "Longevity & Cellular Health",
    name_ar: "طول العمر والصحة الخلوية",
    description:
      "Peptides researched for telomere biology, cellular senescence, and anti-aging pathways.",
    description_ar:
      "ببتيدات تُبحث لبيولوجيا التيلومير والشيخوخة الخلوية ومسارات مكافحة الشيخوخة.",
    productCount: 3,
  },
];
