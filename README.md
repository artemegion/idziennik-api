# API for idziennik (iuczniowie.progman.pl/idziennik)
This is a low level NodeJS API for idziennik (iuczniowie.progman.pl/idziennik) built on top of unirest library. It features Promise-based API and formats idziennik responses to more robust format.

## Install
```bash
npm install idziennik-api
```

## Build
You can build this module if you want to use the bleeding edge version. Although it may be unstable or have bugs it allows you to use newest features before official release. You need to have [NodeJS](https://nodejs.org/) installed in order to build the module.
* Clone the git repository
```bash
git clone https://github.com/legion44/idziennik-api
```
* Install required modules and build idziennik-api
```bash
npm install
npm run build
```

## License
MIT

THE SOFTWARE AND SOFTWARE AUTHOR ARE IN NO WAY AFFILIATED WITH, AUTHORIZED, MAINTAINED, SPONSORED OR ENDORSED BY THE WOLTERS KLUWER POLSKA SA OR ANY OF ITS AFFILIATES OR SUBSIDIARIES. THIS IS AN INDEPENDENT SOFTWARE.

## Example usage
```javascript
const idziennik = require('idziennik-api');
const readline = require('readline');
const fs = require('fs');

// read credentials from file and parse it to JSON
const credentials = JSON.parse(fs.readFileSync('./credentials.json'));

// these variables will be used to store session data
var session = {};
var aspxAuth = {};

idziennik.openSession()
.then(function(openSessionResponse)
{
    // assign session info to variables
    session.sessionId = openSessionResponse.sessionId; 
    session.aspxAuth = openSessionResponse.aspxAuth;

    // after opening session we can fetch captcha image, it will be Base64 encoded
    return idziennik.fetchCaptcha({ sessionId: session.sessionId });
})
.then(function(fetchCaptchaResponse)
{
    // ask user to enter captcha
    readline.question(fetchCaptchaResponse.captchaBase64 + ':', function(answer)
    {
        credentials.captcha = answer;

        idziennik.login({ sessionId: session.sessionId, aspxAuth: aspxAuth, credentials: credentials })
        .then(function(loginResponse)
        {
            if(loginResponse.authenticated)
            {
                // if successful, response will contains tokens needed to use rest of the API
                session.bearerToken = loginResponse.bearerToken;
                session.privateToken = loginResponse.privateToken;

                // if login is ok, we return fetch promise
                return idziennik.fetchStudentInfo({ session: session });
            }
            else
            {
                // if login failed, we return promise that is rejected, so code in following then() will not be executed
                return Promise.reject('Invalid credentials!');
            }
        })
        .then(function(studentInfo)
        {
            // should print student info to console
            console.dir(studentInfo);
        })
        .catch(function(reason)
        {
            // will print 'Invalid credentials!' to console
            console.error(reason);
        });
    });
});
```