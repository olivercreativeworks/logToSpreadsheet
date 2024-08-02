function getLog(){
  const props = PropertiesService.getScriptProperties()
  const spreadsheetIdSymbol =  'spreadsheet'
  const sheetIdSymbol = 'sheet'
  const log = getLogSheet()
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

  function getLogSheet(){
    const spreadsheet = getSpreadsheet()
    const sheetId = JSON.parse(props.getProperty(sheetIdSymbol))
    return spreadsheet.getSheets().find(sheet => sheet.getSheetId() === sheetId) || createLoggingSheet(spreadsheet)
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