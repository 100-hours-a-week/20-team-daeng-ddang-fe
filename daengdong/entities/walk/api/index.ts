import { ENV } from "@/shared/config/env";
import { WalkRepository } from "./types";
import { walkRepositoryReal } from "./blocks.real";
import { walkRepositoryMock } from "./blocks.mock";

export const walkApi: WalkRepository = ENV.USE_MOCK
    ? walkRepositoryMock
    : walkRepositoryReal;
