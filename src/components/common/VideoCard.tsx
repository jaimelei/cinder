import { getRelativeDate, getThumbnailUrl } from "../../lib/youtube";
import type { Video } from "../../types";

interface VideoCardProps {
    video: Video;
    onClick?: () => void;
}

export default function VideoCard({
    video,
    onClick,
}: VideoCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="
        group
        overflow-hidden
        rounded-md
        border
        border-charcoal-600
        bg-charcoal-900
        text-left
        shadow-card
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-charcoal-500
        hover:shadow-card-hover
        active:translate-y-0
        active:scale-[0.98]
      "
        >
            <div className="relative overflow-hidden">
                <img
                    src={
                        video.thumbnail_url ||
                        getThumbnailUrl(video.youtube_id, "hq")
                    }
                    alt={video.title}
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = getThumbnailUrl(
                            video.youtube_id,
                            "sd"
                        );
                    }}
                    className="
            aspect-video
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-[1.03]
          "
                />

                {video.duration && (
                    <div
                        className="
              absolute
              bottom-2
              right-2
              rounded
              bg-charcoal-950/80
              px-1.5
              py-0.5
              text-[11px]
              text-ash-50
              backdrop-blur-sm
            "
                    >
                        {video.duration}
                    </div>
                )}
            </div>

            <div className="space-y-2 p-3">
                <h3
                    className="
            line-clamp-2
            text-sm
            text-ash-50
          "
                >
                    {video.title}
                </h3>

                <div
                    className="
            flex
            items-center
            gap-1.5
            text-xs
            text-ash-300
          "
                >
                    <span>{video.channel_name}</span>

                    {video.upload_date && (
                        <>
                            <span>·</span>

                            <span>
                                {getRelativeDate(video.upload_date)}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </button>
    );
}