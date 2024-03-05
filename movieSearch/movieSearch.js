import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import Movie_Channel from '@salesforce/messageChannel/movieChannel__c';

const DELAY = 500;

export default class MovieSearch extends LightningElement {

    selectedType = "";
    loading = false;
    selectedSearch = "";
    selectedPageNo = "1";
    delayTimeout;
    searchResult = [];
    selectedMovie = "";

    @wire(MessageContext)
    messageContext;

    get typeOptions() {
        return [
            { label: 'None', value: '' },
            { label: 'Movie', value: 'movie' },
            { label: 'Series', value: 'series' },
            { label: 'Episode', value: 'episode' },
        ];
    }

    handleChange(event) {
        let { name, value } = event.target;
        this.loading = true;
        if (name === "type") {
            this.selectedType = value;
        }
        else if (name === "search") {
            this.selectedSearch = value;
        }
        else if (name === "pageno") {
            this.selectedPageNo = value;
        }
        //Debouncing to make less Api Calls
        clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            this.searchMovie();
        }, DELAY);

    }

    //this method will search for the enterd movie  
    async searchMovie() {
        const url = `https://www.omdbapi.com/?s=${this.selectedSearch}&type=${this.selectedType}&page=${this.selectedPageNo}&apikey=9203e1e8`;
        const res = await fetch(url);
        const data = await res.json();
        this.loading = false;
        console.log("Movie Search Output", data);
        if (data.Response === 'True') {
            this.searchResult = data.Search;
        }
    }

    movieSelectedHandler(event) {
        this.selectedMovie = event.detail;

        const payload = { movieId: this.selectedMovie };

        publish(this.messageContext, Movie_Channel, payload);
    }

    get displaySearchResult() {
        return this.searchResult.length > 0 ? true : false;
    }

}