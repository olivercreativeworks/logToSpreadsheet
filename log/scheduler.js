function getJobScheduler_(){
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
   * **Note:** You can only schedule one job with a particular name at a time. If you want to remove an existing job, you'll need to delete it first.
   * 
   * ```
   * // schedule a job
   * getScheduler().scheduleJob({jobName: myScheduledFunction.name, minutesFromNow: 5})
   * 
   * // e is the clock trigger event object
   * function myScheduledFunction(e){
   *    // Delete the job (e.triggerUid is the same as the jobId)
   *    getScheduler().deleteScheduledJob(e.triggerUid) 
   *    // The rest of your code
   * }
   * ```
   * 
   * @param {object} scheduleDetails
   * @param {string} scheduleDetails.jobName The name of the function you want to schedule. It should accept an event object as the first parameter and include a call to delete the scheduled job.
   * @param {number} scheduleDetails.minutesFromNow - How many minutes from the time this function is called you want the function to run.
   */   
  function scheduleJob({jobName, minutesFromNow}){
    if(isScheduled(jobName)){
      console.warn(`The job, ${jobName} is already scheduled.`)
      return
    }
    const scheduledJob = createJob(jobName, minutesFromNow)
    saveJobDetails(jobName, scheduledJob.getUniqueId(), minutesFromNow)
    console.log(`Created scheduled job with id: ${scheduledJob.getUniqueId()}`)
    return scheduledJob
  }

  /** 
   * Returns true if there is an existing clock trigger for this job.
   * @param {string} jobName The name of the function you want to schedule.
   */
  function isScheduled(jobName){
    const jobDetails = getScheduledJobDetails().get(jobName)
    return jobDetails && !!(getJobById(jobDetails.jobId)) && !isOutdated(jobDetails.date)
  }

  /** 
   * Maps jobs to their details. The keys are the job names and the values are the job details.
   * @return {Map<string, JobDetails>} 
   */
  function getScheduledJobDetails(){
    return new Map(JSON.parse(props.getProperty(jobsSymbol)))
  }
  
  /**
   * @typedef JobDetails
   * @property {string} jobId The clock-trigger id for the job
   * @property {string} date The date the job is set to run by. Represented as a string
   */ 
  
  /** @param {JobDetails["jobId"]} id */
  function getJobById(id){
    return ScriptApp.getProjectTriggers().find(trigger => trigger.getUniqueId() === id)    
  }  

  /** @param {JobDetails["date"]} jobRunDate */
  function isOutdated(jobRunDate){
    return new Date() > new Date(jobRunDate)
  }
  
  /**
   * Creates a clock-based trigger to run the scheduled function.
   * @param {string} jobName The name of the function you want to schedule.
   * @param {number} minutesFromNow How many minutes from the time this function is called you want the function to run.
   */
  function createJob(jobName, minutesFromNow){
    return ScriptApp.newTrigger(jobName)
      .timeBased()
      .after(1000 * 60 * minutesFromNow)
      .create()
  }

  /**
   * Saves job details to the property service.
   * @param {string} jobName The name of the function you want to schedule. 
   * @param {string} jobId The clock-trigger id for the job
   * @param {number} minutesFromNow 
   */
  function saveJobDetails(jobName, jobId, minutesFromNow){
    const now = new Date()
    const jobDetails =  {
      jobId:jobId, 
      date:new Date(new Date(now).setMinutes(now.getMinutes() + minutesFromNow)).toString(),
    }
    props.setProperty(jobsSymbol, JSON.stringify(Array.from(getScheduledJobDetails().set(jobName, jobDetails))))
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
   * @param {JobDetails["jobId"]} jobId The id of the job you want to delete. This will match one of your project's script trigger ids
   */
  function deleteScheduledJob(jobId){
    const job = getJobById(jobId)
    if(job) ScriptApp.deleteTrigger(job)
    deleteJobDetails(getJobName(jobId))
    console.log('Deleted scheduled job')
  }

  /** @param {string} jobName */
  function deleteJobDetails(jobName){
    const scheduledJobs = getScheduledJobDetails()
    if(scheduledJobs.delete(jobName)){
      overwriteScheduledJobDetails(scheduledJobs)
    }
  }
  /** 
   * @param {Map<string, JobDetails>} updatedScheduledJobDetails 
   */
  function overwriteScheduledJobDetails(updatedScheduledJobDetails){
    props.setProperty(jobsSymbol, JSON.stringify(Array.from(updatedScheduledJobDetails)))
  }
  
  /** @param {JobDetails["jobId"]} id */
  function getJobName(id){
    const job = Array.from(getScheduledJobDetails()).find(([jobName, jobDetails]) => jobDetails.jobId === id) 
    return job ? job[0] : undefined
  }
}