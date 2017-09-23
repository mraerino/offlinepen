self.importScripts('node_modules/dexie/dist/dexie.min.js');

var db;
function getDb() {
  if (!db) {
    db = new Dexie('offlinepen_preview');
    db.version(1).stores({
      pen_content: 'id'
    });
  }
  return db;
}

const errorTemplate = message =>
`<!doctype html>

<html>
<head>
  <meta charset="utf-8">
  <title>${message}</title>
  <style>
    .error {
      border: 1px solid red;
      margin: 5px;
      padding: 7px;
      font-weight: bold;
      color: red;
      background: lightred;
    }
  </style>
</head>
<body>
  <div class="error">${message}</div>
</body>
</html>`;

self.addEventListener('fetch', function(event) {
  if(event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  if(['p.offlinepen.space', 'localhost'].indexOf(url.hostname) !== -1 && url.pathname.startsWith('/s/')) {
    const db = getDb();
    const id = url.pathname.split('/')[2];
    event.respondWith(
      db.pen_content.get(id)
        .then(pen => {
          if(!pen) {
            throw new Error("Pen not found!");
          }
          return pen.content;
        })
        .catch(e => errorTemplate(e.message))
        .then(html => new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' }}))
    );
  }
});
