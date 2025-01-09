MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']]
    },
    svg: {
        fontCache: 'global'
    }
};

Fancybox.bind("[data-fancybox]", {
});


const toggleSwitch = document.querySelector('#darkModeSwitch');
const html = document.querySelector('html');
html.setAttribute('data-theme', "light");

function switchTheme(e) {
    if (e.target.checked) {
        html.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
}

toggleSwitch.addEventListener('change', switchTheme);