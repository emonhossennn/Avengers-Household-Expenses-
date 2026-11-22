import { useEffect, useState } from "react";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { getMealCounts, setMealCount } from "../services/memberService";
import { themes } from "../themes/themes";

function formatMoney(amount) {
    const number = Number(amount || 0);
    return `৳${number.toLocaleString("en-BD", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}

function MealCounter({ year, month, members, groceryTotal }) {
    const [mealData, setMealData] = useState({});
    const [saving, setSaving] = useState({});
    const [error, setError] = useState("");

    // Load meal counts from backend
    useEffect(() => {
        if (!year || !month) return;

        async function fetchMeals() {
            try {
                const data = await getMealCounts(year, month);
                const map = {};
                data.forEach((item) => {
                    map[item.member_id] = item.meals;
                });
                setMealData(map);
            } catch (err) {
                console.error("Failed to fetch meal counts:", err);
            }
        }

        fetchMeals();
    }, [year, month]);

    async function changeMeal(memberId, delta) {
        const current = mealData[memberId] || 0;
        const newValue = Math.max(0, current + delta);

        setMealData((prev) => ({ ...prev, [memberId]: newValue }));
        setSaving((prev) => ({ ...prev, [memberId]: true }));
        setError("");

        try {
            await setMealCount(memberId, year, month, newValue);
        } catch (err) {
            console.error("Failed to save meal count:", err);
            setError("Failed to save. Try again.");
            // revert
            setMealData((prev) => ({ ...prev, [memberId]: current }));
        } finally {
            setSaving((prev) => ({ ...prev, [memberId]: false }));
        }
    }

    const totalMeals = Object.values(mealData).reduce(
        (sum, m) => sum + (m || 0),
        0
    );

    const perMealCost =
        totalMeals > 0 ? Number(groceryTotal) / totalMeals : 0;

    return (
        <section className="dashboard-section">
            <div className="section-heading">
                <div>
                    <p className="eyebrow">🍽️ MEAL TRACKER</p>
                    <h2>Meal Counter</h2>
                    <p className="section-description">
                        Track each member's meals this month. Grocery cost is
                        split by meals eaten.
                    </p>
                </div>
            </div>

            {/* Summary row */}
            <div className="meal-summary-bar">
                <div className="meal-stat">
                    <span>Total Grocery</span>
                    <strong>{formatMoney(groceryTotal)}</strong>
                </div>
                <div className="meal-stat">
                    <span>Total Meals</span>
                    <strong>{totalMeals}</strong>
                </div>
                <div className="meal-stat highlight">
                    <span>Per Meal Cost</span>
                    <strong>{perMealCost > 0 ? formatMoney(perMealCost.toFixed(2)) : "—"}</strong>
                </div>
            </div>

            {error && <div className="form-error">{error}</div>}

            <div className="meal-grid">
                {members.map((member) => {
                    const meals = mealData[member.member_id] || 0;
                    const theme = themes[member.hero] || themes.IRON_MAN;
                    const groceryPaid = Number(member.grocery_paid || 0);
                    const mealShare = perMealCost * meals;
                    const mealBalance = groceryPaid - mealShare;

                    return (
                        <div
                            className="meal-card"
                            key={member.member_id}
                            style={{
                                "--card-primary": theme.colors.primary,
                                "--card-glow": theme.glow,
                            }}
                        >
                            <div className="meal-card-top">
                                <div className="member-avatar">
                                    {member.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <span className="meal-hero">{member.hero}</span>
                                    <h3>{member.name}</h3>
                                </div>
                            </div>

                            {/* Meal counter controls */}
                            <div className="meal-counter-controls">
                                <button
                                    type="button"
                                    className="meal-btn"
                                    onClick={() => changeMeal(member.member_id, -1)}
                                    disabled={meals === 0 || saving[member.member_id]}
                                    aria-label="Remove meal"
                                >
                                    <Minus size={16} />
                                </button>

                                <div className="meal-count-display">
                                    <UtensilsCrossed size={14} />
                                    <span className="meal-number">{meals}</span>
                                    <span className="meal-label">meals</span>
                                </div>

                                <button
                                    type="button"
                                    className="meal-btn"
                                    onClick={() => changeMeal(member.member_id, 1)}
                                    disabled={saving[member.member_id]}
                                    aria-label="Add meal"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>

                            {/* Meal financial breakdown */}
                            <div className="meal-breakdown">
                                <div className="meal-breakdown-row">
                                    <span>Grocery paid</span>
                                    <strong>{formatMoney(groceryPaid)}</strong>
                                </div>
                                <div className="meal-breakdown-row">
                                    <span>Meal share ({meals} × {formatMoney(perMealCost.toFixed(2))})</span>
                                    <strong>{formatMoney(mealShare.toFixed(2))}</strong>
                                </div>
                                <div className={`meal-breakdown-row total ${mealBalance >= 0 ? "positive" : "negative"}`}>
                                    <span>{mealBalance >= 0 ? "Gets back" : "Owes"}</span>
                                    <strong>
                                        {mealBalance >= 0 ? "+" : "-"}
                                        {formatMoney(Math.abs(mealBalance).toFixed(2))}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default MealCounter;
