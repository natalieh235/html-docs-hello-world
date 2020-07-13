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
            console.log('---RESP: '+resp);
        },
        error: function (err) {
            console.log('---ERROR: '+err);
        }
    });
}