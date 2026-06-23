import type { Collection } from "../../../types";

interface CollectionHeaderProps {
    collection: Collection;
}

export default function CollectionHeader({
    collection,
}: CollectionHeaderProps) {
    return (
        <header className="mb-10 animate-drift-up">
            <h1
                className="
          font-serif
          text-3xl
          text-ash-50
          md:text-4xl
        "
            >
                {collection.name}
            </h1>

            {collection.description && (
                <p
                    className="
            mt-3
            max-w-xl
            text-sm
            text-ash-300
          "
                >
                    {collection.description}
                </p>
            )}

            <p
                className="
          mt-4
          text-xs
          tracking-wide
          text-ash-400
        "
            >
                {collection.video_count} videos
            </p>
        </header>
    );
}