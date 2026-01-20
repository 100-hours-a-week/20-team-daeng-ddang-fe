"use client";

import styled from "@emotion/styled";
import { colors } from "@/shared/styles/tokens";

import PawPrintIcon from "@/shared/assets/icons/paw-print.svg";
import ScanHeartIcon from "@/shared/assets/icons/scan-heart.svg";
import DogIcon from "@/shared/assets/icons/dog.svg";
import TrophyIcon from "@/shared/assets/icons/trophy.svg";
import CircleUserIcon from "@/shared/assets/icons/circle-user.svg";

interface BottomNavProps {
    currentPath: string;
    onNavigate: (path: string) => void;
}

interface NavItem {
    path: string;
    label: string;
    iconFn: string;
}

const NAV_ITEMS: NavItem[] = [
    {
        label: "발자국",
        path: "/footprints",
        iconFn: PawPrintIcon.src,
    },
    {
        label: "헬스케어",
        path: "/healthcare",
        iconFn: ScanHeartIcon.src,
    },
    {
        label: "산책하기",
        path: "/walk",
        iconFn: DogIcon.src,
    },
    {
        label: "랭킹",
        path: "/ranking",
        iconFn: TrophyIcon.src,
    },
    {
        label: "마이페이지",
        path: "/mypage",
        iconFn: CircleUserIcon.src,
    },
];

export function BottomNav({ currentPath, onNavigate }: BottomNavProps) {
    return (
        <NavContainer>
            <NavList>
                {NAV_ITEMS.map((item) => {
                    const isActive = currentPath === item.path || currentPath.startsWith(item.path);
                    return (
                        <NavItemContainer
                            key={item.path}
                            onClick={() => onNavigate(item.path)}
                            isActive={isActive}
                        >
                            <IconWrapper isActive={isActive}>
                                <MaskedIcon src={item.iconFn} />
                            </IconWrapper>
                            <Label isActive={isActive}>{item.label}</Label>
                        </NavItemContainer>
                    );
                })}
            </NavList>
        </NavContainer>
    );
}

const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-top: 1px solid ${colors.gray[200]};
  z-index: 100;
  display: flex;
  justify-content: center;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavList = styled.ul`
  display: flex;
  width: 100%;
  max-width: 600px; /* Adjust based on mobile constraint */
  height: 100%;
  padding: 0;
  margin: 0;
  list-style: none;
`;

const NavItemContainer = styled.li<{ isActive: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ isActive }) => (isActive ? colors.primary[500] : colors.gray[500])};
  transition: color 0.2s;

  &:active {
    opacity: 0.7;
  }
`;

const IconWrapper = styled.div<{ isActive: boolean }>`
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Use CSS Mask to colorize the external SVG
const MaskedIcon = styled.div<{ src: string }>`
  width: 100%;
  height: 100%;
  background-color: currentColor; /* Inherits color from parent */
  mask-image: url(${({ src }) => src});
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-image: url(${({ src }) => src});
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
`;

const Label = styled.span<{ isActive: boolean }>`
  font-size: 10px;
  font-weight: ${({ isActive }) => (isActive ? "600" : "400")};
  margin-top: 2px;
`;
