const ePlayer = document.getElementById("player");
const eCountList = document.getElementById("countList");
const eRelativeVideo = document.getElementById("relativeVideo");
let songs = {};

function getCurrentSongId() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('songId');
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
        remove(id) {
            playlist = playlist.filter((song) => song.id != id)
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
const playlist = makePlayList();

function renderVideo(songId) {

    if (!playlist.getAll().find((song) => song.id === songId)) {
        return;
    }
    let frameHTML = `<iframe width="100%" height="410px" src="https://www.youtube.com/embed/${songId}" frameborder="0" allowfullscreen></iframe>`
    ePlayer.innerHTML = frameHTML;
}



function renderRelativeVideo() {
    let relativeVideoHTML = '';
    playlist.getAll().forEach((song, index) => {
        let active = '';
        if (!index) {
            active = "active";
        }

        relativeVideoHTML += `
                                <div class="${active} relative-song d-flex justify-content-between" id="${song.id}">
                                     <p id="song-${song.id}">${song.title}</p> 
                                     <span class="deleteBtn" data-id="${song.id}"><i class="fa fa-trash"></i></span>
                                </div>
        `
    })
    eRelativeVideo.innerHTML = relativeVideoHTML;
}
function handlePlayer() {
    let songId = getCurrentSongId();
    if (!songId) {
        songId = playlist.getAll()[0].id;
    }
    renderVideo(songId);
}
function showCount() {
    eCountList.innerText = playlist.getAll().length;
}

function handleClickRelativeSong() {
    relativeSongs = document.getElementsByClassName("relative-song");

    Array.from(relativeSongs).map(e => {
        e.onclick = () => {
            Array.from(relativeSongs).forEach(e => {
                e.classList.remove("active");

            })
            renderVideo(e.id);
            e.classList.add("active")
        }
    })
}

function handleDeleteBtn() {
    deleteBtns = document.getElementsByClassName("deleteBtn");
    Array.from(deleteBtns).map((e) => {
        e.onclick = (event) => {
            const songId = event.currentTarget.getAttribute("data-id")
            deleteSong(songId);

        }
    })
}
function deleteSong(id) {
    playlist.remove(id);
    renderRelativeVideo();
    handleDeleteBtn();
    showCount();
}

window.onload = async () => {
    playlist.load();
    showCount();
    handlePlayer();
    renderRelativeVideo();
    handleClickRelativeSong();
    handleDeleteBtn();
}