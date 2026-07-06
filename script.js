window.addEventListener('scroll', () => {
    const header = document.querySelector('.header-wrapper');
    // bodyにもクラスを付与
    const body = document.body;

    if (window.scrollY > 10) {
        header.classList.add('scrolled');
        body.classList.add('scrolled'); // ここを追加
    } else {
        header.classList.remove('scrolled');
        body.classList.remove('scrolled'); // ここを追加
    }
});