function formatMoney(amount) {
    return `৳${Number(amount || 0).toLocaleString(
        "en-BD",
        {
            maximumFractionDigits: 2,
        },
    )}`;
}

const CATEGORY_NAMES = {
    RENT: "House Rent",
    GROCERY: "Groceries",
    ELECTRICITY: "Electricity",
    INTERNET: "Internet",
    WATER: "Water",
    GAS: "Gas",
    MAID: "Maid",
    ACCESSORIES: "Accessories",
    CLEANING: "Cleaning",
    OTHER: "Other",
};

const CATEGORY_ICONS = {
    RENT: "🏠",
    GROCERY: "🛒",
    ELECTRICITY: "⚡",
    INTERNET: "🌐",
    WATER: "💧",
    GAS: "🔥",
    MAID: "🧹",
    ACCESSORIES: "🎒",
    CLEANING: "🧽",
    OTHER: "📦",
};

function CategoryBreakdown({
    expenses = [],
}) {

    const categoryTotals = {};


    expenses.forEach((expense) => {

        const category =
            expense.category || "OTHER";

        const amount =
            Number(expense.amount || 0);


        categoryTotals[category] =
            (categoryTotals[category] || 0) +
            amount;
    });


    const categories =
        Object.entries(categoryTotals)
            .sort(
                ([, amountA], [, amountB]) =>
                    amountB - amountA,
            );


    const total =
        categories.reduce(
            (sum, [, amount]) =>
                sum + amount,
            0,
        );


    if (categories.length === 0) {
        return (
            <div className="empty-state">

                <h3>
                    No spending data yet.
                </h3>

                <p>
                    Add some expenses to see
                    your spending breakdown.
                </p>

            </div>
        );
    }


    return (
        <div className="category-breakdown">

            {categories.map(
                ([category, amount]) => {

                    const percentage =
                        total > 0
                            ? (amount / total) * 100
                            : 0;


                    return (
                        <div
                            className="category-item"
                            key={category}
                        >

                            <div className="category-item-header">

                                <div className="category-name">

                                    <span className="category-icon">
                                        {CATEGORY_ICONS[
                                            category
                                        ] || "📦"}
                                    </span>

                                    <span>
                                        {CATEGORY_NAMES[
                                            category
                                        ] || category}
                                    </span>

                                </div>


                                <div className="category-amount">

                                    <strong>
                                        {formatMoney(
                                            amount,
                                        )}
                                    </strong>

                                    <span>
                                        {percentage.toFixed(
                                            1,
                                        )}
                                        %
                                    </span>

                                </div>

                            </div>


                            <div className="category-bar">

                                <div
                                    className="category-bar-fill"
                                    style={{
                                        width:
                                            `${percentage}%`,
                                    }}
                                />

                            </div>

                        </div>
                    );
                },
            )}

        </div>
    );
}


export default CategoryBreakdown;