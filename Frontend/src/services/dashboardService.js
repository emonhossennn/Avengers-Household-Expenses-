import apiClient from "../api/client";

export async function getMonthlySummary(year, month) {
    const response = await apiClient.get("/expenses/summary/", {
        params: {
            year,
            month,
        },
    });

    return response.data;
}

export async function getMonthlySettlements(year, month) {
    const response = await apiClient.get(
        "/settlements/summary/",
        {
            params: {
                year,
                month,
            },
        },
    );

    return response.data;
}