import { getState, setState } from "./storage"

/**
 * Logs a new activity to the activityLog in chrome.storage.
 * @param {object} activity - The activity object to log.
 * @prop {string} activity.site - The site the activity relates to.
 * @prop {number} activity.timestamp - The timestamp of the activity.
 * @prop {string} activity.action - The type of action taken (e.g., 'continued_mindfully', 'took_break').
 * @prop {string} [activity.intention] - The user's stated intention, if applicable.
 * @prop {string} [activity.breakActivity] - The chosen break activity, if applicable.
 */
export const logActivity = async activity=>{
    try{
        const {activityLog=[]} = await getState("activityLog");
        const newLog = [activity, ...activityLog].slice(0,100);
        await setState({activityLog:newLog});
    } catch (error) {
        console.error(error);
    }
}
