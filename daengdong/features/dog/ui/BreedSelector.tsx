import { useState, useRef, useEffect, useMemo } from 'react';
import { useBreedsQuery } from '@/features/dog/api/useBreedsQuery';
import { Input } from '@/shared/components/Input/Input';
import styled from '@emotion/styled';
import { colors, radius } from '@/shared/styles/tokens';

interface BreedSelectorProps {
    initialBreedName?: string;
    currentBreedId?: number;
    onSelect: (breedId: number, breedName: string, isAuto?: boolean) => void;
    disabled?: boolean;
}

export function BreedSelector({ initialBreedName, currentBreedId, onSelect, disabled }: BreedSelectorProps) {
    const [searchKeyword, setSearchKeyword] = useState(initialBreedName || '');
    const [isListOpen, setIsListOpen] = useState(false);

    const { data: allBreeds } = useBreedsQuery();

    const breedList = useMemo(() => {
        if (!allBreeds) return [];
        const keyword = searchKeyword.trim().toLowerCase();
        if (!keyword) return allBreeds;
        return allBreeds.filter(b => b.name.toLowerCase().includes(keyword));
    }, [allBreeds, searchKeyword]);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [prevInitialBreedName, setPrevInitialBreedName] = useState(initialBreedName);

    if (initialBreedName !== prevInitialBreedName) {
        setPrevInitialBreedName(initialBreedName);
        setSearchKeyword(initialBreedName || '');
    }

    // 견종 이름만 있고 id 없는 상태 -> breedList에서 찾아서 id 설정
    useEffect(() => {
        if (currentBreedId && currentBreedId !== 0) return;
        if (!breedList || !initialBreedName) return;

        const matched = breedList.find((breed) => breed.name === initialBreedName);
        if (matched) {
            onSelect(matched.breedId, matched.name, true);
        }
    }, [breedList, initialBreedName, currentBreedId, onSelect]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsListOpen(false);
                if (initialBreedName) {
                    setSearchKeyword(initialBreedName);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [initialBreedName]);

    const handleSelect = (id: number, name: string) => {
        onSelect(id, name);
        setSearchKeyword(name);
        setIsListOpen(false);
    };

    return (
        <div style={{ position: 'relative' }} ref={containerRef}>
            <Input
                value={searchKeyword}
                onChange={(e) => {
                    setSearchKeyword(e.target.value);
                    setIsListOpen(true);
                }}
                onFocus={() => {
                    setSearchKeyword('');
                    setIsListOpen(true);
                }}
                placeholder="견종 검색 (목록에서 선택해주세요)"
                disabled={disabled}
                ref={inputRef}
            />
            {isListOpen && breedList && breedList.length > 0 && (
                <BreedList>
                    {breedList.map((breed) => (
                        <BreedItem
                            key={breed.breedId}
                            onClick={() => handleSelect(breed.breedId, breed.name)}
                        >
                            {breed.name}
                        </BreedItem>
                    ))}
                </BreedList>
            )}
        </div>
    );
}

const BreedList = styled.ul`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${colors.gray[200]};
  border-radius: ${radius.md};
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0;
`;

const BreedItem = styled.li`
  padding: 12px 16px;
  font-size: 14px;
  color: ${colors.gray[900]};
  cursor: pointer;
  border-bottom: 1px solid ${colors.gray[200]};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${colors.gray[50]};
  }
`;