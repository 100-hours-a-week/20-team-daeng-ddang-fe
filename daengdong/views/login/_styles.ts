import styled from '@emotion/styled';
import { colors, spacing } from '@/shared/styles/tokens';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100svh;
  background-color: white;
  position: relative;
`;

export const HeaderWrapper = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
`;

export const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${spacing[4]}px;
  margin-top: -60px;
`;

export const BrandTitle = styled.h1`
  font-family: var(--font-cafe24), sans-serif;
  font-size: 24px;
  font-weight: 500;
  color: ${colors.primary[600]}; 
  margin-bottom: ${spacing[4]}px;
  opacity: 0.8;
  text-align: center;
  width: 100%;
`;

export const BrandText = styled.h2`
  font-family: sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: black;
  margin-bottom: ${spacing[4]}px;
  opacity: 0.8;
  text-align: center;
  width: 100%;
`;

export const LogoImage = styled.img`
  width: 240px;
  height: auto;
  margin-top: ${spacing[8]}px;
  margin-bottom: ${spacing[8]}px;
`;

export const ButtonWrapper = styled.div`
  width: 100%;
  max-width: 320px;
  padding-bottom: 48px;      
  margin-top: auto;
  margin: 0 auto;    

  @media (min-height: 700px) {
    margin-top: 0;
  }
`;

export default function Style() { return null; }
