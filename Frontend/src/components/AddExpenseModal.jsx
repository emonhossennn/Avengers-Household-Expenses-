import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { createExpense } from "../services/expenseService";
import { updateExpense } from "../services/expenseService";
import { getMembers } from "../services/memberService";


const INITIAL_FORM = {
    title: "",
    amount: "",
    category: "GROCERY",
    paid_by: "",
    date: "",
    description: "",
};


const CATEGORIES = [
    {
        value: "RENT",
        label: "House Rent",
    },
    {
        value: "GROCERY",
        label: "Groceries",
    },
    {
        value: "ELECTRICITY",
        label: "Electricity",
    },
    {
        value: "INTERNET",
        label: "Internet",
    },
    {
        value: "WATER",
        label: "Water",
    },
    {
        value: "GAS",
        label: "Gas",
    },
    {
        value: "MAID",
        label: "Maid",
    },
    {
        value: "ACCESSORIES",
        label: "Accessories",
    },
    {
        value: "CLEANING",
        label: "Cleaning",
    },
    {
        value: "OTHER",
        label: "Other",
    },
];
function getDefaultExpenseDate(year, month) {
    if (!year || !month) {
        return new Date()
            .toISOString()
            .split("T")[0];
    }

    return `${year}-${String(month).padStart(2, "0")}-01`;
}
function AddExpenseModal({
    isOpen,
    onClose,
    onSuccess,
    selectedYear,
    selectedMonth,
    editingExpense = null,
}) {
    const [form, setForm] =
        useState(INITIAL_FORM);

    const [members, setMembers] =
        useState([]);

    const [loadingMembers, setLoadingMembers] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (editingExpense) {
            setForm({
                title: editingExpense.title || "",
                amount: editingExpense.amount || "",
                category:
                    editingExpense.category ||
                    "GROCERY",
                paid_by:
                    editingExpense.paid_by?.id ??
                    editingExpense.paid_by ??
                    "",
                date:
                    editingExpense.expense_date ||
                    "",
                description:
                    editingExpense.description ||
                    "",
            });

            return;
        }

        setForm({
            ...INITIAL_FORM,
            date: getDefaultExpenseDate(
                selectedYear,
                selectedMonth,
            ),
        });
    }, [
        isOpen,
        editingExpense,
        selectedYear,
        selectedMonth,
    ]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        async function fetchMembers() {
            setLoadingMembers(true);
            try {
                const data = await getMembers();
                setMembers(data);

                if (!editingExpense && data.length > 0) {
                    setForm((prev) => ({
                        ...prev,
                        paid_by: data[0].id,
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch members:", err);
                setError("Failed to load members.");
            } finally {
                setLoadingMembers(false);
            }
        }

        fetchMembers();
    }, [isOpen, editingExpense]);


    if (!isOpen) {
        return null;
    }


    function handleChange(event) {
        const {
            name,
            value,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }


    async function handleSubmit(event) {

        event.preventDefault();

        setError("");

        try {

            const expenseData = {
                title: form.title.trim(),

                amount: Number(form.amount),

                category: form.category,

                paid_by: Number(form.paid_by),

                expense_date: form.date,

                description:
                    form.description.trim(),
            };


            if (editingExpense) {

                await updateExpense(
                    editingExpense.id,
                    expenseData,
                );

            } else {

                await createExpense(
                    expenseData,
                );
            }


            onSuccess();

            onClose();


        } catch (err) {

            console.error(
                "Expense save error:",
                err,
            );

            console.error(
                "DJANGO RESPONSE:",
                err?.response?.data,
            );

            const backendError =
                err?.response?.data;

            if (
                backendError &&
                typeof backendError === "object"
            ) {

                const firstError =
                    Object.values(
                        backendError,
                    )[0];

                if (
                    Array.isArray(firstError)
                ) {

                    setError(
                        firstError[0],
                    );

                } else {

                    setError(
                        "Unable to save expense.",
                    );
                }

            } else {

                setError(
                    "Unable to save expense.",
                );
            }
        }
    }



    return (
        <div
            className="modal-overlay"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >

            <div className="expense-modal">

                <div className="modal-header">

                    <div>
                        <p className="eyebrow">
                            HOUSE FINANCE
                        </p>

                        <h2>
                            {editingExpense
                                ? "Edit Expense"
                                : "Add Expense"}
                        </h2>
                    </div>


                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="expense-form"
                >

                    <div className="form-group">

                        <label>
                            What did you spend on?
                        </label>

                        <input
                            type="text"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="e.g. Weekly groceries"
                            autoFocus
                        />

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Amount
                            </label>

                            <div className="money-input">

                                <span>৳</span>

                                <input
                                    type="number"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleChange}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                />

                            </div>

                        </div>


                        <div className="form-group">

                            <label>
                                Category
                            </label>

                            <select
                                name="category"
                                value={form.category}
                                onChange={handleChange}
                            >

                                {CATEGORIES.map(
                                    (category) => (
                                        <option
                                            key={
                                                category.value
                                            }
                                            value={
                                                category.value
                                            }
                                        >
                                            {category.label}
                                        </option>
                                    ),
                                )}

                            </select>

                        </div>

                    </div>


                    <div className="form-row">

                        <div className="form-group">

                            <label>
                                Paid by
                            </label>

                            <select
                                name="paid_by"
                                value={form.paid_by}
                                onChange={handleChange}
                                disabled={loadingMembers}
                            >

                                {members.map(
                                    (member) => (
                                        <option
                                            key={member.id}
                                            value={member.id}
                                        >
                                            {member.name}
                                            {" — "}
                                            {member.hero_display}
                                        </option>
                                    ),
                                )}

                            </select>

                        </div>


                        <div className="form-group">

                            <label>
                                Date
                            </label>

                            <input
                                type="date"
                                name="date"
                                value={form.date}
                                onChange={handleChange}
                            />

                        </div>

                    </div>


                    <div className="form-group">

                        <label>
                            Description
                            <span>
                                Optional
                            </span>
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Anything else?"
                            rows="3"
                        />

                    </div>


                    {error && (
                        <div className="form-error">
                            {error}
                        </div>
                    )}


                    <div className="modal-actions">

                        <button
                            type="button"
                            className="cancel-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="save-expense-button"
                            disabled={
                                saving ||
                                loadingMembers
                            }
                        >
                            {saving
                                ? "Saving..."
                                : editingExpense
                                    ? "Save Changes"
                                    : "Add Expense"}
                        </button>
                    </div>

                </form>

            </div>

        </div>
    );
}



export default AddExpenseModal;