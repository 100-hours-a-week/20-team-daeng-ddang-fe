import styled from '@emotion/styled';
import { colors, radius, spacing } from '@/shared/styles/tokens';
import { ReactNode } from 'react';

interface MyPageMenuItemProps {
  id: string;
  label: string;
  icon?: ReactNode;
  isDestructive?: boolean;
  onClick: () => void;
}

interface MyPageMenuProps {
  items: MyPageMenuItemProps[];
}

export const MyPageMenuList = ({ items }: MyPageMenuProps) => {
  if (!items || items.length === 0) return null;

  return (
    <ListContainer>
      {items.map((item) => (
        <MenuItem
          key={item.id}
          onClick={item.onClick}
          isDestructive={item.isDestructive}
        >
          <Content>
            {item.icon && <IconWrapper>{item.icon}</IconWrapper>}
            <Label isDestructive={item.isDestructive}>{item.label}</Label>
          </Content>
          <ArrowIcon>{'>'}</ArrowIcon>
        </MenuItem>
      ))}
    </ListContainer>
  );
};

const ListContainer = styled.ul`
  display: flex;
  flex-direction: column;
  padding: 0 ${spacing[4]}px;
  margin-top: ${spacing[4]}px;
  list-style: none;
`;

const MenuItem = styled.li<{ isDestructive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing[4]}px 0;
  border-bottom: 1px solid ${colors.gray[200]};
  cursor: pointer;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    opacity: 0.7;
    background-color: ${colors.gray[50]};
  }
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[3]}px;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gray[700]};
`;

const Label = styled.span<{ isDestructive?: boolean }>`
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.isDestructive ? colors.semantic.error : colors.gray[900]};
`;

const ArrowIcon = styled.span`
  font-size: 14px;
  color: ${colors.gray[500]};
  font-family: inherit;
`;
