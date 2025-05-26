// TODO: use environment variables

// const apiBaseUrl = 'https://jsonplaceholder.typicode.com'
// const apiBaseUrl = 'https://localhost:7238/api'
const apiBaseUrl = 'http://note.ap-southeast-1.elasticbeanstalk.com/api'

export default {
    apiBaseUrl: apiBaseUrl,
    // apiUrl: `${apiBaseUrl}/posts`,
    apiUrl: `${apiBaseUrl}/Notes`,
};