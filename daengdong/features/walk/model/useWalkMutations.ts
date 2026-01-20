import { useMutation } from "@tanstack/react-query";
import { startWalkApi, endWalkApi, StartWalkRequest, EndWalkRequest } from "../api/walk";

export const useStartWalk = () => {
    return useMutation({
        mutationFn: (req: StartWalkRequest) => startWalkApi(req),
        onError: (error) => {
            console.error("Failed to start walk", error);
            // Handle error (e.g., show toast)
        },
    });
};

export const useEndWalk = () => {
    return useMutation({
        mutationFn: (req: EndWalkRequest) => endWalkApi(req),
        onError: (error) => {
            console.error("Failed to end walk", error);
            // Handle error
        },
    });
};
