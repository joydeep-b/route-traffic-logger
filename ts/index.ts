import { Request, Response } from 'express'; // For response and request object autocomplete
import * as express from 'express'; // for routing different links
import * as bodyParser from 'body-parser'
import * as compression from 'compression'
import * as fs from 'fs'
import * as https from 'https'
import * as csv from 'csv-writer'

const logger = csv.createObjectCsvWriter({
  path: 'log.csv',
  header: [
    {id: 'startTime', title: 'Start Time'},
    {id: 'endTime', title: 'End Time'},
    {id: 'summary', title: 'Summary'},
    {id: 'distance', title: 'Distance'},
    {id: 'duration', title: 'Duration'},
    {id: 'json', title: 'JSON'}
  ]
});

function log(res: any) {
  // console.log(res);
  const timeNow = new Date().toLocaleString('en-GB', { timeZone: 'America/Chicago' });
  console.log(`
    Summary: ${res.routes[0].summary}
    Distance: ${res.routes[0].legs[0].distance.text}
    Duration: ${res.routes[0].legs[0].duration.text}`
  );
  logger.writeRecords([
    {
      startTime: timeNow,
      endTime: 0,
      summary: res.routes[0].summary,
      distance: res.routes[0].legs[0].distance.text,
      duration: res.routes[0].legs[0].duration.text,
      json: JSON.stringify(res)
    }
  ]).then(() => {
    console.log('Log saved.');
  });
}

function main(args : string[]) : number {
  if (args.length !== 5) {
    console.error('Usage: logger start-loc end-loc google-api-key');
    return 1;
  }
  const startLoc = args[2];
  const destLoc = args[3];
  const apiKey = args[4];
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${startLoc}&destination=${destLoc}&key=${apiKey}`;
  
  https.get(url, (res) => {
    let body = '';
    res.on('data', (d) => {
      body += d;
    });
    res.on('end', () => {
      let res = JSON.parse(body);
      log(res);
    });
  }).on('error', (e) => {
    console.error(e);
  });

  return 0;
}

const retVal = main(process.argv);
if (retVal !== 0) {
  process.exit(retVal);
}

