module.exports = [{
  // help
  name: 'help',
  query: '?help=1',
  operation: 'GET'
}, { // secrets
  name: 'read',
  operation: 'GET'
}, {
  name: 'write',
  operation: 'PUT'
}, {
  name: 'list',
  operation: 'LIST'
}, {
  name: 'delete',
  operation: 'DELETE'
}]
