import apiClient from "../api/client";


export async function createExpense(expenseData) {
    const response = await apiClient.post(
        "/expenses/",
        expenseData,
    );

    return response.data;
}


export async function getExpenses(year, month) {
    const response = await apiClient.get(
        "/expenses/",
        {
            params: {
                year,
                month,
            },
        },
    );

    return response.data;
}


export async function deleteExpense(expenseId) {
    const response = await apiClient.delete(
        `/expenses/${expenseId}/`,
    );

    return response.data;
}


export async function updateExpense(
    expenseId,
    expenseData,
) {
    const response = await apiClient.patch(
        `/expenses/${expenseId}/`,
        expenseData,
    );

    return response.data;
}