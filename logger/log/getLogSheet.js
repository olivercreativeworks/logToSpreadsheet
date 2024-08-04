function getLogSheet(){
  const props = PropertiesService.getScriptProperties()
  const spreadsheetIdSymbol =  'spreadsheet'
  const sheetIdSymbol = 'sheet'
  const spreadsheet = getSpreadsheet()
  const sheetId = JSON.parse(props.getProperty(sheetIdSymbol))
  const log = spreadsheet.getSheets().find(sheet => sheet.getSheetId() === sheetId) || createLoggingSheet(spreadsheet)
  return {
    append: append
  }
  /**
   * @param {LogMessage[]} messages
   */
  function append(messages){
    log.getRange(log.getLastRow() + 1, 1, messages.length, 2)
      .setValues(messages)
  }

  function getSpreadsheet(){
    const id = props.getProperty(spreadsheetIdSymbol)
    const sheet = id ? SpreadsheetApp.openById(id) : createNewSpreadsheet()
    console.log(sheet.getUrl())
    return sheet
  }
  function createNewSpreadsheet(){
    const ss = SpreadsheetApp.create('Auto sync calendars - logs')
    props.setProperty(spreadsheetIdSymbol, ss.getId())
    createLoggingSheet(ss)
    return ss
  }
  /** @param {SpreadsheetApp.Spreadsheet} spreadsheet */
  function createLoggingSheet(spreadsheet){
    const sheet = spreadsheet.insertSheet('Logs', 0).appendRow(['Date', 'Message'])
    props.setProperty(sheetIdSymbol, JSON.stringify(sheet.getSheetId()))
    return sheet
  }
}   