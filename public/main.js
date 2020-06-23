const app = new Vue({
  el: '#app',
  data: {
    response: '',
    id: null,
    url: null,
    created: false,
    error: false,
    visible: true
  },
  methods: {
    async addNewURL() {
      this.error = '';
      fetch('/api/create', {
        method: 'POST',
        body: JSON.stringify({
          url: this.url,
          id: this.id || undefined
        }),
        headers: {
          'content-type': 'application/json'
        }
      })
        .then(
          (response) => {
            if (response.ok)
              return response.json()
            else
              throw response.status;
          })
        .then(
          (json) => {
            this.created = 'http://localhost:8080/' + json.identifier;
            this.visible = false;
          })
        .catch(
          (error) => {
            if (error.toString() == "429") {
              this.error = "You're being rate limited, Please try again later."
            } else this.error = error;
            this.visible = false;
          });
    }
  }
});