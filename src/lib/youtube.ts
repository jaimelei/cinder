// YouTube embed URL
export function getEmbedUrl(youtubeId: string): string {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

// YouTube thumbnail URL
export function getThumbnailUrl(
    youtubeId: string,
    quality: "default" | "mq" | "hq" | "sd" | "maxres" = "hq"
): string {
    const qualityMap = {
        default: "default",
        mq: "mqdefault",
        hq: "hqdefault",
        sd: "sddefault",
        maxres: "maxresdefault",
    };

    return `https://i.ytimg.com/vi/${youtubeId}/${qualityMap[quality]}.jpg`;
}

// Parse ISO duration (PT1H2M3S → 1:02:03)
export function formatDuration(iso: string | null): string {
    if (!iso) return "";

    const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) return "";

    const h = parseInt(match[1] || "0");
    const m = parseInt(match[2] || "0");
    const s = parseInt(match[3] || "0");

    if (h > 0) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    return `${m}:${String(s).padStart(2, "0")}`;
}

// Relative date
export function getRelativeDate(dateString: string | null): string {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return `${Math.floor(diffDays / 365)} years ago`;
}