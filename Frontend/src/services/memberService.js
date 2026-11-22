import apiClient from "../api/client";

export async function getMembers() {
    const response = await apiClient.get("/members/");
    return response.data;
}

export async function updateMemberName(memberId, name) {
    const response = await apiClient.patch(`/members/${memberId}/`, { name });
    return response.data;
}

export async function getMealCounts(year, month) {
    const response = await apiClient.get("/members/meals/", {
        params: { year, month },
    });
    return response.data;
}

export async function setMealCount(memberId, year, month, meals) {
    const response = await apiClient.post("/members/meals/", {
        member_id: memberId,
        year,
        month,
        meals,
    });
    return response.data;
}