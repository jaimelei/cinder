import { useEffect, useState } from "react";
import type { PandoraVideo } from "../types";
import { PANDORA_GROUPS } from "../constants/pandora";
import { getPandoraVideos } from "../lib/pandora-api";

export interface MemberSection {
    member: string | null; // null = group-wide
    videos: PandoraVideo[];
}

export interface GroupSection {
    slug: string;
    name: string;
    members: MemberSection[];
    totalCount: number;
}

export function usePandoraVideos() {
    const [videos, setVideos] = useState<PandoraVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    async function fetchVideos() {
        try {
            setIsLoading(true);
            const data = await getPandoraVideos();
            setVideos(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error("failed to fetch pandora videos"));
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchVideos();
    }, []);

    // Build grouped structure: group → member sections (null first, then alphabetical)
    const groups: GroupSection[] = PANDORA_GROUPS.map((group) => {
        const groupVideos = videos.filter(
            (v) => v.group_tag === group.slug
        );

        // Group-wide (null member)
        const groupWide = groupVideos.filter((v) => v.member_tag === null);

        // Per-member sections, only include members that have videos
        const memberSections: MemberSection[] = group.members
            .map((member) => ({
                member,
                videos: groupVideos.filter((v) => v.member_tag === member),
            }))
            .filter((s) => s.videos.length > 0);

        const sections: MemberSection[] = [];
        if (groupWide.length > 0) {
            sections.push({ member: null, videos: groupWide });
        }
        sections.push(...memberSections);

        return {
            slug: group.slug,
            name: group.name,
            members: sections,
            totalCount: groupVideos.length,
        };
    });

    return { groups, videos, isLoading, error, refetch: fetchVideos };
}
