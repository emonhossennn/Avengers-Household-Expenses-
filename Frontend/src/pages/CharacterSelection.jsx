import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { getMembers } from "../services/memberService";
import { useMember } from "../context/MemberContext";
import { themes } from "../themes/themes";


function CharacterSelection() {
    const { setSelectedMember } = useMember();

    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        async function loadMembers() {
            try {
                const data = await getMembers();
                setMembers(data);
            } catch (err) {
                console.error(err);
                setError(
                    "Unable to connect to the house server.",
                );
            } finally {
                setLoading(false);
            }
        }

        loadMembers();
    }, []);

    function handleSelect(member) {
        setSelectedMember(member);

        navigate("/dashboard");
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

                        return (
                            <motion.button
                                key={member.id}
                                className="member-card"
                                onClick={() => handleSelect(member)}
                                whileHover={{
                                    y: -8,
                                    scale: 1.02,
                                }}
                                whileTap={{
                                    scale: 0.97,
                                }}
                                style={{
                                    "--member-primary":
                                        theme.colors.primary,

                                    "--member-secondary":
                                        theme.colors.secondary,

                                    "--member-glow":
                                        theme.glow,
                                }}
                            >
                                <div className="hero-placeholder">
                                    {getHeroSymbol(member.hero)}
                                </div>

                                <div className="member-info">
                                    <span className="hero-name">
                                        {member.hero_display}
                                    </span>

                                    <strong>
                                        {member.name}
                                    </strong>
                                </div>

                                <div className="enter-label">
                                    ENTER HQ →
                                </div>
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
        case "IRON_MAN":
            return "I";

        case "HULK":
            return "H";

        case "THOR":
            return "T";

        case "CAPTAIN":
            return "C";

        default:
            return "?";
    }
}

export default CharacterSelection;