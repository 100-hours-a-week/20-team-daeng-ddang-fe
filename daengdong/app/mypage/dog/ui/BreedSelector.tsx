import { useState, useRef, useEffect } from 'react';
import { useBreedsQuery } from '@/features/dog/api/useBreedsQuery';
import { Input } from '@/shared/components/Input/Input';
import { BreedList, BreedItem } from './styles';

interface BreedSelectorProps {
    initialBreedName?: string;
    currentBreedId?: number;
    onSelect: (breedId: number, breedName: string, isAuto?: boolean) => void;
    disabled?: boolean;
}

export function BreedSelector({ initialBreedName, currentBreedId, onSelect, disabled }: BreedSelectorProps) {
    const [searchKeyword, setSearchKeyword] = useState(initialBreedName || '');
    const [isListOpen, setIsListOpen] = useState(false);
    const { data: breedList } = useBreedsQuery(searchKeyword);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [prevInitialBreedName, setPrevInitialBreedName] = useState(initialBreedName);

    // 초기 입력값 변경 시 검색어 동기화
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

    // 외부 클릭 시 드롭다운 닫힘
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
