document.addEventListener('DOMContentLoaded', () => {
    // ==========================================================================
    // スクロールによるヘッダーとbodyの背景色変更
    // ==========================================================================
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header-wrapper');
        const body = document.body;

        if (window.scrollY > 10) {
            header.classList.add('scrolled');
            body.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            body.classList.remove('scrolled');
        }
    });

    // ==========================================================================
    // Qiitaの最新記事を取得して表示
    // ==========================================================================
    const rssUrl = "https://qiita.com/tsukino_/feed";
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const newsList = document.getElementById('news-list');

    if (newsList) {
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
            .catch(error => {
                console.error('Error:', error);
                newsList.innerHTML = '<li>読み込みエラーが発生しました。</li>';
            });
    }

    // ==========================================================================
    // スクロール時のふわっと現れるアニメーション（共通設定）
    // ==========================================================================
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -50px 0px', // 画面の下から50px入った時に発動
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active'); // activeクラスを付与
                observer.unobserve(entry.target);     // 一度表示したら監視を止める
            }
        });
    }, observerOptions);

    // 静的な要素（HTMLに最初からあるセクションなど）を監視開始
    const staticTargets = document.querySelectorAll('.news-section, .about-section, .work-card');
    staticTargets.forEach(target => {
        target.classList.add('fade-in-up'); // 初期クラスを付与
        observer.observe(target);
    });

    // ==========================================================================
    // GitHub APIからOSS Projectsを動的取得して描画
    // ==========================================================================
    // 表示したいリポジトリ名と、個別に書きたい詳細な技術スタックを設定
    const ossRepos = [
        { path: "tsukinokun/TsukinoEventBus", tech: "C++" },
        { path: "tsukinokun/TsukinoRegistryFactory", tech: "C++" },
    ];

    const ossContainer = document.getElementById("oss-projects-container");

    if (ossContainer) {
        async function fetchAndRenderOSS() {
            const fetchPromises = ossRepos.map(async (repoInfo, index) => {
                try {
                    const response = await fetch(`https://api.github.com/repos/${repoInfo.path}`);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    const data = await response.json();

                    // カード(article)要素を作成
                    const article = document.createElement("article");
                    article.className = "work-card fade-in-up"; // アニメーション用クラスも付与

                    // 奇数番目のカードは左右反転
                    if (index % 2 !== 0) {
                        article.classList.add("reverse");
                    }

                    // GitHub上のメイン言語を基準に画像パスを設定（エラー時はGitHubアイコン）
                    const mainLanguage = data.language || "C++";
                    const iconSrc = data.open_graph_image_url || `images/${mainLanguage}Icon.png`;

                    // 内部HTMLの構築（GitHubからスター数や説明文を動的流し込み）
                    article.innerHTML = `
                        <div class="work-visual oss-icon-wrapper">
                            <img src="${iconSrc}" alt="${mainLanguage} Logo" class="oss-main-icon" onerror="this.src='images/GithubIcon.png'">
                            <div class="oss-stats">
                                <span class="oss-stat-item">⭐ ${data.stargazers_count}</span>
                            </div>
                        </div>
                        <div class="work-text">
                            <h3 class="work-title">${data.name}</h3>
                            <p class="work-tech"><strong>Tech Stack:</strong> ${repoInfo.tech}</p>
                            <div class="work-links-area">
                                <a href="${data.html_url}" class="work-link" target="_blank">GitHub Link</a>
                            </div>
                            <p class="work-desc">
                                ${data.description || "説明文が設定されていません。"}
                            </p>
                        </div>
                    `;

                    return article;
                } catch (error) {
                    console.error(`Failed to fetch repo ${repoInfo.path}:`, error);
                    return null;
                }
            });

            // 全てのリポジトリの非同期処理が終わったら一括でコンテナに追加
            const articles = await Promise.all(fetchPromises);
            articles.forEach(article => {
                if (article) {
                    ossContainer.appendChild(article);
                    // 動的に追加した直後に、スクロールアニメーションの監視対象に追加する
                    observer.observe(article);
                }
            });
        }

        fetchAndRenderOSS();
    }
});