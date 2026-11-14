import { useState, useEffect } from "react";
import { PANDORA_GROUPS } from "../../../constants/pandora";
import { usePandoraImport } from "../../../hooks/usePandoraImport";

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: (count: number) => void;
}

export default function ImportModal({
    isOpen,
    onClose,
    onImportSuccess,
}: ImportModalProps) {
    const [url, setUrl] = useState("");
    const [selectedGroup, setSelectedGroup] = useState<string>(
        PANDORA_GROUPS[0]?.slug || "illit"
    );
    const [selectedMember, setSelectedMember] = useState<string>("");

    const { runImport, isLoading, error, importedCount, reset } =
        usePandoraImport(onImportSuccess);

    // Reset member selection when selected group changes
    function handleGroupChange(newGroup: string) {
        setSelectedGroup(newGroup);
        setSelectedMember("");
    }

    // Reset state on open/close
    useEffect(() => {
        if (!isOpen) {
            setUrl("");
            setSelectedMember("");
            reset();
        }
    }, [isOpen]);

    // Handle Escape key
    useEffect(() => {
        if (!isOpen) return;

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && !isLoading) {
                onClose();
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, isLoading, onClose]);

    if (!isOpen) return null;

    const currentGroup = PANDORA_GROUPS.find((g) => g.slug === selectedGroup);
    const availableMembers = currentGroup?.members ?? [];

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!url.trim() || isLoading) return;

        try {
            await runImport({
                url: url.trim(),
                groupTag: selectedGroup,
                memberTag: selectedMember.trim() ? selectedMember.trim() : null,
            });
            setUrl("");
        } catch {
            // Error is handled in hook state
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-charcoal-950/80 backdrop-blur-sm transition-opacity"
                onClick={() => {
                    if (!isLoading) onClose();
                }}
            />

            {/* Modal Dialog */}
            <div
                className="relative w-full max-w-md rounded-md border border-charcoal-600 bg-charcoal-900 p-6 shadow-modal animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-baseline justify-between mb-6">
                    <h2 className="font-serif text-xl text-ash-50">
                        import to pandora
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="text-xs text-ash-400 hover:text-ash-100 transition-colors disabled:opacity-50"
                    >
                        close [esc]
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* YouTube URL input */}
                    <div>
                        <label className="block text-xs text-ash-300 mb-1.5">
                            youtube video or playlist url
                        </label>
                        <input
                            type="text"
                            placeholder="https://www.youtube.com/watch?v=... or playlist url"
                            value={url}
                            disabled={isLoading}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                            className="
                                w-full
                                rounded-sm
                                border
                                border-charcoal-600
                                bg-charcoal-800/80
                                px-3.5
                                py-2.5
                                font-sans
                                text-sm
                                text-ash-50
                                placeholder:text-ash-400
                                focus:border-ember-500
                                focus:shadow-ember-glow
                                focus:outline-none
                                transition-all
                                disabled:opacity-50
                            "
                        />
                    </div>

                    {/* Group Selection */}
                    <div>
                        <label className="block text-xs text-ash-300 mb-1.5">
                            group
                        </label>
                        <select
                            value={selectedGroup}
                            disabled={isLoading}
                            onChange={(e) => handleGroupChange(e.target.value)}
                            className="
                                w-full
                                rounded-sm
                                border
                                border-charcoal-600
                                bg-charcoal-800/80
                                px-3
                                py-2.5
                                font-sans
                                text-sm
                                text-ash-50
                                focus:border-ember-500
                                focus:shadow-ember-glow
                                focus:outline-none
                                transition-all
                                disabled:opacity-50
                            "
                        >
                            {PANDORA_GROUPS.map((group) => (
                                <option key={group.slug} value={group.slug}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Member Selection */}
                    <div>
                        <label className="block text-xs text-ash-300 mb-1.5">
                            member <span className="text-ash-400">(optional / group-wide if empty)</span>
                        </label>
                        <select
                            value={selectedMember}
                            disabled={isLoading}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="
                                w-full
                                rounded-sm
                                border
                                border-charcoal-600
                                bg-charcoal-800/80
                                px-3
                                py-2.5
                                font-sans
                                text-sm
                                text-ash-50
                                focus:border-ember-500
                                focus:shadow-ember-glow
                                focus:outline-none
                                transition-all
                                disabled:opacity-50
                            "
                        >
                            <option value="">— (multiple members / group-wide)</option>
                            {availableMembers.map((member) => (
                                <option key={member} value={member}>
                                    {member}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Feedback */}
                    {error && (
                        <p className="text-xs text-red-400 animate-fade-in pt-1">
                            {error}
                        </p>
                    )}

                    {importedCount !== null && (
                        <p className="text-xs text-ember-400 animate-fade-in pt-1">
                            successfully imported {importedCount} video{importedCount === 1 ? "" : "s"}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="pt-2 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-3.5 py-1.5 text-xs text-ash-300 hover:text-ash-100 transition-colors disabled:opacity-50"
                        >
                            cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isLoading || !url.trim()}
                            className="
                                rounded-sm
                                border
                                border-ember-500/80
                                bg-ember-500/10
                                px-4
                                py-1.5
                                font-sans
                                text-xs
                                font-medium
                                text-ember-300
                                hover:bg-ember-500/20
                                hover:border-ember-400
                                hover:text-ember-200
                                active:scale-[0.98]
                                transition-all
                                disabled:opacity-40
                                disabled:pointer-events-none
                            "
                        >
                            {isLoading ? "importing..." : "import"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
