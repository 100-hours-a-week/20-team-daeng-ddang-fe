import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { colors, radius, spacing } from "@/shared/styles/tokens";
import { useRegionsQuery } from "@/features/user/api/useRegionsQuery";
import { Region } from "@/entities/user/model/types";
import { m, AnimatePresence } from "framer-motion";
import { SelectDropdown } from "@/shared/components/SelectDropdown";
import { Button } from "@/shared/components/Button/Button";

interface RegionSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (region: Region) => void;
}

export const RegionSelectionModal = ({ isOpen, onClose, onSelect }: RegionSelectionModalProps) => {
    // 도/시 
    const { data: provinces } = useRegionsQuery();
    const provinceOptions = provinces?.map(p => p.name) || [];

    const [selectedProvinceName, setSelectedProvinceName] = useState("");
    const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);

    // 시/군/구
    const { data: districts } = useRegionsQuery(selectedProvinceId || undefined);
    const districtOptions = districts?.map(d => d.name) || [];

    const [selectedDistrictName, setSelectedDistrictName] = useState("");
    const [selectedDistrictRegion, setSelectedDistrictRegion] = useState<Region | null>(null);

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setSelectedProvinceName("");
            setSelectedProvinceId(null);
            setSelectedDistrictName("");
            setSelectedDistrictRegion(null);
        }
    }, [isOpen]);

    const handleProvinceChange = (name: string) => {
        setSelectedProvinceName(name);
        setSelectedDistrictName("");
        setSelectedDistrictRegion(null);

        const province = provinces?.find(p => p.name === name)
        if (province) {
            setSelectedProvinceId(province.regionId);
        }
    };

    const handleDistrictChange = (name: string) => {
        setSelectedDistrictName(name);
        const district = districts?.find(d => d.name === name);
        if (district) {
            setSelectedDistrictRegion(district);
        }
    };

    const handleConfirm = () => {
        if (selectedDistrictRegion) {
            onSelect(selectedDistrictRegion);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <Overlay
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <ModalContainer
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <Header>
                        <Title>지역 선택</Title>
                        <CloseButton onClick={onClose}>✕</CloseButton>
                    </Header>

                    <Content>
                        <DropdownGroup>
                            <Label>시/도</Label>
                            <SelectDropdown
                                options={provinceOptions}
                                value={selectedProvinceName}
                                onChange={handleProvinceChange}
                                placeholder="시/도 선택"
                            />
                        </DropdownGroup>

                        <DropdownGroup>
                            <Label>시/군/구</Label>
                            <SelectDropdown
                                options={districtOptions}
                                value={selectedDistrictName}
                                onChange={handleDistrictChange}
                                placeholder="시/군/구 선택"
                                disabled={!selectedProvinceId}
                            />
                        </DropdownGroup>

                        <ButtonWrapper>
                            <Button
                                onClick={handleConfirm}
                                disabled={!selectedDistrictRegion}
                                fullWidth
                            >
                                확인
                            </Button>
                        </ButtonWrapper>
                    </Content>
                </ModalContainer>
            </Overlay>
        </AnimatePresence>
    );
};

const Overlay = styled(m.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContainer = styled(m.div)`
    background-color: white;
    width: 90%;
    max-width: 400px;
    border-radius: ${radius.lg};
    padding: ${spacing[4]}px;
    display: flex;
    flex-direction: column;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: ${spacing[4]}px;
`;

const Title = styled.h3`
    font-size: 18px;
    font-weight: 700;
    color: ${colors.gray[900]};
    margin: 0;
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    font-size: 20px;
    color: ${colors.gray[500]};
    cursor: pointer;
    padding: 4px;
`;

const Content = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[4]}px;
`;

const DropdownGroup = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${spacing[2]}px;
`;

const Label = styled.div`
    font-size: 14px;
    font-weight: 600;
    color: ${colors.gray[700]};
`;

const ButtonWrapper = styled.div`
    margin-top: ${spacing[2]}px;
`;
