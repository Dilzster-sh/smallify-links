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
      const resp = await fetch('/new', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          url: this.url,
          id: this.id || undefined
        })
      });
      if (resp.ok) {
        const result = await resp.json();
        this.visible = false;
        this.created = 'http://localhost:8080/' + result.identifier;
      }
      else {
        const result = await resp.json();
        this.error = result.message;
      }
    }
  }
});