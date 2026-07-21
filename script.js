document.addEventListener('DOMContentLoaded', () => {
    initScrollEffects();
    fetchQiitaNews();
    initScrollAnimations();
    fetchAndRenderOSS();
});

function initScrollEffects() {
    const header = document.querySelector('.header-wrapper');

    window.addEventListener('scroll', () => {
        const isScrolled = window.scrollY > 10;
        header.classList.toggle('scrolled', isScrolled);
        document.body.classList.toggle('scrolled', isScrolled);
    });
}

function fetchQiitaNews() {
    const rssUrl = "https://qiita.com/tsukino_/feed";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const newsList = document.getElementById('news-list');

    if (!newsList) return;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                newsList.innerHTML = '';
                data.items.slice(0, 5).forEach(item => {
                    const date = item.pubDate.split(' ')[0];
                    const li = document.createElement('li');
                    li.innerHTML = `
                        <span class="news-date">${date}</span>
                        <a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                    `;
                    newsList.appendChild(li);
                });
            } else {
                newsList.innerHTML = '<li>ニュースの取得に失敗しました。</li>';
            }
        })
        .catch(() => {
            newsList.innerHTML = '<li>読み込みエラーが発生しました。</li>';
        });
}

function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const staticTargets = document.querySelectorAll('.news-section, .about-section, .work-card');
    staticTargets.forEach(target => {
        target.classList.add('fade-in-up');
        observer.observe(target);
    });

    return observer;
}

async function fetchAndRenderOSS() {
    const ossRepos = [
        {
            path: "tsukinokun/TsukinoEventBus",
            tech: "C++",
            description: "C++17 向けの軽量イベントバスライブラリです。<br>RAII による安全な購読管理、優先度制御、継承対応、コールバック更新などをサポートしています。",
            qiitaUrl: "https://qiita.com/tsukino_/items/58d449d52fb9acaac2d7"
        },
        {
            path: "tsukinokun/TsukinoRegistryFactory",
            tech: "C++",
            description: "文字列キーから任意のクラスを自動生成できる軽量ヘッダーオンリーの C++ ライブラリです。<br> クラスをマクロで登録するだけで、静的初期化のタイミングで自動的にファクトリへ登録され、インスタンス生成も容易です。",
            qiitaUrl: "https://qiita.com/tsukino_/items/0b4dbe071b90c739023d"
        },
    ];

    const ossContainer = document.getElementById("oss-projects-container");
    if (!ossContainer) return;

    const observer = initScrollAnimations();

    try {
        const articles = await Promise.all(
            ossRepos.map(async (repoInfo, index) => {
                try {
                    const response = await fetch(`https://api.github.com/repos/${repoInfo.path}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();

                    const article = document.createElement("article");
                    article.className = "work-card fade-in-up";

                    if (index % 2 !== 0) {
                        article.classList.add("reverse");
                    }

                    const iconSrc = `https://opengraph.githubassets.com/1/${repoInfo.path}`;

                    const qiitaLink = repoInfo.qiitaUrl
                        ? `<a href="${repoInfo.qiitaUrl}" class="work-link qiita-link" target="_blank" rel="noopener noreferrer">
                            <img src="images/QiitaIcon.png" alt="Qiita" style="width:16px; height:16px; vertical-align:middle; margin-right:5px;">
                                解説記事
                           </a>`
                        : "";

                    article.innerHTML = `
                        <div class="work-visual oss-icon-wrapper">
                            <a href="${data.html_url}" target="_blank" rel="noopener noreferrer">
                                <img src="${iconSrc}" alt="${data.name} Preview" class="oss-main-icon" onerror="this.src='images/GithubIcon.png'">
                            </a>
                        </div>
                        <div class="work-text">
                            <h3 class="work-title">${data.name}</h3>
                            <p class="work-tech"><strong>Tech Stack:</strong> ${repoInfo.tech}</p>
                            <div class="work-links-area">
                                <a href="${data.html_url}" class="work-link" target="_blank" rel="noopener noreferrer">GitHub Link</a>
                                ${qiitaLink}
                            </div>
                            <p class="work-desc">${repoInfo.description}</p>
                        </div>
                    `;

                    return article;
                } catch (error) {
                    console.error(`Failed to fetch repo ${repoInfo.path}:`, error);
                    return null;
                }
            })
        );

        articles.forEach(article => {
            if (article) {
                ossContainer.appendChild(article);
                observer.observe(article);
            }
        });
    } catch (error) {
        console.error('Failed to render OSS projects:', error);
        ossContainer.innerHTML = '<p class="error-message">OSSプロジェクトの読み込みに失敗しました。</p>';
    }
}
