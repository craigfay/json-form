const http = require('@node-scarlet/http');
import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

const read = promisify(readFile);
const write = promisify(writeFile);

const keyFile = './.key';
const settingsFile = './.settings.json'

function editForm(json) {
  return `
    <link href="https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono&display=swap" rel="stylesheet">
    <style>
      * {
        font-family: 'Roboto', sans-serif;
        color: #777;
        font-size: 14px;
      }
      form {
        width: 40em;
      }
      form * {
        display: block;
        margin-bottom: 1em;
      }
      textarea {
        font-family: 'Roboto Mono', monospace;
        white-space: nowrap;
        height: 80vh;
        width: 100%;
      }
      button {
        padding: .5rem 1rem;
        width: 6rem;
        color: #777;
        border: .04rem solid #aaa;
        border-radius: .4rem;
      }
      #key-errors:not(:empty),
      #json-errors:not(:empty) {
        padding: 1rem;
        color: salmon;
        background-color: lavenderblush;
        border-radius: .4rem;
      }

    </style>
    <form onsubmit="handleSubmit(event)" method="POST">
      <input name="key" id="key" placeholder="key"/>
      <p id="key-errors"></p>
      <textarea name="json" id="json">${json}</textarea>
      <p id="json-errors"></p>
      <button>SAVE</button>
    </form>
    <script>
      const keyField = document.querySelector('#key');
      const keyErrors = document.querySelector('#key-errors');
      const jsonField = document.querySelector('#json');
      const jsonErrors = document.querySelector('#json-errors');

      keyField.addEventListener('keyup', validateKey);
      jsonField.addEventListener('keyup', validateJson);

      function validateKey() {
        if (keyField.value != '') {
          keyErrors.innerText = '';
          return true;
        } else {
          keyErrors.innerText = 'Key must be provided';
          return false;
        }
      }
      function validateJson() {
        try {
          JSON.parse(jsonField.value);
          jsonErrors.innerText = '';
          return true;
        } catch (error) {
          jsonErrors.innerText = error.message;
          return false;
        }
      }
      function handleSubmit(event) {
        if (validateKey() && validateJson()) return;
        event.preventDefault();
      }
    </script>
    `
}

// Respond with a form to edit the settings.json
async function getSettings(req?) {
  const json = await read(settingsFile, 'utf8');
  return editForm(json);
}

// Handle form submissions seeking to edit settings.json
async function saveSettings(req?) {
  const { key, json } = req.body;
  if (!json || !key)
  return 400; // Bad Request

  if (key != await read(keyFile, 'utf8'))
  return 401; // Unauthorized

  await write(settingsFile, json)
  return getSettings();
}

const s = http.server();
s.route('GET', '/settings.json', () => read(settingsFile, 'utf8'));
s.route('GET', '/*', getSettings);
s.route('POST', '/*', saveSettings);
s.listen(5000);
console.log('listening ...');
