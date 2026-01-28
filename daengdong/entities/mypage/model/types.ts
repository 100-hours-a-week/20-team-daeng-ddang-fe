export interface MyPageSummary {
    dogId: number;
    dogName: string;
    point: number;
    totalWalkCount: number;
    totalWalkDistanceKm: number;
    profileImageUrl?: string;
}

export interface MyPageSummaryResponse {
    dogId: number;
    name: string;
    point: number;
    totalWalkCount: number;
    totalWalkDistanceKm: number;
    profileImageUrl: string;
}
