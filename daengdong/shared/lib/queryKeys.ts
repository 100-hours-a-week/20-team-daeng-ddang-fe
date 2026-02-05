export const queryKeys = {
    userInfo: 'userInfo',
    userInfoCombined: ['user', 'info'] as const,
    dogInfo: 'dogInfo',
    myPageSummary: 'myPageSummary',
    breeds: 'breeds',
    walks: 'walks',
    walk: (walkId: number) => ['walk', walkId] as const,
};
