export const users = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'hashed_password_1',
        profile: {
            bio: 'Software developer and tech enthusiast.'
        },
        posts: [
            {
                title: 'My First Post',
                content: 'This is the content of my first post.',
                createdAt: new Date(),
            },
            {
                title: 'Another Post',
                content: 'This is some more content.',
                createdAt: new Date(),
            },
        ],
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password: 'hashed_password_2',
        profile: {
            bio: 'Designer and artist.',
        },
        posts: [
            {
                title: 'Design Tips',
                content: 'Here are some design tips.',
                createdAt: new Date(),
            },
        ],
    },
    {
        name: 'Alex Johnson',
        email: 'alex.johnson@example.com',
        password: 'hashed_password_3',
        profile: {
            bio: '資深後端工程師，熱愛雲端技術。',
        },
        posts: [
            {
                title: '雲端部署最佳實踐',
                content: '本文將分享我在雲端部署方面的經驗和技巧...',
                createdAt: new Date(),
            },
            {
                title: 'Kubernetes 入門指南',
                content: 'Kubernetes 是一個強大的容器編排平台...',
                createdAt: new Date(),
            }
        ],
    },
    {
        name: 'Mei Li',
        email: 'mei.li@example.com',
        password: 'hashed_password_4',
        profile: {
            bio: '全端開發者，專注於使用者體驗設計。',
        },
        posts: [
            {
                title: 'React Hooks 完全解析',
                content: '本文深入探討 React Hooks 的使用方式與優勢...',
                createdAt: new Date(),
            }
        ],
    },
    {
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@example.com',
        password: 'hashed_password_5',
        profile: {
            bio: '數據分析師和機器學習愛好者。',
        },
        posts: []
    },
    {
        name: '田中健太',
        email: 'kenta.tanaka@example.com',
        password: 'hashed_password_6',
        profile: {
            bio: '行動應用開發專家，熱愛Swift和Kotlin。',
        },
        posts: [
            {
                title: 'iOS 14 新功能介紹',
                content: 'Apple在WWDC上發布了iOS 14...',
                createdAt: new Date(),
            },
            {
                title: '行動應用性能優化技巧',
                content: '本文將分享一些提升行動應用性能的關鍵技巧...',
                createdAt: new Date(),
            }
        ],
    }
];