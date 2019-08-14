const http = require('@node-scarlet/http');
import { readFile, writeFile } from 'fs'
import { promisify } from 'util'

const read = promisify(readFile);
const write = promisify(writeFile);

const keyFile = './.key';
const settingsFile = './.settings.json';
const settingsForm = './index.html';


// Handle form submissions seeking to edit settings.json
async function saveSettingsHandler(req?) {
  const { key, json } = req.body;
  if (!json || !key)
  return 400; // Bad Request

  if (key != await read(keyFile, 'utf8'))
  return 401; // Unauthorized

  write(settingsFile, json);
  return read(settingsForm, 'utf8');
}

const s = http.server();
s.route('GET', '/settings.json', () => read(settingsFile, 'utf8'));
s.route('GET', '/*', () => read(settingsForm, 'utf8'));
s.route('POST', '/*', saveSettingsHandler);
s.listen(5000);
console.log('listening ...');
