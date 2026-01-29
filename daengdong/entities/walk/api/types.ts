import {
    BlockData,
    NearbyBlocksParams,
    MissionAnalysisData,
    StartWalkRequest,
    StartWalkResponse,
    EndWalkRequest,
    EndWalkResponse,
    WriteWalkDiaryRequest,
    WriteWalkDiaryResponse
} from "../model/types";

export interface WalkRepository {
    getNearbyBlocks(params: NearbyBlocksParams): Promise<BlockData[]>;
    getMyBlocks(lat: number, lng: number): Promise<BlockData[]>;
    judgeWalkMissions(walkId: number): Promise<MissionAnalysisData>;
    startWalk(req: StartWalkRequest): Promise<StartWalkResponse>;
    endWalk(req: EndWalkRequest): Promise<EndWalkResponse>;
    postWalkDiary(req: WriteWalkDiaryRequest): Promise<WriteWalkDiaryResponse>;
}
