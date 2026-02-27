"use client";

import React from "react";
import styled from "@emotion/styled";
import { colors, spacing } from "@/shared/styles/tokens";
import { DogProfileImage } from "@/shared/components/DogProfileImage";

// ── 서브 컴포넌트 ──────────────────────────────────────────────
const RankNumber = ({
  isHighlighted,
  children,
}: {
  isHighlighted?: boolean;
  children: React.ReactNode;
}) => <StyledRankNum isHighlighted={!!isHighlighted}>{children}</StyledRankNum>;

const RankAvatar = ({ src, alt }: { src?: string | null; alt: string }) => (
  <StyledAvatar>
    <DogProfileImage src={src} alt={alt} size={40} />
  </StyledAvatar>
);

const RankInfo = ({ children }: { children: React.ReactNode }) => (
  <StyledInfo>{children}</StyledInfo>
);

const RankName = ({ children }: { children: React.ReactNode }) => (
  <StyledNameRow>
    <StyledName>{children}</StyledName>
  </StyledNameRow>
);

const RankSubInfo = ({ children }: { children: React.ReactNode }) => (
  <StyledSubInfo>{children}</StyledSubInfo>
);

const RankDistance = ({ children }: { children: React.ReactNode }) => (
  <StyledDistanceContainer>
    <StyledDistanceValue>{children}</StyledDistanceValue>
  </StyledDistanceContainer>
);

export const GapBadge = styled.span<{ type: "target" | "chaser" }>`
    font-size: 10px;
    font-weight: 700;
    padding: 2px 5px;
    border-radius: 4px;
    color: ${({ type }) => (type === "target" ? "#E65100" : "#1565C0")};
    background-color: ${({ type }) =>
    type === "target" ? "#FFF3E0" : "#E3F2FD"};
`;

// ── 부모 컴포넌트 ────────────────────────────────────────────────────────

interface RankItemProps {
  isHighlighted?: boolean;
  id?: string;
  children: React.ReactNode;
}

type RankItemComponent = React.FC<RankItemProps> & {
  Number: typeof RankNumber;
  Avatar: typeof RankAvatar;
  Info: typeof RankInfo;
  Name: typeof RankName;
  SubInfo: typeof RankSubInfo;
  Distance: typeof RankDistance;
  GapBadge: typeof GapBadge;
};

export const RankItem: RankItemComponent = Object.assign(
  ({ isHighlighted, id, children }: RankItemProps) => (
    <StyledRankRow isHighlighted={!!isHighlighted} id={id}>
      {children}
    </StyledRankRow>
  ),
  {
    Number: RankNumber,
    Avatar: RankAvatar,
    Info: RankInfo,
    Name: RankName,
    SubInfo: RankSubInfo,
    Distance: RankDistance,
    GapBadge: GapBadge,
  }
);

const StyledRankRow = styled.div<{ isHighlighted: boolean }>`
  display: flex;
  align-items: center;
  padding: ${spacing[3]}px 0;
  border-bottom: 1px solid ${colors.gray[100]};
  background-color: ${({ isHighlighted }) =>
    isHighlighted ? colors.primary[50] : "transparent"};
  margin: ${({ isHighlighted }) =>
    isHighlighted ? `0 -${spacing[4]}px` : "0"};
  padding-left: ${({ isHighlighted }) =>
    isHighlighted ? `${spacing[4]}px` : "0"};
  padding-right: ${({ isHighlighted }) =>
    isHighlighted ? `${spacing[4]}px` : "0"};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledRankNum = styled.div<{ isHighlighted: boolean }>`
  width: 30px;
  font-size: 16px;
  font-weight: 700;
  color: ${({ isHighlighted }) =>
    isHighlighted ? colors.primary[600] : colors.gray[500]};
  text-align: center;
  margin-right: ${spacing[3]}px;
`;

const StyledAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: ${spacing[3]}px;
  background-color: ${colors.gray[200]};
`;

const StyledInfo = styled.div`
  flex: 1;
`;

const StyledNameRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StyledName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${colors.gray[900]};
`;

const StyledSubInfo = styled.div`
  font-size: 12px;
  color: ${colors.gray[500]};
  margin-top: 2px;
`;

const StyledDistanceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  min-width: 60px;
`;

const StyledDistanceValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: ${colors.gray[600]};
  letter-spacing: -0.5px;
  font-variant-numeric: tabular-nums;
`;
