document.addEventListener('DOMContentLoaded', () => {
    // 1. スクロールによるヘッダーとbodyの背景色変更
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

    // 2. Qiitaの最新記事を取得して表示
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

    // 3. スクロール時のふわっと現れるアニメーション
    const targets = document.querySelectorAll('.news-section, .about-section, .work-card');

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

    targets.forEach(target => {
        target.classList.add('fade-in-up'); // 初期クラスを付与
        observer.observe(target);           // 監視開始
    });
});