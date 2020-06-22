module.exports = [
  {
    name: 'api',
    endpoint: '/api',
    methods: [
      'get'
    ]
  },
  {
    name: 'create',
    endpoint: '/api/create',
    methods: [
      'post'
    ],
    body: 'application/json',
    content: {
      id: "id or blank",
      url: "a proper url. required"
    }
  }
]