# OADA Open UI

## Running

To run the service locally, simply run the `generateConfig.sh` script, or use
it as a template to create your configuration file at `src/config.local.ts`.
Once the configuration file has been created, you can start the service by
running `npm i && npm start`. Note that due to CORS restrictions, the provided
configuration values will require the service to be hosted on
`http://localhost:3000` as it is by default, or the use of an additional
service such as
[local-cors-proxy](https://www.npmjs.com/package/local-cors-proxy).
