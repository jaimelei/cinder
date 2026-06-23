import { Link } from "react-router-dom";
import type { CollectionMeta } from "../../../types";

interface CollectionCardProps {
    collection: CollectionMeta;
    videoCount?: number;
    index: number;
}

export default function CollectionCard({
    collection,
    videoCount,
    index,
}: CollectionCardProps) {
    return (
        <Link
            to={`/app/${collection.slug}`}
            className="
        group
        relative
        flex
        h-[160px]
        md:h-[200px]
        flex-col
        justify-end
        rounded-md
        border
        border-charcoal-600
        bg-charcoal-900
        p-5
        md:p-7
        shadow-card
        transition-all
        duration-300
        hover:scale-[1.015]
        hover:shadow-card-hover
        active:scale-[0.99]
        animate-drift-up
      "
            style={{
                backgroundImage: `linear-gradient(135deg, transparent 0%, ${collection.glowColor} 100%)`,
                animationDelay: `${index * 80}ms`,
            }}
        >
            <h2 className="font-serif text-[1.375rem] md:text-[1.75rem] font-semibold text-ash-50">
                {collection.name}
            </h2>

            <p className="mt-3 text-[13px] text-ash-200">
                {collection.tagline}
            </p>

            {videoCount !== undefined && (
                <p className="mt-2 text-xs text-ash-300">
                    {videoCount} videos
                </p>
            )}
        </Link>
    );
}