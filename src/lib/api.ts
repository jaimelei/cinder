import { supabase } from "./supabase";
import type { Collection } from "../types";

export async function getCollections(): Promise<Collection[]> {
    const { data, error } = await supabase
        .from("collections")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) {
        throw error;
    }

    return data ?? [];
}