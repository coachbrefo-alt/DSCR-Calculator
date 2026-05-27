import Link from "next/link";

interface Props {
  name: string;
  code: string;
  slug: string;
}

export default function StateCard({ name, code, slug }: Props) {
  return (
    <Link
      href={`/${slug}`}
      className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group cursor-pointer"
    >
      <span className="text-xl font-bold text-blue-800 group-hover:text-blue-600 transition-colors">
        {code}
      </span>
      <span className="text-[10px] text-gray-500 mt-1 text-center leading-tight">{name}</span>
    </Link>
  );
}
