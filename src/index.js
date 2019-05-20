import './style.css';
import './img/empty.png';

const apiKey = 'b738ce0bd89a4db9a945452e0e1522b1';

const defaultSource = '';
const defaultQuery = '';
const defaultCountry = 'us';

let currentSource = defaultSource;
let currentQuery = defaultQuery;
let currentCountry = defaultCountry;
let currentPage = 0;
let currentUrl = 'https://newsapi.org/v2/top-headlines?' +
    currentSource + currentQuery + currentCountry +
    'pageSize=5&page=' + currentPage + '&apiKey=' + apiKey;

loadSources();
loadMore();

function show(node) {
    document.getElementById(node).style.display = 'flex';
}

function hide(node) {
    document.getElementById(node).style.display = 'none';
}

document.querySelector('.logo').addEventListener('click', () => {
    currentPage = 0;
    currentQuery = defaultQuery;
    currentCountry = defaultCountry;
    currentSource = defaultSource;
    document.querySelector('.news-resource-name').innerHTML = '';
    document.querySelector('#news-block').innerHTML = '';
    loadMore();
});

document.querySelector('.load-more').addEventListener('click', () => {
    loadMore();
});

document.querySelector('#btn').addEventListener('click', () => {
    const filterInput = document.querySelector('#search');
    findNewsByQuery(filterInput.value);
});

document.onkeydown = (function (e) {
    if (e.keyCode == 13 && document.getElementById("search").offsetHeight) {
        document.getElementById("btn").click();
        document.getElementById("search").value = "";
    }
});

function loadSources() {
    const url = 'https://newsapi.org/v2/sources?apiKey=' + apiKey;
    const request = new Request(url);
    fetch(request)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const btns = document.querySelector("nav");
            for (let i = 0; i < data.sources.length; i++) {
                const item = document.querySelector('#btn-template');
                const btn = item.content.cloneNode(true).querySelector('button');
                btn.textContent = data.sources[i].name;
                btn.onclick = function () {
                    const sourceText = document.querySelector('.news-resource-name');
                    sourceText.textContent = data.sources[i].name;
                    findNewsBySource(data.sources[i].id);
                };
                btns.appendChild(btn);
            }
        });
}

function findNewsBySource(source) {
    currentPage = 0;
    currentQuery = defaultQuery;
    currentCountry = '';
    currentSource = source;
    document.querySelector('#news-block').innerHTML = '';
    loadMore();
}

function findNewsByQuery(query) {
    currentPage = 0;
    // currentSource = defaultSource;
    currentCountry = '';
    currentQuery = query;
    document.querySelector('#news-block').innerHTML = '';
    loadMore();
}


function loadMore() {
    currentUrl = 'https://newsapi.org/v2/top-headlines?' +
        `country=${currentCountry}&` + `sources=${currentSource}&` + `q=${currentQuery}&` +
        `pageSize=5&page=${++currentPage}&` + 'apiKey=' + apiKey;
    const request = new Request(currentUrl);
    let newsCount = 0;
    fetch(request)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            newsCount = data.articles.length;
            if (newsCount < 5) {
                hide('load-more');
                if (newsCount === 0) {
                    show("not-found");
                    return;
                }
                else
                    hide("not-found");
            } else {
                hide("not-found");
                show('load-more');
            }
            const block = createNewsBlock(newsCount, data.articles);
            const newsBlock = document.querySelector('.news');
            newsBlock.appendChild(block);
        });
    return newsCount;
}

function createNewsBlock(newsCount, jsonDataArticles) {
    const newsBlock = document.createDocumentFragment();
    const news_item = document.querySelector('#news-template');
    for (let i = 0; i < newsCount; i++) {
        const item = news_item.content.cloneNode(true).querySelector('article');
        const child = fillTemplate(item, jsonDataArticles[i]);
        newsBlock.appendChild(child);
    }
    return newsBlock;
}

function fillTemplate(item, jsonData) {
    if (jsonData.urlToImage === null || jsonData.urlToImage === '')
        jsonData.urlToImage = 'img/empty.png';
    item.querySelector('.photo').setAttribute('src', jsonData.urlToImage);
    item.querySelector('.title').textContent = jsonData.title;
    item.querySelector('.description').textContent = jsonData.description;
    item.querySelector('.title').setAttribute('href', jsonData.url);
    return item;
}
