function getJobScheduler(){
  const props = PropertiesService.getScriptProperties()
  const jobsSymbol = 'jobs'

  return {
    scheduleJob: scheduleJob,
    deleteScheduledJob: deleteScheduledJob
  }
  /** 
   * Schedules a one time job using an [installable clock trigger](https://developers.google.com/apps-script/guides/triggers/installable).
   * 
   * The job should be a function in the global scope and the first parameter is a [clock trigger event object](https://developers.google.com/apps-script/guides/triggers/events#time-driven-events)  
   * 
   * The job should also include a call to delete the scheduled job (see example below). 
   * 
   * **Note:** If a job is already scheduled, it will not be scheduled again. You will need to delete the existing job first.
   * 
   * ```
   * // schedule a job
   * getScheduler().scheduleJob({job: myScheduledFunction.name, minutesFromNow: 5})
   * 
   * // e is the clock trigger event object
   * function myScheduledFunction(e){
   *    // Delete the job (e.triggerUid is the same as the jobId)
   *    getScheduler().deleteScheduledJob(e.triggerUid) 
   *    // The rest of your code
   * }
   * ```
   * 
   * @param {object} details
   * @param {string} details.job The name of the function you want to schedule. It should accept an event object as the first parameter and include a call to delete the scheduled job.
   * @param {number} details.minutesFromNow - How many minutes from the time this function is called you want the function to run.
   */   
  function scheduleJob({job, minutesFromNow}){
    if(isScheduled(job)) return
    const scheduledJob = createJob(job, minutesFromNow)
    saveJob(job, scheduledJob.getUniqueId(), minutesFromNow)
    console.log(`Created scheduled job with id: ${scheduledJob.getUniqueId()}`)
    return scheduledJob
  }

  /** @param {string} jobName */
  function isScheduled(jobName){
    const jobDetails = getScheduledJobDetails().get(jobName)
    return jobDetails && !!(getJobById(jobDetails.jobId)) && !isOutdated(jobDetails.date)
  }
  
  /**
   * @param {string} job
   * @param {number} minutesFromNow
   */
  function createJob(job, minutesFromNow){
    return ScriptApp.newTrigger(job)
      .timeBased()
      .after(1000 * 60 * minutesFromNow)
      .create()
  }

  /** @return {Map<string, JobDetails>} */
  function getScheduledJobDetails(){
    return new Map(JSON.parse(props.getProperty(jobsSymbol)))
  }

  /**
   * @typedef JobDetails
   * @property {string} jobId The clock-trigger id for the job
   * @property {string} date The date the job is set to run by. Represented as a string
   */

  /** @param {string | number | Date} jobRunDate */
  function isOutdated(jobRunDate){
    return new Date() > new Date(jobRunDate)
  }

  /**
   * @param {number} minutesFromNow 
   */
  function saveJob(job, jobId, minutesFromNow){
    const now = new Date()
    const jobDetails =  {
      jobId:jobId, 
      date:new Date(new Date(now).setMinutes(now.getMinutes() + minutesFromNow)).toString(),
    }
    props.setProperty(jobsSymbol, JSON.stringify(Array.from(getScheduledJobDetails().set(job, jobDetails))))
  }
  
  /**
   * You should call this method from inside of the scheduled job and provide the event object's triggerUid as an argument 
   * #### Example usage
   * ```
   * // schedule a job
   * getScheduler().scheduleJob({job: myScheduledFunction.name, minutesFromNow: 5})
   * 
   * // e is the clock trigger event object
   * function myScheduledFunction(e){
   *    // Delete the job (e.triggerUid is the same as the jobId)
   *    getScheduler().deleteScheduledJob(e.triggerUid) 
   *    // The rest of your code
   * }
   * ```
   * @param {string} jobId The id of the job you want to delete. This will match one of your project's script trigger ids
   */
  function deleteScheduledJob(jobId){
    const job = getJobById(jobId)
    if(job) ScriptApp.deleteTrigger(job)
    deleteJob(getJobName(jobId))
    console.log('Deleted schedule')
  }

  /** @param {string} id */
  function getJobById(id){
    return ScriptApp.getProjectTriggers().find(trigger => trigger.getUniqueId() === id)    
  }
  /** @param {string} jobName */
  function deleteJob(jobName){
    const scheduledJobs = getScheduledJobDetails()
    if(scheduledJobs.delete(jobName)){
      props.setProperty(jobsSymbol, JSON.stringify(Array.from(scheduledJobs)))
    }
    if(JSON.parse(props.getProperty(jobsSymbol)).length === 0) props.deleteProperty(jobsSymbol)
  }
  /** @param {string} id */
  function getJobName(id){
    const job = Array.from(getScheduledJobDetails()).find(([jobName, jobDetails]) => jobDetails.jobId === id) 
    return job ? job[0] : undefined
  }
}