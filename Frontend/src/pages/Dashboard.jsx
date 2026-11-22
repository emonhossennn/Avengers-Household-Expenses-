import { useEffect, useState } from "react";
import CategoryBreakdown from "../components/CategoryBreakdown";
import ExpenseDetailsModal from "../components/ExpenseDetailsModal";
import MemberSpending from "../components/MemberSpending";
import MealCounter from "../components/MealCounter";
import {
    Pencil,
    Plus,
    RefreshCw,
    Trash2,
} from "lucide-react";

import { useMember } from "../context/MemberContext";

import {
    getMonthlySettlements,
    getMonthlySummary,
} from "../services/dashboardService";

import {
    getSettlementPayments,
    markSettlementPaid,
    deleteSettlementPayment,
} from "../services/settlementService";

import {
    getExpenses,
    deleteExpense,
} from "../services/expenseService";

import { themes } from "../themes/themes";

import AddExpenseModal from "../components/AddExpenseModal";


function formatMoney(amount) {
    const number = Number(amount || 0);

    return `৳${number.toLocaleString("en-BD", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    })}`;
}


function formatMonth(year, month) {
    return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });
}


function formatExpenseDate(date) {
    if (!date) {
        return "";
    }

    return new Date(date).toLocaleDateString("en-BD", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}


function getCategoryIcon(category) {
    const icons = {
        RENT: "🏠",
        GROCERY: "🛒",
        ELECTRICITY: "⚡",
        INTERNET: "🌐",
        WATER: "💧",
        GAS: "🔥",
        CLEANING: "🧹",
        OTHER: "📦",
    };

    return icons[category] || "📦";
}


function Dashboard() {
    const { selectedMember } = useMember();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [summary, setSummary] = useState(null);
    const [settlements, setSettlements] = useState([]);
    const [settlementPayments, setSettlementPayments] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedExpense, setSelectedExpense] = useState(null);
    const [editingExpense, setEditingExpense] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const memberTheme =
        themes[selectedMember?.hero] || themes.IRON_MAN;


    function handleEditExpense(expense) {
        setEditingExpense(expense);
        setShowExpenseModal(true);
    }


    async function handleDeleteExpense(expenseId) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this expense?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteExpense(expenseId);
            await loadDashboard();
        } catch (err) {
            console.error("Delete expense error:", err);
            alert("Unable to delete this expense.");
        }
    }


    function isSettlementPaid(settlement) {
        return settlementPayments.some(
            (payment) =>
                Number(payment.from_member) ===
                Number(settlement.from_member_id) &&
                Number(payment.to_member) ===
                Number(settlement.to_member_id) &&
                Number(payment.amount) ===
                Number(settlement.amount) &&
                payment.is_paid === true,
        );
    }


    async function handleMarkSettlementPaid(settlement) {
        const confirmed = window.confirm(
            `Mark ${settlement.from_member} → ${settlement.to_member} as paid?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            await markSettlementPaid({
                ...settlement,
                year,
                month,
            });

            await loadDashboard();
        } catch (err) {
            console.error(
                "Mark settlement paid error:",
                err.response?.data || err,
            );

            alert("Unable to mark settlement as paid.");
        }
    }


    async function handleUndoSettlementPaid(settlement) {
        const payment = settlementPayments.find(
            (item) =>
                Number(item.from_member) ===
                Number(settlement.from_member_id) &&
                Number(item.to_member) ===
                Number(settlement.to_member_id) &&
                Number(item.amount) ===
                Number(settlement.amount) &&
                item.is_paid === true,
        );

        if (!payment) {
            alert("Payment record not found.");
            return;
        }

        const confirmed = window.confirm(
            `Undo payment from ${settlement.from_member} to ${settlement.to_member}?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteSettlementPayment(payment.id);

            await loadDashboard();
        } catch (err) {
            console.error(
                "Undo settlement payment error:",
                err.response?.data || err,
            );

            alert("Unable to undo this payment.");
        }
    }


    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            console.log("Loading dashboard:", {
                year,
                month,
            });

            // 1. Monthly Summary
            const summaryData = await getMonthlySummary(year, month);
            console.log("Monthly summary:", summaryData);

            // 2. Settlements (who pays whom)
            const settlementData = await getMonthlySettlements(year, month);
            console.log("Settlement summary:", settlementData);

            // 3. Settlement Payments (paid status)
            const paymentData = await getSettlementPayments(year, month);
            console.log("Settlement payments:", paymentData);

            // 4. Expenses
            const expenseData = await getExpenses(year, month);
            console.log("Expenses:", expenseData);

            // Update all states
            setSummary(summaryData);

            setSettlements(
                settlementData?.settlements || settlementData || []
            );

            setSettlementPayments(
                Array.isArray(paymentData)
                    ? paymentData
                    : paymentData?.results || []
            );

            setExpenses(
                Array.isArray(expenseData)
                    ? expenseData
                    : expenseData?.results || []
            );

        } catch (err) {
            console.error(
                "Dashboard loading error:",
                err.response?.data || err,
            );

            setError("Unable to load your house finances.");
        } finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        loadDashboard();
    }, [year, month]);


    function changeMonth(direction) {
        setCurrentDate(
            (previous) =>
                new Date(
                    previous.getFullYear(),
                    previous.getMonth() + direction,
                    1
                )
        );
    }


    // ==================== NAME EDITING ====================
    function startEditingName() {
        setNameInput(selectedMember?.name || "");
        setNameError("");
        setEditingName(true);
    }

    async function saveNameEdit() {
        const trimmed = nameInput.trim();
        if (!trimmed) {
            setNameError("Name cannot be empty.");
            return;
        }
        setNameSaving(true);
        setNameError("");
        try {
            const updated = await updateMemberName(selectedMember.id, trimmed);
            setSelectedMember({ ...selectedMember, ...updated });
            setEditingName(false);
        } catch (err) {
            console.error("Name update error:", err);
            setNameError("Failed to save name.");
        } finally {
            setNameSaving(false);
        }
    }

    function cancelNameEdit() {
        setEditingName(false);
        setNameError("");
    }


    // ==================== GROCERY TOTAL ====================
    const groceryTotal = expenses
        .filter((e) => e.category === "GROCERY")
        .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    // Inject grocery_paid per member (from grocery expenses only)
    const membersWithGrocery = summary?.members?.map((member) => {
        const paid = expenses
            .filter(
                (e) =>
                    e.category === "GROCERY" &&
                    (Number(e.paid_by) === Number(member.member_id) ||
                        Number(e.paid_by?.id) === Number(member.member_id))
            )
            .reduce((sum, e) => sum + Number(e.amount || 0), 0);
        return { ...member, grocery_paid: paid };
    }) || [];


    // ==================== LOADING ====================
    if (loading) {
        return (
            <main
                className="dashboard-page"
                style={{
                    "--primary": memberTheme.colors.primary,
                    "--secondary": memberTheme.colors.secondary,
                    "--background": memberTheme.colors.background,
                    "--surface": memberTheme.colors.surface,
                    "--text": memberTheme.colors.text,
                    "--muted": memberTheme.colors.muted,
                    "--glow": memberTheme.glow,
                }}
            >
                <div className="dashboard-loading">
                    <RefreshCw size={22} />
                    <span>Loading HQ finances...</span>
                </div>
            </main>
        );
    }


    // ==================== ERROR ====================
    if (error) {
        return (
            <main
                className="dashboard-page"
                style={{
                    "--primary": memberTheme.colors.primary,
                    "--secondary": memberTheme.colors.secondary,
                    "--background": memberTheme.colors.background,
                    "--surface": memberTheme.colors.surface,
                    "--text": memberTheme.colors.text,
                    "--muted": memberTheme.colors.muted,
                    "--glow": memberTheme.glow,
                }}
            >
                <div className="dashboard-error">
                    <h2>HQ Connection Failed</h2>
                    <p>{error}</p>
                    <button className="retry-button" onClick={loadDashboard}>
                        Try Again
                    </button>
                </div>
            </main>
        );
    }


    // ==================== CURRENT MEMBER ====================
    const mySummary = summary?.members?.find(
        (member) =>
            Number(member.member_id) === Number(selectedMember?.id)
    );

    const myBalance = Number(mySummary?.balance || 0);


    return (
        <main
            className="dashboard-page"
            style={{
                "--primary": memberTheme.colors.primary,
                "--secondary": memberTheme.colors.secondary,
                "--background": memberTheme.colors.background,
                "--surface": memberTheme.colors.surface,
                "--text": memberTheme.colors.text,
                "--muted": memberTheme.colors.muted,
                "--glow": memberTheme.glow,
            }}
        >
            <div className="dashboard-container">

                {/* =====================================
                    HEADER
                ====================================== */}
                <header className="dashboard-header">
                    <div>
                        <p className="eyebrow">AVENGERS HOUSE</p>
                        <h1>
                            Welcome, {selectedMember?.name || "Avenger"}
                        </h1>
                        <p className="dashboard-subtitle">
                            {selectedMember?.hero_display ||
                                selectedMember?.hero ||
                                "House Member"}{" "}
                            • House Finance Command Center
                        </p>
                    </div>

                    <div className="month-selector">
                        <button
                            type="button"
                            className="month-nav-button"
                            onClick={() => changeMonth(-1)}
                            aria-label="Previous month"
                        >
                            ←
                        </button>

                        <div className="current-month">
                            <span className="month-name">
                                {currentDate.toLocaleString("en-US", {
                                    month: "long",
                                })}
                            </span>
                            <span className="month-year">{year}</span>
                        </div>

                        <button
                            type="button"
                            className="month-nav-button"
                            onClick={() => changeMonth(1)}
                            aria-label="Next month"
                        >
                            →
                        </button>
                    </div>
                </header>

                <AddExpenseModal
                    isOpen={showExpenseModal}
                    onClose={() => {
                        setShowExpenseModal(false);
                        setEditingExpense(null);
                    }}
                    onSuccess={loadDashboard}
                    editingExpense={editingExpense}
                    selectedYear={year}
                    selectedMonth={month}
                />

                {/* =====================================
                    OVERVIEW
                ====================================== */}
                <section className="overview-grid">
                    <div className="stat-card main-stat">
                        <span>TOTAL HOUSE EXPENSE</span>
                        <strong>{formatMoney(summary?.total_expense)}</strong>
                        <small>Everything paid by the house this month</small>
                    </div>

                    <div className="stat-card">
                        <span>YOUR FAIR SHARE</span>
                        <strong>{formatMoney(mySummary?.share)}</strong>
                        <small>equal share among four members</small>
                    </div>

                    <div
                        className={`stat-card ${myBalance >= 0 ? "positive" : "negative"
                            }`}
                    >
                        <span>YOUR BALANCE</span>
                        <strong>
                            {myBalance >= 0 ? "+" : "-"}
                            {formatMoney(Math.abs(myBalance))}
                        </strong>
                        <small>
                            {myBalance > 0
                                ? "You should receive"
                                : myBalance < 0
                                    ? "You need to pay"
                                    : "You're perfectly settled"}
                        </small>
                    </div>
                </section>


                {/* =====================================
                    HOUSE MEMBERS
                ====================================== */}
                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">THE TEAM</p>
                            <h2>House Members</h2>
                        </div>

                        <button
                            type="button"
                            className="add-expense-button"
                            onClick={() => {
                                setEditingExpense(null);
                                setShowExpenseModal(true);
                            }}
                        >
                            <Plus size={18} />
                            Add Expense
                        </button>
                    </div>

                    <div className="member-summary-grid">
                        {summary?.members?.map((member) => {
                            const balance = Number(member.balance || 0);
                            const theme =
                                themes[member.hero] || themes.IRON_MAN;

                            return (
                                <div
                                    className="member-summary-card"
                                    key={member.member_id}
                                    style={{
                                        "--card-primary": theme.colors.primary,
                                        "--card-glow": theme.glow,
                                    }}
                                >
                                    <div className="member-summary-top">
                                        <div className="member-avatar">
                                            {member.name
                                                ?.charAt(0)
                                                .toUpperCase()}
                                        </div>

                                        <div>
                                            <span>{member.hero}</span>
                                            <h3>{member.name}</h3>
                                        </div>
                                    </div>

                                    <div className="member-money">
                                        <div>
                                            <span>Paid</span>
                                            <strong>
                                                {formatMoney(member.paid)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Balance</span>
                                            <strong
                                                className={
                                                    balance >= 0
                                                        ? "money-positive"
                                                        : "money-negative"
                                                }
                                            >
                                                {balance >= 0 ? "+" : "-"}
                                                {formatMoney(Math.abs(balance))}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>


                {/* =====================================
                    RECENT EXPENSES
                ====================================== */}
                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">RECENT EXPENSES</p>
                            <h2>This Month’s Expenses</h2>
                            <p className="section-description">
                                All household expenses recorded for{" "}
                                {formatMonth(year, month)}.
                            </p>
                        </div>
                    </div>

                    {expenses.length === 0 ? (
                        <div className="empty-state">
                            <h3>No expenses yet.</h3>
                            <p>
                                Add your first household expense for this
                                month.
                            </p>
                        </div>
                    ) : (
                        <div className="expense-list">
                            {expenses.map((expense) => (
                                <div
                                    className="expense-row"
                                    key={expense.id}
                                    onClick={() => setSelectedExpense(expense)}
                                >
                                    <div className="expense-icon">
                                        {getCategoryIcon(expense.category)}
                                    </div>

                                    <div className="expense-details">
                                        <strong>{expense.title}</strong>
                                        <span>
                                            {expense.category_display ||
                                                expense.category}
                                        </span>
                                        {expense.description && (
                                            <small>{expense.description}</small>
                                        )}
                                    </div>

                                    <div className="expense-payer">
                                        <span>Paid by</span>
                                        <strong>
                                            {expense.paid_by_name ||
                                                expense.paid_by?.name ||
                                                "Unknown"}
                                        </strong>
                                    </div>

                                    <div className="expense-date">
                                        {formatExpenseDate(expense.date)}
                                    </div>

                                    <div className="expense-amount">
                                        {formatMoney(expense.amount)}
                                    </div>

                                    <div className="expense-actions">
                                        <button
                                            type="button"
                                            className="edit-expense-button"
                                            title="Edit expense"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleEditExpense(expense);
                                            }}
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            className="delete-expense-button"
                                            title="Delete expense"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteExpense(expense.id);
                                            }}
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>


                {/* =====================================
                    MEAL COUNTER
                ====================================== */}
                <MealCounter
                    year={year}
                    month={month}
                    members={membersWithGrocery}
                    groceryTotal={groceryTotal}
                />


                {/* =====================================
                    SETTLEMENT
                ====================================== */}
                <section className="dashboard-section">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">SETTLEMENT</p>
                            <h2>Who Pays Whom</h2>
                            <p className="section-description">
                                The minimum transfers needed to settle this
                                month's expenses.
                            </p>
                        </div>
                    </div>

                    {settlements.length === 0 ? (
                        <div className="settlement-empty">
                            <div className="settlement-empty-icon">✓</div>
                            <div>
                                <h3>Everyone is settled</h3>
                                <p>
                                    There are no outstanding payments for this
                                    month.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="settlement-list">
                            {settlements.map((settlement, index) => (
                                <div
                                    className="settlement-card"
                                    key={`${settlement.from_member_id}-${settlement.to_member_id}-${index}`}
                                >
                                    <div className="settlement-person">
                                        <span className="settlement-label">
                                            PAYS
                                        </span>
                                        <strong>
                                            {settlement.from_member}
                                        </strong>
                                    </div>

                                    <div className="settlement-arrow">
                                        <div className="settlement-line" />
                                        <span>→</span>
                                    </div>

                                    <div className="settlement-person">
                                        <span className="settlement-label">
                                            RECEIVES
                                        </span>
                                        <strong>
                                            {settlement.to_member}
                                        </strong>
                                    </div>

                                    <div className="settlement-amount">
                                        <span>Amount</span>
                                        <strong>
                                            {formatMoney(settlement.amount)}
                                        </strong>
                                    </div>

                                    {isSettlementPaid(settlement) ? (
                                        <div className="settlement-payment-actions">
                                            <div className="settlement-paid">
                                                ✓ Paid
                                            </div>

                                            <button
                                                type="button"
                                                className="settlement-undo-button"
                                                onClick={() =>
                                                    handleUndoSettlementPaid(
                                                        settlement,
                                                    )
                                                }
                                            >
                                                Undo
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className="settlement-pay-button"
                                            onClick={() =>
                                                handleMarkSettlementPaid(
                                                    settlement,
                                                )
                                            }
                                        >
                                            Mark as Paid
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </main>
    );
}

export default Dashboard;