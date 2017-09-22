self.importScripts('node_modules/dexie/dist/dexie.js');

var db;
function getDb() {
  if (!db) {
    db = new Dexie('offlinepen');
    db.version(1).stores({
      pens: 'id, name, updatedAt',
      files: 'id, pen_id, name'
    });
  }
  return db;
}

const indent = (text, size) => text.split('\n').join(`\n${' '.repeat(size*2)}`);

const previewTemplate = ({ html = "", css = "", js = "", title = "OfflinePen" }) =>
`<!doctype html>

<html>
<head>
  <meta charset="utf-8">

  <title>${title} - OfflinePen</title>
  <meta name="generator" content="OfflinePen">

  <style>
    ${indent(css,2)}
  </style>
</head>
<body>
  ${indent(html,1)}

  <script>
    ${indent(js,2)}
  <\/script>
</body>
</html>`;

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
    const props = {};
    event.respondWith(
      db.pens.get(id)
        .then(pen => {
          if(!pen) {
            throw new Error("Pen not found!");
          }
          props.title = pen.name;
        })
        .then(() => db.files.where('pen_id').equals(id).each(file => {
          const [name, type] = file.name.split('.');
          if(name !== 'index') {
            return;
          }
          props[type] = file.content;
        }))
        .then(() => previewTemplate(props))
        .catch(e => errorTemplate(e.message))
        .then(html => new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' }}))
    );
  }
});
