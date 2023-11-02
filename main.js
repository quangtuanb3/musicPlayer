const eWrapper = document.getElementById("wrapper");
const eContent = document.getElementById("content");
const songUrl = 'http://localhost:3300/songs';
const eAddBtn = document.getElementById("addBtn")
const eInsertBtn = document.getElementById("insertBtn");
const ePlayCurrentBtn = document.getElementById("playCurrentBtn");
const ePlayALlBtn = document.getElementById("playAllBtn");
const eCountList = document.getElementById("countList");
const eSearchForm = document.getElementById("form-search");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");

let totalSongs = 0;

const pagination = {
    page: 1,
    search: "",
    items: 6
}

function makePlayList() {
    let playlist = [];
    return {
        add({ id, title }) {
            playlist.push({ id, title });
            this.save();
        },
        insert({ id, title }) {
            playlist.unshift({ id, title });
            this.save();
        },
        getAll() {
            return playlist;
        },
        save() {
            localStorage.setItem("playlist", JSON.stringify(playlist));
        },
        load() {
            if (localStorage.getItem("playlist")) {
                playlist = JSON.parse(localStorage.getItem("playlist"));
            }
        }

    }
}
let playlist = makePlayList();

async function renderSongs(songs) {
    let songHTML = '';

    songs.map((song) => {
        songHTML +=
            `
            <div class="song-card" id="${song.youtubeId}" data-title="${song.title}">
                <img src="${song.avatar}" alt="${song.title}" class="song-poster">
                <h2 class="song-title">${song.title}</h2>
               <p class="singer">${song.singer.nameSlug}</p>
            </div>
            `
    })
    eContent.innerHTML = songHTML;
}




async function getSongs(pagination) {
    const response = await fetch(`http://localhost:3300/songs?q=${pagination.search}&_page=${pagination.page}&_limit=${pagination.items}`);
    const songs = await response.json();
    return songs;
}
async function getTotalSongs() {
    const response = await fetch(`http://localhost:3300/songs?q=${pagination.search}`);
    const songs = await response.json();
    return songs.length;
}

function handleCardClick() {
    eSongCards = document.getElementsByClassName("song-card");
    Array.from(eSongCards).forEach((eCard) => {
        eCard.onclick = () => {
            eAddBtn.setAttribute("data-id", eCard.id);
            eAddBtn.setAttribute("data-title", eCard.getAttribute("data-title"));
            eInsertBtn.setAttribute("data-id", eCard.id);
            eInsertBtn.setAttribute("data-title", eCard.getAttribute("data-title"));
            ePlayCurrentBtn.setAttribute("data-id", eCard.id);
            ePlayCurrentBtn.setAttribute("data-title", eCard.getAttribute("data-title"));
            $('#staticBackdrop').modal('show');
        }
    })
}

function handleAddBtn() {
    eAddBtn.onclick = (event) => {
        const id = event.target.getAttribute("data-id");
        const title = event.target.getAttribute("data-title");

        if (!playlist.getAll().find((song) => song.id === id)) {
            playlist.add({ id, title });
        } else {
            alert("This song has already in your playlist")
        }

        showCount();
        $('#staticBackdrop').modal('hide');
    }
}
function handleInsertBtn() {
    eInsertBtn.onclick = (event) => {
        const id = event.target.getAttribute("data-id");
        const title = event.target.getAttribute("data-title");
        if (!playlist.getAll().find((song) => song.id === id)) {
            console.log(playlist.getAll().find((song) => song.id === id))
            playlist.insert({ id, title });
        } else {
            alert("This song has already in your playlist")
        }
        showCount();
        $('#staticBackdrop').modal('hide');
    }
}
function handlePlayCurrentBtn() {
    ePlayCurrentBtn.onclick = (event) => {
        const id = event.target.getAttribute("data-id");
        const title = event.target.getAttribute("data-title");
        if (!playlist.getAll().find((song) => song.id === id)) {
            playlist.add({ id, title });
        }
        showCount();
        $('#staticBackdrop').modal('hide');
        window.location.href = `http://127.0.0.1:5500/player.html?songId=${id}`;
    }
}

function showCount() {
    eCountList.innerText = playlist.getAll().length;
}

function handlePlaylistClick() {
    document.getElementById("playlist-nav").addEventListener("click", () => {
        if (playlist.getAll().length == 0) {
            alert("Please add songs to play list first!");
        } else {
            window.location.href = 'http://127.0.0.1:5500/player.html';
        }

    })
}

const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
        const context = this
        const args = arguments
        clearTimeout(debounceTimer)
        debounceTimer
            = setTimeout(() => func.apply(context, args), delay)
    }
}

function handleSearch() {
    eSearchForm.onsubmit = (e) => {
        e.preventDefault();
    }
    eSearchForm.oninput = debounce(async () => {
        pagination.search = eSearchForm.search.value;
        const songs = await getSongs(pagination)
        renderSongs(songs);
    }, 1000)
}



async function displayData(pagination) {
    let songs = await getSongs(pagination);
    renderSongs(songs)
    prevButton.disabled = pagination.page === 1;
    nextButton.disabled = (pagination.page * pagination.items) >= totalSongs;
}

function handlePageBtn() {
    console.log("handle page btn");
    console.log(pagination)
    prevButton.addEventListener("click", () => {
        if (pagination.page > 1) {
            pagination.page--;
            displayData(pagination);
        }
    });

    nextButton.addEventListener("click", () => {
        const startIndex = (pagination.page - 1) * pagination.items;
        if (startIndex + pagination.items < totalSongs) {
            pagination.page++;
            displayData(pagination);
        }
    });
}





window.onload = async () => {
    playlist.load();
    totalSongs = await getTotalSongs();
    await displayData(pagination);
    handleCardClick();
    handleAddBtn();
    handleInsertBtn();
    handlePlayCurrentBtn();
    showCount();
    handlePlaylistClick();
    handleSearch();
    handlePageBtn();
}
