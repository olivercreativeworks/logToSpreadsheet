# spreadsheetLogger
This script writes log messages to a spreadsheet. It is meant for logging messages from doPost requests.


## How to use
Copy the code into your project.

#### Write to the log
```javascript
const logger = SpreadsheetLogger
// collect some messages to be appended to the log later
logger.write('Hello world')
logger.write('It is a good day!')
logger.write('Bye bye!')
```

#### Commit to the log
```javascript 
// call commit to actually append the messages to the log
const logSheet = SpreadsheetApp.openById(YOUR-SPREADSHEET-ID).getSheetByName(YOUR-LOG-SHEET-NAME)
const lock = LockService.getScriptLock()
logger.commitToLog(logSheet, lock) 
``` 
