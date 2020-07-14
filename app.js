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