import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { themes } from "../themes/themes";

const MemberContext = createContext(null);

export function MemberProvider({ children }) {
    const [selectedMember, setSelectedMember] = useState(() => {
        const savedMember = localStorage.getItem("selectedMember");

        if (!savedMember) {
            return null;
        }

        try {
            return JSON.parse(savedMember);
        } catch {
            localStorage.removeItem("selectedMember");
            return null;
        }
    });

    const theme = useMemo(() => {
        if (!selectedMember) {
            return themes.IRON_MAN;
        }

        return (
            themes[selectedMember.hero] ||
            themes.IRON_MAN
        );
    }, [selectedMember]);

    useEffect(() => {
        if (selectedMember) {
            localStorage.setItem(
                "selectedMember",
                JSON.stringify(selectedMember),
            );
        } else {
            localStorage.removeItem("selectedMember");
        }
    }, [selectedMember]);

    return (
        <MemberContext.Provider
            value={{
                selectedMember,
                setSelectedMember,
                theme,
            }}
        >
            {children}
        </MemberContext.Provider>
    );
}

export function useMember() {
    const context = useContext(MemberContext);

    if (!context) {
        throw new Error(
            "useMember must be used inside MemberProvider",
        );
    }

    return context;
}