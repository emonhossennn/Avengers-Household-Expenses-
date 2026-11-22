import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Check, Pencil, X } from "lucide-react";

import { getMembers, updateMemberName } from "../services/memberService";
import { useMember } from "../context/MemberContext";
import { themes } from "../themes/themes";


function CharacterSelection() {
    const { setSelectedMember } = useMember();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Name editing: { memberId, value, saving, error }
    const [editing, setEditing] = useState(null);

    const navigate = useNavigate();
    const inputRef = useRef(null);

    useEffect(() => {
        async function loadMembers() {
            try {
                const data = await getMembers();
                setMembers(data);
            } catch (err) {
                console.error(err);
                setError("Unable to connect to the house server.");
            } finally {
                setLoading(false);
            }
        }

        loadMembers();
    }, []);

    // Focus input when edit opens
    useEffect(() => {
        if (editing) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [editing?.memberId]);

    function handleSelect(member) {
        // Don't navigate if currently editing
        if (editing) return;
        setSelectedMember(member);
        navigate("/dashboard");
    }

    function startEditing(e, member) {
        e.stopPropagation();
        setEditing({
            memberId: member.id,
            value: member.name,
            saving: false,
            error: "",
        });
    }

    function cancelEditing(e) {
        e?.stopPropagation();
        setEditing(null);
    }

    async function saveEditing(e) {
        e?.stopPropagation();
        const trimmed = editing.value.trim();
        if (!trimmed) {
            setEditing((prev) => ({ ...prev, error: "Name can't be empty." }));
            return;
        }

        setEditing((prev) => ({ ...prev, saving: true, error: "" }));

        try {
            const updated = await updateMemberName(editing.memberId, trimmed);
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === editing.memberId ? { ...m, name: updated.name } : m
                )
            );
            setEditing(null);
        } catch (err) {
            console.error("Name update error:", err);
            setEditing((prev) => ({
                ...prev,
                saving: false,
                error: "Failed to save.",
            }));
        }
    }

    if (loading) {
        return (
            <main className="selection-page">
                <div className="loading">
                    Connecting to Avengers HQ...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="selection-page">
                <div className="error-box">
                    <h2>Connection Failed</h2>
                    <p>{error}</p>
                    <small>
                        Make sure Django is running on port 8000.
                    </small>
                </div>
            </main>
        );
    }

    return (
        <main className="selection-page">
            <section className="selection-container">

                <div className="heading">
                    <p className="eyebrow">
                        AVENGERS HOUSE
                    </p>

                    <h1>
                        Choose Your Identity
                    </h1>

                    <p className="subtitle">
                        Four roommates. One house. Zero arguments
                        about who paid the electricity bill.
                    </p>
                </div>

                <div className="member-grid">
                    {members.map((member) => {
                        const theme =
                            themes[member.hero] ||
                            themes.IRON_MAN;

                        const isEditing = editing?.memberId === member.id;

                        return (
                            <motion.button
                                key={member.id}
                                className={`member-card${isEditing ? " member-card--editing" : ""}`}
                                onClick={() => handleSelect(member)}
                                whileHover={isEditing ? {} : { y: -8, scale: 1.02 }}
                                whileTap={isEditing ? {} : { scale: 0.97 }}
                                style={{
                                    "--member-primary": theme.colors.primary,
                                    "--member-secondary": theme.colors.secondary,
                                    "--member-glow": theme.glow,
                                }}
                            >
                                <div className="hero-placeholder">
                                    {getHeroSymbol(member.hero)}
                                </div>

                                <div className="member-info">
                                    <span className="hero-name">
                                        {member.hero_display}
                                    </span>

                                    <AnimatePresence mode="wait">
                                        {isEditing ? (
                                            /* ── Name edit form ── */
                                            <motion.div
                                                key="edit"
                                                className="card-name-edit"
                                                initial={{ opacity: 0, y: 4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -4 }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <input
                                                    ref={inputRef}
                                                    className="card-name-input"
                                                    value={editing.value}
                                                    maxLength={50}
                                                    disabled={editing.saving}
                                                    onChange={(e) =>
                                                        setEditing((prev) => ({
                                                            ...prev,
                                                            value: e.target.value,
                                                        }))
                                                    }
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") saveEditing();
                                                        if (e.key === "Escape") cancelEditing();
                                                    }}
                                                />

                                                <div className="card-name-actions">
                                                    <button
                                                        type="button"
                                                        className="card-name-confirm"
                                                        onClick={saveEditing}
                                                        disabled={editing.saving}
                                                        title="Save"
                                                    >
                                                        <Check size={13} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="card-name-cancel"
                                                        onClick={cancelEditing}
                                                        disabled={editing.saving}
                                                        title="Cancel"
                                                    >
                                                        <X size={13} />
                                                    </button>
                                                </div>

                                                {editing.error && (
                                                    <p className="card-name-error">
                                                        {editing.error}
                                                    </p>
                                                )}
                                            </motion.div>
                                        ) : (
                                            /* ── Normal display ── */
                                            <motion.div
                                                key="display"
                                                className="card-name-display"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <strong>{member.name}</strong>
                                                <button
                                                    type="button"
                                                    className="card-edit-btn"
                                                    onClick={(e) => startEditing(e, member)}
                                                    title="Edit name"
                                                >
                                                    <Pencil size={12} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {!isEditing && (
                                    <div className="enter-label">
                                        ENTER HQ →
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>

            </section>
        </main>
    );
}

function getHeroSymbol(hero) {
    switch (hero) {
        case "IRON_MAN": return "I";
        case "HULK":     return "H";
        case "THOR":     return "T";
        case "CAPTAIN":  return "C";
        default:         return "?";
    }
}

export default CharacterSelection;
