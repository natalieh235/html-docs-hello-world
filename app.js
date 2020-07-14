function handle(event){

    event.stopPropagation();
    event.preventDefault();
    console.log('---- handle ---');


var myform = document.getElementById('myform');

    console.log('---- myform ---'+myform);
    var payload = new FormData(myform);
    console.log('---- handle completed---');

    $.ajax({
        type: "POST",
        url: "https://songrecapp.azurewebsites.net/api/SongRecTrigger",
        crossDomain: true,
        data: payload,
        contentType: false,
        processData: false,

        success: function (resp) {
            console.log(resp);
            var data = JSON.parse(resp);
            console.log(data.result);

            data = data.result[0];
            console.log(data);
            var emotion = data.faceAttributes.emotion;

            var resultString = `

            <h3>Emotions in the image:</h3><br />
            <p>anger: ${emotion.anger}</p>
            <p>contempt: ${emotion.contempt}</p>
            <p>disgust: ${emotion.disgust}</p>
            <p>fear: ${emotion.fear}</p>
            <p>happiness: ${emotion.happiness}</p>
            <p>neutral: ${emotion.neutral}</p>
            <p>sadness: ${emotion.sadness}</p>
            <p>surprise: ${emotion.surprise}</p>
            `;

            $('#emotion').html(resultString);
        },

        error: function (err) {
            console.log('---ERROR: '+err);
        }
    });
}


function clearForm(){
    document.getElementById('myform').reset();
    document.getElementById('emotion').innerHTML = '';

}


//spotify api call
const APIController = (function() {
    
    const clientId = 'f31f7be4fafb4177848cea89d05606d1';
    const clientSecret = 'c55105a02af9405fb2bb5e77ec671b43';

    // private methods
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }

    const _getGenres = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=en_US`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    const _getRecommendations = async(token, trackEndPoint, emotionData) => {
        const limit = 1;
        console.log('track end point: ' + trackEndPoint);
        // const arrayTracks = await _getTrack(token, tracksEndPoint);
        // console.log('array tracks: ' + arrayTracks);
        let seedTracks = "";
        // arrayTracks.forEach(el => seedTracks = seedTracks + el.id + "%2C");
        // seedTracks = seedTracks.substring(0, seedTracks.length-3);
        

        const valence = emotionData.happiness + emotionData.surprise - 
        emotionData.sadness - emotionData.disgust - emotionData.anger - emotionData.contempt - emotionData.fear;
        const minPopularity = "50";
        
        console.log('seed tracks: ' + seed_tracks);
        const result = await fetch
        (`https://api.spotify.com/v1/recommendations?limit=${limit}&seed_tracks=${seed_tracks}
        &min_popularity=${minPopularity}&target_valence=${valence}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        console.log('before call');
        const data = await result.json();
        console.log(data);
        console.log('track: ' + data.tracks[0]);
        return data.tracks[0];

    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        },
        getRecommendations(token, trackEndPoint){
            return _getRecommendations(token, trackEndPoint);
        }
    }
})();

// UI Module
const UIController = (function() {

    //object to hold references to html selectors
    const DOMElements = {
        //selectGenre: '#select_genre',
        //selectPlaylist: '#select_playlist',
        buttonSubmit: '#songbutton',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        //divSonglist: '.song-list'
    }

    //public methods
    return {

        //method to get input fields
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // need methods to create select list option
        /*createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // need method to create a track list group item 
        createTrack(id, name, url) {
            const html = `<a href="${url}" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        }, */

        // need method to create the song detail
        createTrackDetail(img, title, artist) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // any time user clicks a new song, we need to clear out the song detail div
            detailDiv.innerHTML = '';

            const html = 
            `
            <div class="songdisplay">
                <img src="${img}" alt="">        
            </div>
            <div class="songdisplay">
                <label for="Genre" class="form-label col-sm-12">${title}:</label>
            </div>
            <div class="display">
                <label for="artist" class="form-label col-sm-12">By ${artist}:</label>
            </div> 
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        /*resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        }, */
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // get input field object ref
    const DOMInputs = UICtrl.inputField();

    const loadToken = async() => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        UICtrl.storeToken(token);
    }

    // get genres on page load
    /*const loadGenres = async () => {
        //get the token
        const token = await APICtrl.getToken();           
        //store the token onto the page
        UICtrl.storeToken(token);
        //get the genres
        const genres = await APICtrl.getGenres(token);
        //populate our genres select element
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    // create genre change event listener
    DOMInputs.genre.addEventListener('change', async () => {
        //reset the playlist
        UICtrl.resetPlaylist();
        //get the token that's stored on the page
        const token = UICtrl.getStoredToken().token;        
        // get the genre select field
        const genreSelect = UICtrl.inputField().genre;       
        // get the genre id associated with the selected genre
        const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
        // ge the playlist based on a genre
        const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
        // create a playlist list item for every playlist returned
        playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
    }); */
     

    // create submit button click event listener
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        const token = UICtrl.getStoredToken().token;      
    
        // set the track endpoint
        const tracksEndpoint = "https://api.spotify.com/v1/playlists/37i9dQZF1DXcBWIGoYBM5M/tracks"
        // get the list of tracks
        const tracks = await APICtrl.getTracks(token, tracksEndpoint);
        console.log(tracks);
        //const track = await APICtrl.getTrack(token, tracks[0].href);
        // create a track list item
        // const recommendedTrack = await APICtrl.getRecommendations(token, tracksEndpoint);
        // UICtrl.createTrackDetail(recommendedTrack.album.images[2].url, 
        //     recommendedTrack.name, recommendedTrack.artists[0].name);
        //tracks.forEach(el => UICtrl.createTrack(el.track.id, el.track.name, el.track.href))
        
    });

    // create song selection click event listener
    /*DOMInputs.tracks.addEventListener('click', async (e) => {
        // prevent page reset
        e.preventDefault();
        UICtrl.resetTrackDetail();
        // get the token
        const token = UICtrl.getStoredToken().token;
        // get the track endpoint
        const trackEndpoint = e.target;
        //get the track object
        const track = await APICtrl.getTrack(token, trackEndpoint.href);
        // load the track details
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);

        

    });    */ 

    return {
        init() {
            console.log('App is starting');
        }
    }

})(UIController, APIController);

APPController.init();

