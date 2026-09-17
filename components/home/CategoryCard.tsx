import Image from "next/image";
import Link from "next/link";
import beauty from "@/public/categories/beauty-salon.jpg";
import education from "@/public/categories/education.jpg";
import fitness from "@/public/categories/fitness.jpg";
import hair from "@/public/categories/hair-salon.jpg";
import medical from "@/public/categories/medical-clinic.jpg";
import other from "@/public/categories/other-businesses.jpg";
import photography from "@/public/categories/photography.jpg";
import wellness from "@/public/categories/wellness-spa.jpg";

// Match database names to the existing assets, ignoring punctuation and spacing.
const images = {
  "beauty-salon": beauty,
  education,
  fitness,
  "hair-salon": hair,
  "medical-clinic": medical,
  other,
  photography,
  "wellness-spa": wellness,
};

export default function CategoryCard({ category }: { category: { id: string; name: string } }) {
  const key = category.name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const photo = images[key as keyof typeof images];

  return (
    <Link href={`/businesses?category=${encodeURIComponent(category.id)}`}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-colors hover:border-indigo-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-500">
      <div className="relative aspect-[16/9] overflow-hidden bg-[#FFF4E1]">
        {photo && <Image src={photo} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="object-cover" />}
      </div>
      <div className="flex items-center justify-between gap-2 px-4 py-3.5">
        <span className="text-sm font-medium text-gray-900">{category.name}</span>
        <span aria-hidden="true" className="text-gray-400 group-hover:text-indigo-600">↗</span>
      </div>
    </Link>
  );
}
