import apiClient from "../api/client";


export async function getSettlementPayments(year, month) {
    const response = await apiClient.get(
        "/settlements/payments/",
        {
            params: {
                year,
                month,
            },
        },
    );

    return response.data;
}


export async function markSettlementPaid(settlement) {
    const response = await apiClient.post(
        "/settlements/payments/",
        {
            year: settlement.year,
            month: settlement.month,
            from_member_id: settlement.from_member_id,
            to_member_id: settlement.to_member_id,
            amount: settlement.amount,
        },
    );

    return response.data;
}


export async function deleteSettlementPayment(paymentId) {
    const response = await apiClient.delete(
        "/settlements/payments/",
        {
            params: {
                id: paymentId,
            },
        },
    );

    return response.data;
}