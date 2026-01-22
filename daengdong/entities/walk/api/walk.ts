import { walkApi } from "./index";
import {
    StartWalkRequest,
    EndWalkRequest,
    WriteWalkDiaryRequest,
} from "../model/types";

export const startWalkApi = async (req: StartWalkRequest) => {
    return walkApi.startWalk(req);
};

export const endWalkApi = async (req: EndWalkRequest) => {
    return walkApi.endWalk(req);
};

export const postWalkDiary = async (req: WriteWalkDiaryRequest) => {
    return walkApi.postWalkDiary(req);
};
