import { Link, useNavigate } from "react-router-dom";
import { useFocusable } from "@noriginmedia/norigin-spatial-navigation";
import type { CollectionMeta } from "../../../types";

interface CollectionCardProps {
    collection: CollectionMeta;
    videoCount?: number;
    index: number;
    focusKey?: string;
}

export default function CollectionCard({
    collection,
    videoCount,
    focusKey,
}: CollectionCardProps) {
    const navigate = useNavigate();
    const { ref, focused } = useFocusable({
        focusKey,
        onEnterPress: () => {
            navigate(`/app/${collection.slug}`);
        }
    });

    return (
        <Link
            ref={ref}
            to={`/app/${collection.slug}`}
            className={`
                group
                relative
                flex
                h-[160px]
                md:h-[200px]
                flex-col
                justify-end
                rounded-md
                border
                bg-charcoal-900
                p-5
                md:p-7
                shadow-card
                transition-all
                duration-300
                animate-drift-up
                outline-none
                ${focused
                    ? "border-ember-500 ring-2 ring-ember-500/50 shadow-ember-glow scale-[1.015]"
                    : "border-charcoal-600 hover:scale-[1.015] hover:shadow-card-hover active:scale-[0.99]"
                }
            `}
            style={{
                backgroundImage: `linear-gradient(135deg, transparent 0%, ${collection.glowColor} 100%)`,
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