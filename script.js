window.addEventListener('scroll', () => {
    const header = document.querySelector('.header-wrapper');
    // bodyにもクラスを付与
    const body = document.body;

    if (window.scrollY > 10) {
        header.classList.add('scrolled');
        body.classList.add('scrolled'); 
    } else {
        header.classList.remove('scrolled');
        body.classList.remove('scrolled');
    }
});

// Qiitaの最新記事を取得してニュース欄に表示する
document.addEventListener('DOMContentLoaded', () => {
    const rssUrl = "https://qiita.com/tsukino_/feed"; // QiitaのフィードURL
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const newsList = document.getElementById('news-list');

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                // リストをクリア
                newsList.innerHTML = '';
                
                // 最新5件を取り出して表示
                data.items.slice(0, 5).forEach(item => {
                    // 日付を「YYYY/MM/DD」形式に変換
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
});