function initMap() {
    var locations = [
            {title: 'Spin SF', category: 'fun', location: {lat:37.7841864, lng:-122.4011821}, fs: '57293afc498e466374bca6ab'},
            {title: 'Smitten Ice Cream', category: 'food', location: {lat: 37.7763629, lng: -122.4241919}, fs: '4d964291daec224b08b9123e'},
            {title: 'Shalimar', category: 'food', location: {lat: 37.78615666889213, lng: -122.4130368232727}, fs: '42b21280f964a5206b251fe3'},
            {title: 'Golden Gate Bakery', category: 'food', location: {lat: 37.7963619, lng: -122.4068794}, fs: '4a2ac0fdf964a52049961fe3'},
            {title: 'Lers Ros Thai', category: 'food', location: {lat: 37.7847091, lng: -122.4175909}, fs: '4ebd985c6c257f09ae0c188e'},
            {title: 'Domo Sushi', category: 'food', location: {lat: 37.77603201110472, lng: -122.42610991001129}, fs: '49ce86fff964a520515a1fe3'},
            {title: 'Bi-Rite Creamery', category: 'food', location: {lat: 37.76146792837773, lng: -122.42573583842787}, fs: '45eaff58f964a5208e431fe3'},
            {title: 'Twin Peaks', category: 'fun', location: {lat: 37.76146792837773, lng: -122.44628977859259}, fs: '51ca3ecb7dd206231217f8bf'},
            {title: 'Mission Dolores Park', category: 'fun', location: {lat: 37.759754783810415, lng: -122.42745573335124}, fs: '4ab595e1f964a520877520e3'},
            {title: 'Little Skillet', category: 'food', location: {lat: 37.778835884569475, lng: -122.39402057443735}, fs: '4a0c561df964a52022751fe3'},
            {title: 'El Techo', category: 'bar', location: {lat: 37.756699, lng: -122.418971}, fs: '51896b72498e1bcc776ddaa8'},
            {title: 'Exploratorium', category: 'fun', location: {lat: 37.80086420601844, lng: -122.3985555768013}, fs: '4585a93ef964a520ac3f1fe3'},
            {title: 'In-N-Out Burger', category: 'food', location: {lat: 37.807766561156924, lng: -122.41843342781067}, fs: '43f08afdf964a520752f1fe3'},
            {title: 'California Academy of Sciences', category: 'fun', location: {lat: 37.76982548539413, lng: -122.46624265135708}, fs: '49cc413df964a5205a591fe3'},
            {title: 'San Francisco Botanical Garden', category: 'fun', location: {lat: 37.76770322074099, lng: -122.468851889468}, fs: '49daa91af964a5209f5e1fe3'},
            {title: 'HRD Coffee Shop', category: 'food', location: {lat: 37.780994437698176, lng: -122.39550311939907}, fs: '4a2937f2f964a52068951fe3'},
            {title: 'Asian Art Museum', category: 'fun', location: {lat: 37.780177691822274, lng: -122.41650543857212}, fs: '43601880f964a5202e291fe3'},
            {title: 'Super Duper Burger', category: 'food', location: {lat: 37.78483392804297, lng: -122.40353107452393}, fs: '5010936ce4b0abd8740f8fb7'},
            {title: 'Aquarium of the Bay', category: 'fun', location: {lat: 37.808713106114666, lng: -122.40964709673923}, fs: '49e4bcfaf964a52028631fe3'},
            {title: 'Mr Tipple\'s Recording Studio', category: 'bar', location: {lat: 37.776162247089964, lng: -122.41850754747897}, fs: '56170930498ec64a072b43b9'},
            {title: 'Yank Sing', category: 'food', location: {lat: 37.79255104281825, lng: -122.39309673921795}, fs: '4479910ef964a520d8331fe3'}],
        markers = [],
        defaultIcon = makeMarkerIcon('0091ff'),
        highlightedIcon = makeMarkerIcon('FFFFFF'),
        largeInfowindow = new google.maps.InfoWindow(),
        map = new google.maps.Map(document.getElementById('map'), {
            mapTypeControl: false
        }),
        clientId = 'HMBUAO54USWN0OPZ0NHIN4OH40FHWR5ZEVZC11K2DUXTKJ4L',
        clientSecret = 'BMDPRVH5ANGIWH1QBKWKRXCNYYRVLVQVWFTXQ33TQZBAJCRA',
        venuesAPI = 'https://api.foursquare.com/v2/venues/',
        cache = {};

    for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        marker.category = locations[i].category;
        marker.fs = locations[i].fs;
        addMarkerListeners(marker);
        locations[i].marker = marker;
        markers.push(marker);
    }

    var viewModel = {
        locations: ko.observableArray(locations),
        categories: ko.observableArray([
            'food',
            'fun',
            'bar'
        ]),        
        selectedCategory : ko.observable(),
        categoryHandler: function() {
            showSpots(this.selectedCategory());
        },
        chooseMarker: function() {
            var marker = this.marker;
            marker.setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout(function() {
                marker.setAnimation(null);
            }, 750);
            populateInfoWindow(marker, largeInfowindow);
        }
    };

    viewModel.filteredLocations = ko.dependentObservable(function() {
        var filter = this.selectedCategory();
        if (!filter) {
            return viewModel.locations();
        } else {
            return ko.utils.arrayFilter(this.locations(), function(location) {
                console.log(location + ' == ' + filter);
                return location.category == filter;
            });
        }
    }, viewModel);        

    ko.applyBindings(viewModel);

    showSpots();

    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new google.maps.Size(21, 34),
        new google.maps.Point(0, 0),
        new google.maps.Point(10, 34),
        new google.maps.Size(21,34));
        return markerImage;
    }

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });

            var url = venuesAPI + marker.fs + '?client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20170706';
            if (cache[url]) {
                setInfoWindow(cache[url], infowindow);
                infowindow.open(map, marker);                
            } else {
                $.getJSON(url, function(data) {
                    setInfoWindow(data.response.venue, infowindow);
                    cache[url] = data.response.venue;
                })
                .fail(function(e) {
                    infowindow.setContent('<p>Unable to retrieve information from Foursquare.</p>');
                })
                .always(function() {
                    infowindow.open(map, marker);
                });
            }
        }
    }

    function addMarkerListeners(marker) {
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            window.setTimeout(function() {
                marker.setAnimation(null);
            }, 750);
        });                    
        marker.addListener('mouseover', function() {
            this.setIcon(highlightedIcon);
        });
        marker.addListener('mouseout', function() {
            this.setIcon(defaultIcon);
        });      
    }

    function showSpots(category) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markers.length; i++) {
            if (category && markers[i].category != category) {
                markers[i].setMap(null);
            } else {
                markers[i].setMap(map);
                bounds.extend(markers[i].position);               
            }
        }
        map.fitBounds(bounds);
    }                

    function setInfoWindow(venue, infowindow) {
        var imgSrc = venue.bestPhoto.prefix + '100x100' + venue.bestPhoto.suffix;
        venue.rating = venue.rating || 'None';
        infowindow.setContent('<img class="infoWindow-image" src="' + imgSrc + '">' + 
            '<p class="infoWindow-title">' + venue.name + '</p>' +
            '<p class="infoWindow-detail infoWindow-subtitle">Foursquare Stats</p>' + 
            '<p class="infoWindow-detail">Rating: ' + venue.rating + '</p>' + 
            '<p class="infoWindow-detail">Checkins: ' + venue.stats.checkinsCount + '</p>'
        );
    }
}

function handleGoogleMapsError() {
	alert("There was an issue loading Google Maps. Please try refreshing the browser.");
}


