import { useState } from "react";
import { importPandoraVideos, type ImportPandoraParams } from "../lib/pandora-api";

export function usePandoraImport(onSuccess?: (count: number) => void) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [importedCount, setImportedCount] = useState<number | null>(null);

    async function runImport(params: ImportPandoraParams) {
        setIsLoading(true);
        setError(null);
        setImportedCount(null);

        try {
            const res = await importPandoraVideos(params);
            setImportedCount(res.imported);
            if (onSuccess) {
                onSuccess(res.imported);
            }
            return res;
        } catch (err: any) {
            const message = err instanceof Error ? err.message : "Failed to import";
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }

    function reset() {
        setIsLoading(false);
        setError(null);
        setImportedCount(null);
    }

    return {
        runImport,
        isLoading,
        error,
        importedCount,
        reset,
    };
}
