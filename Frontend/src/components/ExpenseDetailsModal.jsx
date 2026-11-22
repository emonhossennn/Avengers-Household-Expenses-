import React from "react";


function formatMoney(amount) {
    return `৳${Number(amount || 0).toLocaleString(
        "en-BD",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        },
    )}`;
}


function formatDate(date) {
    if (!date) {
        return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        },
    );
}


export default function ExpenseDetailsModal({
    expense,
    onClose,
    onEdit,
    onDelete,
}) {

    if (!expense) {
        return null;
    }


    const paidBy =
        expense.paid_by?.name ||
        expense.paid_by_name ||
        expense.paid_by?.username ||
        "Unknown";


    return (
        <div
            className="expense-details-overlay"
            onClick={onClose}
        >

            <div
                className="expense-details-modal"
                onClick={(event) =>
                    event.stopPropagation()
                }
            >

                <div className="expense-details-header">

                    <div>

                        <p className="eyebrow">
                            EXPENSE DETAILS
                        </p>

                        <h2>
                            {expense.title}
                        </h2>

                    </div>


                    <button
                        type="button"
                        className="expense-details-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ×
                    </button>

                </div>


                <div className="expense-details-amount">

                    <span>
                        Amount
                    </span>

                    <strong>
                        {formatMoney(
                            expense.amount,
                        )}
                    </strong>

                </div>


                <div className="expense-details-grid">

                    <div className="expense-detail-item">

                        <span>
                            Paid By
                        </span>

                        <strong>
                            {paidBy}
                        </strong>

                    </div>


                    <div className="expense-detail-item">

                        <span>
                            Category
                        </span>

                        <strong>
                            {expense.category ||
                                "—"}
                        </strong>

                    </div>


                    <div className="expense-detail-item">

                        <span>
                            Date
                        </span>

                        <strong>
                            {formatDate(
                                expense.expense_date,
                            )}
                        </strong>

                    </div>


                    <div className="expense-detail-item">

                        <span>
                            Expense ID
                        </span>

                        <strong>
                            #{expense.id}
                        </strong>

                    </div>

                </div>


                {expense.description && (

                    <div className="expense-description">

                        <span>
                            Description
                        </span>

                        <p>
                            {expense.description}
                        </p>

                    </div>

                )}


                <div className="expense-details-actions">

                    <button
                        type="button"
                        className="expense-edit-main-button"
                        onClick={() =>
                            onEdit(expense)
                        }
                    >
                        Edit Expense
                    </button>


                    <button
                        type="button"
                        className="expense-delete-main-button"
                        onClick={() =>
                            onDelete(expense.id)
                        }
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    );
}