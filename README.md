# OfflinePen

*Notice: This is an experiment and may not be ready for production use. Especially since not all browsers support the Service Worker spec as of wrinting this.*

OfflinePen is an attempt at building a frontend web (HTML, JS, CSS) editor with a preview that works completely offline after the first load. It makes heavy use of the [Service Worker](https://developer.mozilla.org/docs/Web/API/Service_Worker_API) and [IndexedDB](https://developer.mozilla.org/docs/Web/API/IndexedDB_API) APIs and also presented me with a way to get used to these technologies.

You can try it out at [offlinepen.space](https://offlinepen.space) :rocket:

## Why

I like the idea of using the power of Service Workers to serve sites, that never were present on a server. This also enables users of the tool to use their standard web tooling (DevTools) on mocks they are building without having to be online since the content served from the Service Worker looks like a standard web page to the browser and feels like that.

## How

The application basicly consists of two parts: The **editor interface** and the **preview**.

### Editor Interface

The editor frontend is a basic Polymer web application which uses Ace Editor for code inputs. The projects are persisted to IndexedDb automatically and therefore only live on the users machine. IndexedDb gives me the power to potentially fetch even big projects in a small time because of the efficient querying capabilities.

### Preview pane

This is the exciting part. On the first load a special Service Worker is installed to the users browser, whose only purpose is to serve the code the user entered into the editor. It intercepts every request to the path `/s/:penId`, fetches the project's content from IndexedDb and serves them to the user's browser as an HTML response.

### Security

Because we are acepting any input into the code editors we want to make sure users can not do any harm when potentially injecting javascript code that is presented on our domain. Otherwise they may be able to have access to and alter database entries directly.

To prevent any weird injections I made use of the fact that a subdomain is a different origin and therefore does not have access to the scope of the main domain, e.g. it's IndexedDb databases or cache storage. Previews, which present the code entered by the user, are only served from the subdomain `p.offlinepen.space` and the Preview Service Worker is only present on that domain.

The only problem: Since the origin is different not even the Service Worker is able to get the code from the DB to serve it to the user. I worked around this by using a hidden iframe in the editor pane, that lives on `p.offlinepen.space`, will accept content through the [PostMessage API](https://developer.mozilla.org/docs/Web/API/Window/postMessage) and persist it to the IndexedDb on the subdomain. The Service Worker can then serve previews from that store. This is a neat way to have controlled interactions between different origins. I just wish you did not have to use an iframe for this :see_no_evil:

## Features

- Create projects
- Edit HTML, CSS, JS of those projects
- Preview the result in a pane or in a new tab

### Browser support

To be able to use this meaningfully, the user's browser must support the [Service Worker API (caniuse.com)](http://caniuse.com/#feat=serviceworkers). Currently it includes these:

- Chrome (> 40)
- Firefox (> 44)
- Opera (> 27)
- Android Browser (since Android 5)
- Chrome for Android (> 40)

The biggest one missing here is Safari, where Service Workers are ["in development"](https://webkit.org/status/#specification-service-workers).

### Roadmap (maybe)

- Import from/Export to Github Gists
- Share/Sync projects between hosts through WebRTC
- Edit entire projects (with directory structure and everything)

## Running this yourself

### Dependencies

Dependencies are pulled via [yarn](https://yarnpkg.com) and bower, but the bower install is a postinstall hook, so just run:

```bash
$ npm i -g yarn # if not present
$ yarn
```

### Development

There is no build step needed for development, since I am using the platform, so you can serve this with any static webserver, that has a SPA fallback to `index.html` for non-existing paths. Since it is required for the build, I recommend [polymer-cli](https://www.polymer-project.org/2.0/docs/tools/polymer-cli).

```bash
$ polymer serve
```

### Production

The build uses a combination of [polymer-cli](https://www.polymer-project.org/2.0/docs/tools/polymer-cli) and gulp, but you can just run this:

```bash
$ yarn run build
```

## Credits

Built with the following great libraries:

- [Polymer](https://www.polymer-project.org/) - UI library
- [Ace Editor](https://ace.c9.io/) - Code editor
- [Dexie](http://dexie.org/) - IndexedDb layer
- [Cuid](https://github.com/ericelliott/cuid) - ID generation
- [sw-precache](https://github.com/GoogleChromeLabs/sw-precache) - Service Worker generation

## License

This project is licensed under the MIT License.
See [LICENSE](/LICENSE) file for more.
